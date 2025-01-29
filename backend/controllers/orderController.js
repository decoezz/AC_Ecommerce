const AppError = require('../utils/Error Handeling utils/appError');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const AC = require('../models/acModel');
const ApiFeatures = require('../utils/apiFeatures');
const {
  getOrdersLastMonth,
  getOrdersLastWeek,
  getOrdersToday,
} = require('../utils/dateFunctions');
const {
  validateOrderData,
} = require('../utils/Data Validation utils/validateOrderData');
const {
  validateUpdateOrderData,
} = require('../utils/Data Validation utils/validateOrderData');
//Getting a certain User orders
exports.getUsersOrders = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById(userId).populate({
    path: 'orders.orderId',
    select: 'products totalAmount orderedAt',
  });
  if (!user) {
    return next(
      new AppError('There is no User with this ID,Please try again', 400)
    );
  }
  if (!user.orders || user.orders.length === 0) {
    return next(new AppError('No orders found for this user', 400));
  }
  res.status(200).json({
    status: 'success',
    message: 'Orders found successfully',
    data: {
      orders: user.orders,
    },
  });
});
//Getting all Orders in Month
exports.getOrderLastMonth = catchAsync(async (req, res, next) => {
  const orders = await getOrdersLastMonth();
  if (!orders || orders.length === 0) {
    return next(
      new AppError('There is no Orders available.Please try again later', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Orders found successfully',
    results: orders.length,
    data: {
      orders,
    },
  });
});
//Getting all Orders in Week
exports.getOrderLastWeek = catchAsync(async (req, res, next) => {
  const orders = await getOrdersLastWeek();
  if (!orders || orders.length === 0) {
    return next(
      new AppError('There is no Orders available.Please try again later', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Orders found successfully',
    results: orders.length,
    data: {
      orders,
    },
  });
});
//Getting all Orders in Day
exports.getOrderToday = catchAsync(async (req, res, next) => {
  const orders = await getOrdersToday();
  if (!orders || orders.length === 0) {
    return next(
      new AppError('There is no Orders available.Please try again later', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Orders found successfully',
    results: orders.length,
    data: {
      orders,
    },
  });
});
//Getting all orders in general
exports.getOrders = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Order.find(), req.query)
    .filter()
    .sort()
    .limitFields();
  await features.paginate();
  const orders = await features.query;
  if (!orders || orders.length === 0) {
    return next(
      new AppError('There is no Orders available.Please try again later', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Orders found successfully.',
    results: orders.length,
    data: orders,
  });
});
//Getting a certain order
exports.getOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(
      new AppError('There is no Order with this ID.Please try again later', 404)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Order found Successfully',
    data: { order },
  });
});
//Create an Order
exports.createOrder = catchAsync(async (req, res, next) => {
  // Validate request data
  const userId = req.user.id;
  validateOrderData(req.body);
  const { items, shippingAddress, mobileNumber, orderStatus } = req.body;
  // Start a session for transaction
  const session = await Order.startSession();
  session.startTransaction();
  try {
    // Check if all items are in stock
    for (const item of items) {
      const product = await AC.findById(item.ac).session(session);
      if (!product) {
        throw new AppError(`Product with ID ${item.ac} not found`, 404);
      }
      if (!product.inStock || product.quantityInStock < item.quantity) {
        throw new AppError(
          `Product ${product.modelNumber} is out of stock or does not have enough quantity.`,
          400
        );
      }
      item.modelNumber = product.modelNumber;
    }
    // Calculate total amount
    const totalAmount = items.reduce(
      (total, item) => total + item.quantity * item.priceAtPurchase,
      0
    );
    // Reduce stock for each item
    for (const item of items) {
      const product = await AC.findById(item.ac).session(session);
      if (!product || product.quantityInStock < item.quantity) {
        throw new AppError(
          `Product ${product.modelNumber} does not have enough stock.`,
          400
        );
      }
      // Reduce stock
      await AC.updateOne(
        { _id: item.ac },
        { $inc: { quantityInStock: -item.quantity, unitSold: item.quantity } },
        { session }
      );
    }
    // Create new order inside the transaction
    const order = await Order.create(
      [
        {
          user: userId,
          items,
          shippingAddress,
          mobileNumber,
          orderStatus,
          totalAmount,
        },
      ],
      { session }
    );
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    user.purshacedAc.push({ items });
    await user.save();
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      status: 'success',
      message: 'Order Placed Successfully',
      data: { order },
    });
  } catch (error) {
    // If any error occurs, rollback transaction
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});
//Get My own User Orders
exports.GetMyOrders = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError('There is no User with this ID.Please try again later', 404)
    );
  }
  const orders = await Order.findOne({ user: user });
  if (!orders || orders.length === 0) {
    return next(
      new AppError(
        'There is no Orders in this User.Please try again later',
        404
      )
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'Orders found successfully',
    results: orders.length,
    data: { orders },
  });
});
//Editting an Order
exports.updateOrder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { shippingAddress, mobileNumber, items } = req.body;
  validateUpdateOrderData(req.body);
  const session = await Order.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(id).session(session);
    if (!order) {
      throw new AppError(`Order with ID ${id} not found`, 404);
    }
    if (req.user.role === 'user' && order.user.toString() !== req.user.id) {
      return next(
        new AppError('You do not have permission to update this order', 403)
      );
    }
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (mobileNumber) order.mobileNumber = mobileNumber;
    if (items && items.length > 0) {
      for (const newItem of items) {
        const orderItem = order.items.find(
          (item) => item.ac.toString() === newItem.ac
        );
        if (!orderItem) {
          return next(
            new AppError(
              `Product with ID ${newItem.ac} is not in this order`,
              400
            )
          );
        }
        const product = await AC.findById(newItem.ac).session(session);
        if (!product) {
          return next(
            new AppError(`Product with ID ${newItem.ac} not found`, 404)
          );
        }
        const quantityDifference = newItem.quantity - orderItem.quantity;
        if (
          quantityDifference > 0 &&
          product.quantityInStock < quantityDifference
        ) {
          return next(
            new AppError(
              `Not enough stock for ${product.modelNumber}. Available: ${product.quantityInStock}`,
              400
            )
          );
        }
        await AC.findByIdAndUpdate(
          newItem.ac,
          { $inc: { quantityInStock: -quantityDifference } },
          { session }
        );
        orderItem.quantity = newItem.quantity;
        orderItem.modelNumber = product.modelNumber;
      }
    }
    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      status: 'success',
      message: 'Order updated successfully',
      data: { order },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});
