const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseUtils');

/**
 * Validates request based on express-validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 400, 'Validation Error', errors.array());
  }
  next();
};

module.exports = { validate };
