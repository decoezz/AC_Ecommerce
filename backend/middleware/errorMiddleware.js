const path = require('path');
const AppError = require('../utils/Error Handeling utils/appError');
const errorHandlers = require('../utils/Error Handeling utils/errorHandlers');
/**
 * Send Error in Development
 */
const sendErrorDev = (err, req, res) => {
  const statusCode = err.statusCode || 500; // Fallback to 500
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    return res
      .status(err.statusCode)
      .sendFile(path.join(__dirname, '../../frontend/error.html'));
  }
};
/**
 * Send Error in Production
 */
const sendErrorProd = (err, req, res) => {
  const statusCode = err.statusCode || 500; // Fallback to 500
  if (err.isOperational) {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      return res
        .status(err.statusCode)
        .sendFile(path.join(__dirname, '../../frontend/error.html'));
    }
  } else {
    console.error('ERROR 💥', err);
    if (req.originalUrl.startsWith('/api')) {
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong',
      });
    }
    return res
      .status(500)
      .sendFile(path.join(__dirname, '../../frontend/500.html'));
  }
};
/**
 * Global Error Handling Middleware
 */
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };
    // Specific Error Handlers
    if (err.name === 'CastError')
      error = errorHandlers.handleCastErrorDB(error);
    if (err.code === 11000) error = errorHandlers.handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError')
      error = errorHandlers.handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError')
      error = errorHandlers.handleJWTError();
    if (err.name === 'TokenExpiredError')
      error = errorHandlers.handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
