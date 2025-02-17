const mongoose = require('mongoose');
const { resolve } = require('path');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 30,
      trim: true,
      validate: {
        validator: function (value) {
          return /^[A-Za-z\s]+$/.test(value); // Allows letters and spaces
        },
        message: 'Name must only contain alphabetic characters and spaces',
      },
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return /^(\+201|01)\d{9}$/.test(value);
        },
        message:
          'Mobile number must be a valid 9-digit number with an optional +20 country code',
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, 'An Email must be entered correctly'],
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            value
          );
        },
        message:
          'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
      },
    },
    role: {
      type: String,
      enum: ['user', 'employee', 'Admin'],
      required: true,
      default: 'user',
    },
    active: { type: Boolean, default: true, select: false },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    createdAt: { type: Date, default: Date.now },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords do not match!',
      },
      select: false,
    },

    address: {
      type: String,
      default: 'suez',
    },
    profilePicture: {
      type: String,
      default: 'https://via.placeholder.com/150',
    },
    purchasedAC: [
      {
        items: [
          {
            ac: { type: mongoose.Schema.Types.ObjectId, ref: 'AC' },
            quantity: Number,
            priceAtPurchase: Number,
          },
        ],
      },
    ],
    orders: [
      {
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        orderedAt: { type: Date, default: Date.now },
      },
    ],
    likedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AC',
        default: null,
      },
    ],
  },
  {
    versionKey: false,
  }
);
//Hash the password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
//Password comparison
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compare(candidatePassword, userPassword);
};
//Password change check
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }); //this is so that the active or not accounts could appear in the database
  next();
});
const User = mongoose.model('User', userSchema);
module.exports = User;
