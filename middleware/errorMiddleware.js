const logger = require('../utils/logger');

/**
 * Centralized enterprise error handling
 */
const errorMiddleware = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  const errorResponse = {
    success: false,
    requestId: req.id,
    errorCode: err.code || 'INTERNAL_ERROR',
    message: err.message,
    details: err.details || null,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  };

  logger.error({
    message: 'Request Error',
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: err.stack
  });

  res.status(statusCode).json(errorResponse);
};

module.exports = { errorMiddleware };
