const Joi = require('joi');

// Joi schema for updating user data
const updateUserData = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .regex(/^[A-Za-z\s]+$/, 'alphabetic characters and spaces')
    .messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least {#limit} characters long',
      'string.max': 'Name must be at most {#limit} characters long',
      'string.pattern.base':
        'Name must only contain alphabetic characters and spaces',
    }),
  email: Joi.string().email().messages({
    'string.base': 'Email must be a string',
    'string.email': 'Email must be a valid email address',
  }),
  mobileNumber: Joi.string()
    .regex(/^(\+201|01)\d{9}$/, 'valid Egyptian mobile number')
    .messages({
      'string.base': 'Mobile number must be a string',
      'string.pattern.base':
        'Mobile number must be a valid 9-digit number with an optional +20 country code',
    }),
  password: Joi.string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'password validation'
    )
    .messages({
      'string.base': 'Password must be a string',
      'string.pattern.base':
        'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)',
    }),
  passwordConfirm: Joi.string().valid(Joi.ref('password')).messages({
    'string.base': 'Password confirmation must be a string',
    'any.only': 'Passwords do not match',
  }),
  currentPassword: Joi.string().messages({
    'string.base': 'Current password must be a string',
  }),
});

module.exports = {
  updateUserData,
};
