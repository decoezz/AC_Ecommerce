const Joi = require('joi');
const AppError = require('../Error Handeling utils/appError');

const productSchema = Joi.object({
  brand: Joi.string().required().messages({
    'string.base': 'Brand must be a string.',
    'any.required': 'Brand is required.',
  }),

  modelNumber: Joi.string().required().messages({
    'string.base': 'Model Number must be a string.',
    'any.required': 'Model Number is required.',
  }),
  powerConsumption: Joi.number().positive().required().messages({
    'number.base': 'Power Consumption must be a number.',
    'number.positive': 'Power Consumption must be greater than 0.',
    'any.required': 'Power Consumption is required.',
  }),

  price: Joi.number().positive().min(100).required().messages({
    'number.base': 'Price must be a number.',
    'number.positive': 'Price must be greater than 0.',
    'number.min': 'Price must be at least 100.',
    'any.required': 'Price is required.',
  }),

  features: Joi.array().items(Joi.string()).max(10).messages({
    'array.base': 'Features must be an array.',
    'array.max': 'Features cannot have more than 10 items.',
  }),

  inStock: Joi.boolean().required().messages({
    'boolean.base': 'InStock must be a boolean value.',
    'any.required': 'InStock is required.',
  }),
  quantityInStock: Joi.number().positive().min(1).max(500).required().messages({
    'number.base': 'quantity must be a number.',
    'number.positive': 'quantity must be greater than 0.',
    'number.min': 'quantity must be at least 1.',
    'number.max': "quantity can't be more than 500",
    'any.required': 'quantity is required.',
  }),
  coolingCapacitiy: Joi.string().required().messages({
    'string.base': 'Cooling Capacity must be a string.',
    'any.required': 'Cooling Capacity is required.',
  }),
});

const validateProductData = (data) => {
  const { error } = productSchema.validate(data, { abortEarly: false });

  if (error) {
    throw new AppError(error.details.map((err) => err.message).join(' '), 400);
  }
};

module.exports = { validateProductData };
