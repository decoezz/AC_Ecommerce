const express = require('express');
const axios = require('axios');
const paymentController = require('../controllers/paymentController');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
// Route for initiating the payment process
router.post('/initiate-payment', protect, paymentController.initiatePayment);
// Route for handling payment callback from Paymob
router.post('/payment-callback', protect, paymentController.paymentCallBack);
// Add the new paymob route
router.post('/paymob', protect, paymentController.handlePaymobPayment);

module.exports = router;
