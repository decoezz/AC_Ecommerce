const express = require('express');
const morgan = require('morgan');
const hpp = require('hpp');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const globalErrorHandler = require('./middleware/errorMiddleware');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const app = express();
//All the utils needed for security and other utils
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(mongoSanitize());
app.use(cookieParser());
app.use(hpp({ whitelist: ['sort', 'filter'] }));
// Log incoming requests
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});
// Serve Static files like images
app.use(express.static(path.join(__dirname, 'public')));
//Using rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,please try again in an hour!',
});
app.use('/api', limiter);
app.use(express.json({ limit: '10kb' }));
//Set up routes
app.use('/api/v1/users', userRouter);
//Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`can\'t find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
