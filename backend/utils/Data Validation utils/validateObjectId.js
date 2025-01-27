const mongoose = require('mongoose');
const AppError = require('../Error Handeling utils/appError');

const validateObjectId = (req, res, next) => {
  // ✅ Ensure req.params.id exists before validating
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError(`Invalid mongoose ID: ${req.params.id}`, 400));
  }
  next();
};

module.exports = validateObjectId;
