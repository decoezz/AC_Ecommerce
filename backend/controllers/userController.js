const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/Error Handeling utils/catchAsync');
const AppError = require('../utils/Error Handeling utils/appError');
const ApiFeatures = require('../utils/apiFeatures');
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
//Get All Users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .sort()
    .filter()
    .limitFields();
  await features.paginate();

  const users = await features.query;
  if (!users || !users.length === 0) {
    return next(
      new AppError(
        'There is no users in the database.Please try again later',
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    totalResults: features.totalCount,
    results: users.length,
    data: { users },
  });
});
//Get certain User
exports.getUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findOne({ _id: userId }).select('-password');
  if (!user || user.role === 'Admin' || user.role === 'employee') {
    return next(
      new AppError('There is no user with this ID.Please try again later', 400)
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'user found successfully',
    data: {
      user,
    },
  });
});
//Get Ceratin User by Mobile Number
exports.getUserByNumber = catchAsync(async (req, res, next) => {
  let { mobileNumber } = req.params;
  if (!mobileNumber) {
    return next(new AppError('Please provide a mobile number', 400));
  }
  // Ensure the number starts with +20
  if (!mobileNumber.startsWith('+20')) {
    mobileNumber = `+2${mobileNumber}`;
  }
  const user = await User.findOne({ mobileNumber: mobileNumber });
  if (!user) {
    return next(
      new AppError(
        'There is no user with this Mobile Number.Please try again later',
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    message: 'User found successfully',
    data: { user },
  });
});
//Delete Certain User
exports.DeleteUser = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const user = await User.findById({ _id: userId });
  if (!user) {
    return next(
      new AppError(
        `There is no user with this ID${userId}.Please try again later`,
        400
      )
    );
  }
  await User.deleteOne({ _id: userId });
  res.status(204).json({
    status: 'success',
    message: 'User deleted successfully',
    data: null,
  });
});
//Getting the current user details
exports.me = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password')
    .populate('likedProducts');
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
//Uploading profile photo
exports.uploadUserPhoto = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await User.findById(userId);
  if (!user) {
    return next(
      new AppError('There is no User with this ID.Please try again later', 404)
    );
  }
  if (!req.file || !req.file.path) {
    return next(new AppError('No image uploaded', 400));
  }
  if (user.profilePicture && !user.profilePicture.includes('placeholder.com')) {
    try {
      const publicId = user.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`users/${publicId}`);
    } catch (err) {
      console.error('Failed to delete old profile picture:', err);
    }
  }
  user.profilePicture = req.file.path;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Profile picture uploaded successfully',
    profilePicture: user.profilePicture,
  });
});
//Getting Liked Products by current user
exports.likedProduct = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('likedProducts');
  if (!user) {
    return next(
      new AppError(
        'There was a problem with your user.Please try again later',
        404
      )
    );
  }
  const likedProducts = user.likedProducts;
  if (!likedProducts || likedProducts === 0) {
    return next(new AppError('There is no liked Products for this user', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Liked Product retrived successfully',
    results: likedProducts.length,
    data: { likedProducts },
  });
});
