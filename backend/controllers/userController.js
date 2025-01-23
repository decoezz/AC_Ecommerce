const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

const singToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//Create and Send JWT Token
const createSendToken = (user, statusCode, res) => {
  const token = singToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

//User Signup
exports.signup = catchAsync(async (req, res, next) => {
  const { name, mobileNumber, email, password, passwordConfirm } = req.body;
  if (!email || !name || !mobileNumber || !password || !passwordConfirm) {
    return next(new AppError('All fields are required', 400));
  }
  const user = await User.create({
    role: 'user',
    name,
    mobileNumber,
    email,
    password,
    passwordConfirm,
  });
  createSendToken(user, 201, res);
});

//User login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

//Signup for employees
exports.SignupEmployee = catchAsync(async (req, res, next) => {
  const { name, mobileNumber, email, password, passwordConfirm } = req.body;
  if (!email || !name || !mobileNumber || !password || !passwordConfirm) {
    return next(new AppError('All fields are required', 400));
  }
  const user = await User.create({
    role: 'employee',
    name,
    mobileNumber,
    email,
    password,
    passwordConfirm,
  });
  createSendToken(user, 201, res);
});

//Log out User
exports.logout = catchAsync(async (req, res, next) => {
  // Ensure user is authenticated before allowing logout
  if (!req.cookies.jwt || req.cookies.jwt === 'loggedout') {
    return next(new AppError('You are not logged in!', 401));
  }
  // Invalidate the JWT by setting an expired cookie
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true, // Prevents client-side JS access
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
  });
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});
