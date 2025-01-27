const AppError = require('../Error Handeling utils/appError');
const Joi = require('Joi');
const orderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        ac: Joi.string().required().messages({
          'string.base': 'AC ID must be a string.',
          'any.required': 'AC ID is required.',
        }),
        quantity: Joi.number().positive().min(1).required().messages({
          'number.base': 'Quantity must be a number.',
          'number.positive': 'Quantity must be greater than 0.',
          'number.min': 'Quantity must be at least 1.',
          'any.required': 'Quantity is required.',
        }),
        priceAtPurchase: Joi.number().positive().required().messages({
          'number.base': 'Price must be a number.',
          'number.positive': 'Price must be greater than 0.',
          'any.required': 'Price is required.',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.base': 'Items must be an array.',
      'array.min': 'Order must have at least one item.',
      'any.required': 'Items are required.',
    }),

  shippingAddress: Joi.string().required().messages({
    'string.base': 'Shipping Address must be a string.',
    'any.required': 'Shipping Address is required.',
  }),

  mobileNumber: Joi.string()
    .pattern(/^(\+201|01)\d{9}$/)
    .required()
    .messages({
      'string.base': 'Mobile number must be a string.',
      'string.pattern.base':
        'Mobile number must be an 11-digit number, starting with 01 or +20.',
      'any.required': 'Mobile number is required.',
    }),

  orderStatus: Joi.string()
    .valid('on hold', 'processing', 'shipped', 'delivered', 'canceled')
    .default('on hold')
    .messages({
      'string.base': 'Order status must be a string.',
      'any.only':
        'Order status must be one of: on hold, processing, shipped, delivered, canceled.',
    }),
});

const validateOrderData = (data) => {
  const { error } = orderSchema.validate(data, { abortEarly: false });

  if (error) {
    throw new AppError(error.details.map((err) => err.message).join(' '), 400);
  }
};

module.exports = { validateOrderData };
