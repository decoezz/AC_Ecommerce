const Cart = require('../models/cartModel');
const AC = require('../models/acModel');
const AppError = require('../utils/Error Handeling utils/appError');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');

//Get the user's cart
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    'Items.product'
  );
  if (!cart || cart.length === 0) {
    return next(new AppError('Cart not found or empty', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Cart retrived successfully',
    data: { cart },
  });
});

//Add an item to the cart
exports.addItemToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;
  const product = await AC.findById(productId);
  if (!product) {
    return next(new AppError('Product not found', 404));
  }
  if (!product.inStock || product.quantityInStock < quantity) {
    return next(
      new AppError(
        'Product is out of stock or does not have enough quantity',
        400
      )
    );
  }
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, Items: [] });
  }
  const itemIndex = cart.Items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex >= 0) {
    cart.Items[itemIndex].quantity += quantity;
  } else {
    cart.Items.push({
      product: productId,
      quantity,
      priceAtTimeOfAddition: product.price,
    });
  }
  cart.totalPrice = cart.Items.reduce(
    (total, item) => total + item.quantity * item.priceAtTimeOfAddition,
    0
  );
  await cart.save();
  res.status(200).json({
    status: 'success',
    message: 'Cart retrived successfully',
    data: { cart },
  });
});

//Update the quantity of a specific cart item
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const productId = req.params.productId;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }
  const itemIndex = cart.Items.findIndex(
    (item) => item.product.toString() === productId
  );
  if (itemIndex < 0) {
    return next(new AppError('Item not found in cart', 404));
  }
  cart.Items[itemIndex].quantity = quantity;
  cart.totalPrice = cart.Items.reduce(
    (total, item) => total + item.quantity * item.priceAtTimeOfAddition,
    0
  );
  await cart.save();
  res.status(200).json({
    status: 'success',
    data: { cart },
  });
});
//Remove a specific item from the cart
exports.removeCartItem = catchAsync(async (req, res, next) => {
  const productId = req.params.productId;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }
  // Find the index of the item in the cart using productId
  const itemIndex = cart.Items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex < 0) {
    return next(new AppError('Item not found in cart', 404));
  }
  cart.Items.splice(itemIndex, 1);
  cart.totalPrice = cart.Items.reduce(
    (total, item) => total + item.quantity * item.priceAtTimeOfAddition,
    0
  );
  await cart.save();
  res.status(204).json({
    status: 'success',
    message: 'Item got removed from the cart',
    data: null,
  });
});
//Clear the entire cart
exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { Items: [], totalPrice: 0 },
    { new: true }
  );
  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }
  res.status(204).json({
    status: 'success',
    message: 'Cart Cleared Successfully',
    data: null,
  });
});
