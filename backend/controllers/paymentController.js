const axios = require('axios');
const Order = require('../models/orderModel');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');
const AppError = require('../utils/Error Handeling utils/appError');

exports.initiatePayment = catchAsync(async (req, res, next) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  const totalAmount = order.totalAmount * 100; //Convert to cents
  //Authenticate with paymob

  const authResponse = await axios.post(
    'https://accept.paymob.com/api/auth/tokens',
    { api_key: process.env.PAYMOB_API_KEY }
  );
  const authToken = authResponse.data.token;
  //Create Paymob Order
  const orderResponse = await axios.post(
    'https://accept.paymob.com/api/ecommerce/orders',
    {
      auth_token: authToken,
      delivery_needed: false,
      amount_cents: totalAmount,
      currency: 'EGP',
      items: order.items.map((item) => ({
        name: item.modelNumber,
        amount_cents: item.priceAtPurchase * 100,
        quantity: item.quantity,
      })),
    }
  );
  const paymobOrderId = orderResponse.data.id;
  //Create Payment Key
  const paymentKeyResponse = await axios.post(
    'https://accept.paymob.com/api/acceptance/payment_keys',
    {
      auth_token: authToken,
      amount_cents: totalAmount,
      expiration: 3600,
      order_id: paymobOrderId,
      billing_data: {
        first_name: req.user.name,
        last_name: req.user.name,
        phone_number: order.mobileNumber,
        email: req.user.email,
        street: order.shippingAddress,
        city: 'Cairo',
        country: 'EG',
        building: order.shippingAddress,
        floor: order.shippingAddress,
        apartment: order.shippingAddress,
      },
      currency: 'EGP',
      integration_id: process.env.PAYMOB_INTEGRATION_ID,
    }
  );
  const paymentKey = paymentKeyResponse.data.token;
  const paymentLink = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
  res.status(200).json({
    status: 'success',
    message: 'Payment link generated',
    data: { paymentLink },
  });
});

exports.paymentCallBack = catchAsync(async (req, res, next) => {
  const { orderId, success, payment_reference } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  if (success === 'true') {
    (order.orderStatus = 'Paid'), (order.merchantOrderId = payment_reference);
    await order.save();
    res.status(200).json({
      status: 'success',
      message: 'payment completed',
    });
  } else {
    order.orderStatus = 'on hold';
    await order.save();
    res.status(200).json({
      status: 'Failed',
      message: 'payment failed',
    });
  }
});
