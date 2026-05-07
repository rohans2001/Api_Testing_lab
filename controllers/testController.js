const { sendSuccess, sendError } = require('../utils/responseUtils');
const { delay } = require('../utils/delayUtils');

const getSlowResponse = async (req, res) => {
  const ms = parseInt(req.query.delay) || 3000;
  await delay(ms);
  sendSuccess(res, 200, `Response delayed by ${ms}ms`);
};

const getError = (req, res) => {
  throw new Error('Intentional server error for testing');
};

const getTimeout = async (req, res) => {
  // Simulate a hanging request that eventually times out
  // Express default timeout is usually 2 mins, we'll just wait a long time
  await delay(120000);
  sendSuccess(res, 200, 'This should not be reached if client times out');
};

const getCpuLoad = (req, res) => {
  // Simulate CPU heavy task
  let sum = 0;
  for (let i = 0; i < 1e8; i++) {
    sum += i;
  }
  sendSuccess(res, 200, 'CPU intensive task completed', { sum });
};

module.exports = { getSlowResponse, getError, getTimeout, getCpuLoad };
