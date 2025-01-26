const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      ac: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AC',
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        required: true,
      },
      priceAtPurchase: {
        type: Number,
        required: true,
      },
    },
  ],
  shippingAddress: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (value) {
        return /^(\+201|01)\d{9}$/.test(value);
      },
      message:
        'Mobile number must be an 11-digit number, starting with 01 or +20.',
    },
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['on hold', 'processing', 'shipped', 'delivered', 'canceled'],
    default: 'on hold',
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  purchasedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Order', orderSchema);
