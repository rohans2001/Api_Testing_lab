const express = require('express');
const router = express.Router();
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { delay } = require('../utils/delayUtils');

// Simulate internal microservice communications and cascading failures
router.get('/order-service/:id', async (req, res) => {
  // Simulate hitting an internal auth service, then payment service, then order service
  const { cascade } = req.query;

  if (cascade === 'true') {
    // Simulate cascading failure
    await delay(1000); // Wait for auth
    await delay(2000); // Wait for payment
    return sendError(res, 504, 'Internal Service Timeout - Payment service failed to respond');
  }

  // Simulate success
  await delay(500);
  sendSuccess(res, 200, 'Order service data retrieved via gateway', { service: 'order-service', id: req.params.id });
});

router.get('/inventory-service', async (req, res) => {
  if (Math.random() < 0.3) {
    return sendError(res, 503, 'Inventory Service Unavailable');
  }
  sendSuccess(res, 200, 'Inventory data', { items: 100 });
});

module.exports = router;
