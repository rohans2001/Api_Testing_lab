const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/responseUtils');

const featureFlags = {
  ENABLE_NEW_CHECKOUT: process.env.ENABLE_NEW_CHECKOUT === 'true',
  MAINTENANCE_MODE: process.env.ENABLE_MAINTENANCE_MODE === 'true',
  USE_GRAPHQL: true
};

router.get('/', (req, res) => {
  sendSuccess(res, 200, 'Feature flags retrieved', featureFlags);
});

router.patch('/', (req, res) => {
  // Simulating runtime toggle
  if (req.user.role !== 'admin') {
    return sendError(res, 403, 'Requires admin role to modify feature flags');
  }

  const { flag, enabled } = req.body;
  if (featureFlags[flag] !== undefined) {
    featureFlags[flag] = enabled;
    
    // Specifically sync maintenance mode to env var for the middleware
    if (flag === 'MAINTENANCE_MODE') {
      process.env.ENABLE_MAINTENANCE_MODE = enabled ? 'true' : 'false';
    }

    return sendSuccess(res, 200, `Feature flag ${flag} updated`, featureFlags);
  }

  sendError(res, 400, 'Unknown feature flag');
});

module.exports = router;
