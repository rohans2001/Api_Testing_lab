const { delay } = require('./delayUtils');

/**
 * Simulates random server errors to test client resilience
 */
const simulateRandomError = async (req, res, next) => {
  const shouldSimulate = process.env.SIMULATE_RANDOM_ERRORS === 'true';
  const probability = parseFloat(process.env.ERROR_PROBABILITY || '0.1');
  
  if (shouldSimulate && Math.random() < probability) {
    const errorTypes = [
      { type: 'STATUS', codes: [500, 502, 503, 504] },
      { type: 'DELAY', ms: [2000, 5000, 10000] },
      { type: 'CORRUPTED', mode: 'json' },
      { type: 'DROPPED', mode: 'close' }
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    if (randomError.type === 'STATUS') {
      const code = randomError.codes[Math.floor(Math.random() * randomError.codes.length)];
      return res.status(code).json({
        success: false,
        errorCode: `CHAOS_ERROR_${code}`,
        message: `Chaos Monkey generated a ${code} error`
      });
    }

    if (randomError.type === 'DELAY') {
      const ms = randomError.ms[Math.floor(Math.random() * randomError.ms.length)];
      await delay(ms);
      // Let it continue after delay
      return next();
    }

    if (randomError.type === 'CORRUPTED') {
      res.setHeader('Content-Type', 'application/json');
      return res.status(200).send('{ "success": true, "data": [ "incomplete string }');
    }

    if (randomError.type === 'DROPPED') {
      return res.destroy(); // Instantly close connection
    }
  }
  
  next();
};

module.exports = { simulateRandomError };
