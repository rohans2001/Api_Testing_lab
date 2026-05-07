const { sendError } = require('../utils/responseUtils');

// In-memory store for demonstration. In production, use Redis.
const idempotencyStore = new Map();

/**
 * Idempotency Middleware
 * Prevents duplicate POST/PATCH requests if Idempotency-Key header is provided.
 */
const idempotencyMiddleware = (req, res, next) => {
  if (req.method !== 'POST' && req.method !== 'PATCH') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return next();
  }

  if (idempotencyStore.has(idempotencyKey)) {
    const cachedResponse = idempotencyStore.get(idempotencyKey);
    return res.status(cachedResponse.status).json(cachedResponse.body);
  }

  // Intercept the response to save it
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    idempotencyStore.set(idempotencyKey, { status: res.statusCode, body });
    // Cleanup after 1 hour
    setTimeout(() => idempotencyStore.delete(idempotencyKey), 3600000);
    return originalJson(body);
  };

  next();
};

module.exports = { idempotencyMiddleware };
