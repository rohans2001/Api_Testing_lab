const { delay } = require('../utils/delayUtils');
const { sendSuccess, sendError } = require('../utils/responseUtils');

const mockStripePayment = async (req, res) => {
  // Simulate 3rd party failure logic
  if (req.body.cardNumber === '4000000000000001') {
    return sendError(res, 502, 'Bad Gateway - Stripe is down');
  }
  if (req.body.cardNumber === '4000000000000002') {
    await delay(30000); // 30s timeout
    return sendError(res, 504, 'Gateway Timeout - Stripe did not respond in time');
  }
  
  sendSuccess(res, 200, 'Mock Payment processed', { transactionId: 'txn_12345' });
};

const mockEmailProvider = async (req, res) => {
  const shouldFail = Math.random() < 0.2; // 20% failure rate
  if (shouldFail) {
    return sendError(res, 503, 'Service Unavailable - SendGrid is down');
  }
  sendSuccess(res, 200, 'Mock Email sent successfully');
};

const mockSmsProvider = async (req, res) => {
  // Always fail to test fallback logic
  return sendError(res, 500, 'Internal Server Error - Twilio is currently experiencing issues');
};

module.exports = { mockStripePayment, mockEmailProvider, mockSmsProvider };
