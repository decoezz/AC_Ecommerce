const mongoose = require('mongoose');
const AppError = require('../utils/appError');

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(`Invalid product ID: ${id}`, 400);
  }
};

module.exports = validateObjectId;
