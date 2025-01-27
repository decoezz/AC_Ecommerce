class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode; // Default to 500 if undefined
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
