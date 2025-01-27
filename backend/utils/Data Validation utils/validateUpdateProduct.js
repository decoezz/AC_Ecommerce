const Joi = require('joi');
const AppError = require('../Error Handeling utils/appError');

const updateProductSchema = Joi.object({
  brand: Joi.string().messages({ 'string.base': 'Brand must be a string.' }),

  modelNumber: Joi.string().messages({
    'string.base': 'Model Number must be a string.',
  }),

  powerConsumption: Joi.number().positive().messages({
    'number.base': 'Power Consumption must be a number.',
    'number.positive': 'Power Consumption must be greater than 0.',
  }),

  price: Joi.number().positive().min(100).messages({
    'number.base': 'Price must be a number.',
    'number.positive': 'Price must be greater than 0.',
    'number.min': 'Price must be at least 100.',
  }),

  features: Joi.array().items(Joi.string()).max(10).messages({
    'array.base': 'Features must be an array.',
    'array.max': 'Features cannot have more than 10 items.',
  }),

  inStock: Joi.boolean().messages({
    'boolean.base': 'InStock must be a boolean value.',
  }),

  quantityInStock: Joi.number().positive().min(1).max(500).messages({
    'number.base': 'Quantity must be a number.',
    'number.positive': 'Quantity must be greater than 0.',
    'number.min': 'Quantity must be at least 1.',
    'number.max': "Quantity can't be more than 500.",
  }),

  coolingCapacitiy: Joi.string().messages({
    'string.base': 'Cooling Capacity must be a string.',
  }),
}).min(1);

const validateUpdateProduct = (data) => {
  const { error, value } = updateProductSchema.validate(data, {
    abortEarly: false,
  });
  if (error) {
    throw new AppError(error.details.map((err) => err.message).join(' '), 400);
  }
  return value;
};

module.exports = { validateUpdateProduct };
