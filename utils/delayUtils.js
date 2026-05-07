/**
 * Simulates network delay for async testing
 */
const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const defaultDelay = async () => {
  const ms = parseInt(process.env.DEFAULT_DELAY_MS || '0', 10);
  if (ms > 0) {
    await delay(ms);
  }
};

module.exports = { delay, defaultDelay };
