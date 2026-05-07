const { sendSuccess, sendError } = require('../utils/responseUtils');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { delay } = require('../utils/delayUtils');

const dlq = [];

const handlePaymentWebhook = async (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  
  if (!signature) {
    return sendError(res, 401, 'Missing webhook signature');
  }
  
  // Simulate signature verification
  const expectedSignature = crypto.createHmac('sha256', 'webhook_secret').update(JSON.stringify(req.body)).digest('hex');
  
  if (signature !== expectedSignature && signature !== 'test_signature') {
    logger.warn(`Invalid webhook signature received: ${signature}`);
    return sendError(res, 401, 'Invalid webhook signature');
  }

  // Simulate processing failures and retries
  if (req.body.event === 'payment_failed' && Math.random() < 0.5) {
    logger.error('Webhook processing failed, moving to Dead Letter Queue');
    dlq.push({ payload: req.body, timestamp: new Date().toISOString() });
    return sendError(res, 500, 'Internal processing error, will retry later');
  }

  // Simulate exponential backoff processing delay if requested
  if (req.query.simulate_retry === 'true') {
    await delay(1000); // 1st retry
    logger.info('Retrying webhook...');
    await delay(2000); // 2nd retry
  }

  logger.info('Webhook processed successfully');
  sendSuccess(res, 200, 'Webhook received and processed');
};

const getWebhookLogs = (req, res) => {
  sendSuccess(res, 200, 'Webhook logs retrieved', { deadLetterQueue: dlq });
};

module.exports = { handlePaymentWebhook, getWebhookLogs };
