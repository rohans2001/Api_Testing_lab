const { sendError } = require('../utils/responseUtils');
const { validationResult } = require('express-validator');

/**
 * Standardizes express-validator results to match enterprise error format
 */
const validateSchema = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Invalid request payload', errors.array());
  }
  next();
};

module.exports = { validateSchema };
