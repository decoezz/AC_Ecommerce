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
