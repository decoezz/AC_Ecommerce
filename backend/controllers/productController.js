const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const AC = require('../models/acModel');
const Review = require('../models/reviewModel');
const { validateProductData } = require('../utils/validateProductData');
const validateObjectId = require('../utils/validateObjectId ');
const checkProductExists = require('../utils/checkProductExists');
const { validateUpdateProduct } = require('../utils/validateUpdateProduct');
exports.createProduct = catchAsync(async (req, res, next) => {
  validateProductData(req.body);
  const { modelNumber } = req.body;
  const existingProduct = await AC.findOne({ modelNumber });
  if (existingProduct) {
    return next(new AppError('Model Number must be unique', 400));
  }
  const product = await AC.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { product },
  });
});

exports.getAllProducts = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(AC.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  await features.paginate(); // Execute pagination (this method is async)
  // Execute final query
  const products = await features.query;
  if (!products || products.length === 0) {
    return next(
      new AppError(
        'There is no ACS available right now.Please try again later',
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    totalResults: features.totalCount, // Returns total items available
    results: products.length,
    data: { products },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const acId = req.params.id;
  // Validate if the ID is a valid MongoDB ObjectId
  validateObjectId(acId);
  const Ac = await AC.findById(acId);
  if (!Ac) {
    return next(
      new AppError(
        `There no AC with this ID : ${acId}.Please try again later`,
        400
      )
    );
  }
  res.status(200).json({
    status: 'success',
    data: { Ac },
  });
});

exports.UpdateProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  validateObjectId(productId);
  checkProductExists(productId);
  const validateData = validateUpdateProduct(req.body);
  const newProduct = await AC.findByIdAndUpdate(productId, validateData, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    message: 'Product updated successfully',
    data: {
      newProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const productId = req.params.id;
  validateObjectId(productId);
  checkProductExists(productId);
  await AC.deleteOne({ _id: productId });
  res.status(204).json({
    status: 'success',
    message: 'Product Deleted successfully',
    data: null,
  });
});


