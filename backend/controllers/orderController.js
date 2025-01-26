const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Order = require('../models/orderModel');
const AC = require('../models/acModel');
const { validateProductData } = require('../utils/validateProductData');
const validateObjectId = require('../utils/validateObjectId ');
const checkProductExists = require('../utils/checkProductExists');
const { validateUpdateProduct } = require('../utils/validateUpdateProduct');
const {
  getOrdersLastMonth,
  getOrdersLastWeek,
  getOrdersToday,
} = require('../utils/dateFunctions');
const { validateOrderData } = require('../utils/validateOrderData');
//Getting User orders
exports.getUsersOrders = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  validateObjectId(userId);
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
  const orders = await Order.find();
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
  validateObjectId(orderId);
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
    }
    // Calculate total amount
    const totalAmount = items.reduce(
      (total, item) => total + item.quantity * item.priceAtPurchase,
      0
    );
    // Reduce stock for each item
    for (const item of items) {
      const product = await AC.findById(item.ac).session(session);
      // Double-check stock inside the transaction
      if (!product || product.quantityInStock < item.quantity) {
        throw new AppError(
          `Product ${product.modelNumber} does not have enough stock.`,
          400
        );
      }
      // Reduce stock
      await AC.findByIdAndUpdate(
        item.ac,
        { $inc: { quantityInStock: -item.quantity } },
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
