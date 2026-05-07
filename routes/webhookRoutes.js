const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

const { protect } = require('../middleware/authMiddleware');

// Webhooks usually don't use standard JWT auth for incoming events
router.post('/payment', webhookController.handlePaymentWebhook);

// Admin route to check webhook logs and DLQ
router.get('/logs', protect, webhookController.getWebhookLogs);

module.exports = router;
