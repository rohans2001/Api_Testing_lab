const rateLimit = require('express-rate-limit');

/**
 * Advanced Rate Limiting
 */
const defaultRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: (req, res) => {
    if (req.user && req.user.role === 'admin') return 0; // unlimited
    if (req.user) return 100; // user limit
    return 20; // guest limit
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    errorCode: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests, please try again later'
  }
});

module.exports = { rateLimitMiddleware: defaultRateLimit };
