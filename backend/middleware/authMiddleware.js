const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/Error Handeling utils/appError');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');
const User = require('../models/userModel');

//Protect Routes Middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //extract token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') //this one is for using the api direclty
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt; //this one is for the actual web
  }
  if (!token || token === 'loggedout') {
    return next(
      new AppError('You are not logged in!.Please log in to access', 401)
    );
  }
  //verify JWT token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //Find user and check if they still exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401)
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});
//restrict access to certain routes based on role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have premission to perform this action', 403)
      );
    }
    next();
  };
};

/**
 * Check if User is Logged In (For Frontend Views)
 * Does not block access but makes user info available.
 */
exports.isLoggedIn = async (req, res, next) => {
  if (!req.cookies.jwt) {
    return next();
  }
  const decoded = await promisify(jwt.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next();
  }
  res.locals.user = currentUser;
  return next();
};
