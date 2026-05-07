const express = require('express');
const router = express.Router();
const thirdPartyController = require('../controllers/thirdPartyMockController');

// Simulates external integrations for testing resilience
router.post('/stripe', thirdPartyController.mockStripePayment);
router.post('/email', thirdPartyController.mockEmailProvider);
router.post('/sms', thirdPartyController.mockSmsProvider);

module.exports = router;
