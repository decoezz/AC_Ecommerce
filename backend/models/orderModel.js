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
        return /^(\+20)?\d{10}$/.test(value);
      },
      message:
        'Mobile number must be a valid 10-digit number with an optional +20 country code',
    },
  },
  orderStatus: {
    type: String,
    required: true,
    deafult: 'on hold',
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
