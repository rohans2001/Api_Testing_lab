const { sendError } = require('../utils/responseUtils');

/**
 * Simulates server maintenance mode
 */
const maintenanceMiddleware = (req, res, next) => {
  const isMaintenanceMode = process.env.ENABLE_MAINTENANCE_MODE === 'true';
  
  if (isMaintenanceMode && !req.originalUrl.includes('/api/admin')) {
    return sendError(res, 503, 'Service is currently down for maintenance. Please try again later.', { errorCode: 'MAINTENANCE_MODE' });
  }
  
  next();
};

module.exports = { maintenanceMiddleware };
