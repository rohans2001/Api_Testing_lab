const { validationResult } = require('express-validator');

/**
 * Validates request based on express-validator rules
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        message: 'Validation Error',
        details: errors.array()
      }
    });
  }
  next();
};

module.exports = { validate };
