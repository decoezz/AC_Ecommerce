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

exports.handlePaymobPayment = catchAsync(async (req, res, next) => {
  try {
    const { orderId } = req.body;
    console.log('Starting payment process for order:', orderId);

    // Validate environment variables
    if (!process.env.PAYMOB_API_KEY) {
      console.error('PAYMOB_API_KEY is missing');
      return next(new AppError('Payment configuration error', 500));
    }
    if (!process.env.PAYMOB_INTEGRATION_ID) {
      console.error('PAYMOB_INTEGRATION_ID is missing');
      return next(new AppError('Payment configuration error', 500));
    }
    if (!process.env.PAYMOB_IFRAME_ID) {
      console.error('PAYMOB_IFRAME_ID is missing');
      return next(new AppError('Payment configuration error', 500));
    }

    // Find and validate order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return next(new AppError('Order not found', 404));
    }
    console.log('Found order:', order._id);

    // Step 1: Authentication
    let authToken;
    try {
      console.log('Authenticating with Paymob...');
      const authResponse = await axios.post(
        'https://accept.paymob.com/api/auth/tokens',
        {
          api_key: process.env.PAYMOB_API_KEY,
        }
      );
      authToken = authResponse.data.token;
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication failed:', error.response?.data || error);
      return next(new AppError('Payment authentication failed', 500));
    }

    // Step 2: Order Registration
    let paymobOrderId;
    try {
      console.log('Registering order with Paymob...');
      const orderData = {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(order.totalAmount * 100),
        currency: 'EGP',
        items: order.items.map((item) => ({
          name: item.modelNumber || 'Product',
          amount_cents: Math.round(item.priceAtPurchase * 100),
          quantity: item.quantity,
          description: item.modelNumber || 'Product Description',
        })),
      };
      console.log('Order registration payload:', orderData);

      const orderResponse = await axios.post(
        'https://accept.paymob.com/api/ecommerce/orders',
        orderData
      );
      paymobOrderId = orderResponse.data.id;
      console.log('Order registered with Paymob, ID:', paymobOrderId);
    } catch (error) {
      console.error(
        'Order registration failed:',
        error.response?.data || error
      );
      return next(
        new AppError('Failed to register order with payment provider', 500)
      );
    }

    // Step 3: Payment Key Generation
    let paymentKey;
    try {
      console.log('Generating payment key...');
      const paymentKeyData = {
        auth_token: authToken,
        amount_cents: Math.round(order.totalAmount * 100),
        expiration: 3600,
        order_id: paymobOrderId,
        billing_data: {
          apartment: 'NA',
          email: req.user?.email || 'customer@email.com',
          floor: 'NA',
          first_name: req.user?.name || 'Customer',
          last_name: 'Customer',
          street: order.shippingAddress || 'NA',
          building: 'NA',
          phone_number: order.mobileNumber,
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Cairo',
          country: 'EG',
          state: 'NA',
        },
        currency: 'EGP',
        integration_id: parseInt(process.env.PAYMOB_INTEGRATION_ID),
      };
      console.log('Payment key request payload:', paymentKeyData);

      const paymentKeyResponse = await axios.post(
        'https://accept.paymob.com/api/acceptance/payment_keys',
        paymentKeyData
      );
      paymentKey = paymentKeyResponse.data.token;
      console.log('Payment key generated successfully');
    } catch (error) {
      console.error(
        'Payment key generation failed:',
        error.response?.data || error
      );
      return next(new AppError('Failed to generate payment key', 500));
    }

    // Generate final payment URL
    try {
      const paymentUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`;
      console.log('Payment URL generated:', paymentUrl);

      // Update order with Paymob reference
      await Order.findByIdAndUpdate(orderId, {
        merchantOrderId: paymobOrderId,
        paymentStatus: 'pending',
      });

      return res.status(200).json({
        status: 'success',
        data: {
          paymentUrl,
        },
      });
    } catch (error) {
      console.error('Final step failed:', error);
      return next(new AppError('Failed to complete payment setup', 500));
    }
  } catch (error) {
    console.error('Unexpected error in payment process:', error);
    return next(
      new AppError(`Payment processing failed: ${error.message}`, 500)
    );
  }
});
