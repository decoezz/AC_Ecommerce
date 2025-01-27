const updateOrderSchema = Joi.object({
  shippingAddress: Joi.string().optional().messages({
    'string.base': 'Shipping Address must be a string.',
  }),

  mobileNumber: Joi.string()
    .pattern(/^(\+201|01)\d{9}$/)
    .optional()
    .messages({
      'string.base': 'Mobile number must be a string.',
      'string.pattern.base':
        'Mobile number must be an 11-digit number, starting with 01 or +20.',
    }),

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
      })
    )
    .optional()
    .messages({
      'array.base': 'Items must be an array.',
    }),
});

const validateUpdateOrderData = (data) => {
  const { error } = updateOrderSchema.validate(data, { abortEarly: false });

  if (error) {
    throw new AppError(error.details.map((err) => err.message).join(' '), 400);
  }
};

module.exports = { validateUpdateOrderData };
