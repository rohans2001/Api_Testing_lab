/**
 * Simulates server maintenance mode
 */
const maintenanceMiddleware = (req, res, next) => {
  const isMaintenanceMode = process.env.ENABLE_MAINTENANCE_MODE === 'true';
  
  if (isMaintenanceMode && !req.originalUrl.includes('/api/admin')) {
    return res.status(503).json({
      success: false,
      errorCode: 'MAINTENANCE_MODE',
      message: 'Service is currently down for maintenance. Please try again later.'
    });
  }
  
  next();
};

module.exports = { maintenanceMiddleware };
