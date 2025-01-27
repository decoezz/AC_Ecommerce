const catchAsync = require('./Error Handeling utils/catchAsync');
const AppError = require('./Error Handeling utils/appError');
const AC = require('../models/acModel');
const checkProductExists = catchAsync(async (id) => {
  const product = await AC.findById(id);
  if (!product) {
    throw new AppError(`No product found with ID: ${id}`, 404);
  }
  return product;
});
module.exports = checkProductExists;
