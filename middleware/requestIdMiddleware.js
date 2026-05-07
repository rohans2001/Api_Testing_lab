const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

/**
 * Assigns a unique UUID to each request and tracks response time
 */
const requestIdMiddleware = (req, res, next) => {
  req.id = uuidv4();
  res.setHeader('X-Request-Id', req.id);
  
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: 'Request Completed',
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: duration,
      user: req.user ? req.user.id : 'unauthenticated'
    });
    
    if (duration > 2000) {
      logger.warn({
        message: 'Slow Request Detected',
        requestId: req.id,
        durationMs: duration,
        url: req.originalUrl
      });
    }
  });

  next();
};

module.exports = { requestIdMiddleware };