//Deleteing an Order
exports.DeleteOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(
      new AppError('There is no Order with this ID.Please try again later', 400)
    );
  }
  if (req.user.role === 'user' && order.user.toString() !== req.user.id) {
    return next(
      new AppError('You do not have permission to update this order', 403)
    );
  }
  await Order.deleteOne({ _id: orderId });
  res.status(204).json({
    status: 'success',
    message: 'Order Deleted successfully',
    data: null,
  });
});
//Getting a User Order Using Mobile Number
exports.getOrderByMobileNumber = catchAsync(async (req, res, next) => {
  let { mobileNumber } = req.params;
  if (!mobileNumber) {
    return next(new AppError('Please provide a mobile number', 400));
  }
  // Normalize: Convert to stored format (remove +20 and add leading 0)
  if (mobileNumber.startsWith('+20')) {
    mobileNumber = '0' + mobileNumber.slice(3); // Convert +201111257571 -> 01111257571
  }
  const order = await Order.findOne({ mobileNumber: mobileNumber });
  if (!order) {
    return next(
      new AppError(
        'There is no Order with this Mobile Number.Please try again later',
        404
      )
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'AC Found Successfully',
    data: { order },
  });
});
//Change order Status
exports.ChangeOrderStatus = catchAsync(async (req, res, next) => {
  const { orderStatus } = req.body;
  const orderId = req.params.id;
  const order = await Order.findById(orderId);

  if (!order) {
    return next(
      new AppError('There is no Order with this ID.Please try again later', 404)
    );
  }
  order.orderStatus = orderStatus;
  await order.save();
  res.status(200).json({
    status: 'success',
    messsage: 'Order Status changed successfully',
    data: {
      order,
    },
  });
});
