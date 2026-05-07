const { sendError } = require('../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Standardizes express-validator results to match enterprise error format
 */
const validateSchema = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errorCode: 'VALIDATION_ERROR',
      message: 'Invalid request payload',
      details: errors.array()
    });
  }
  next();
};

module.exports = { validateSchema };
