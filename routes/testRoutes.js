const express = require('express');
const { sendSuccess } = require('../utils/responseUtils');
const router = express.Router();
const testController = require('../controllers/testController');
const { simulateRandomError } = require('../utils/randomErrorUtils');

// Mount random error simulation on this specific route
router.get('/random-error', simulateRandomError, (req, res) => {
  sendSuccess(res, 200, 'Lucky! No error this time.');
});

router.get('/slow', testController.getSlowResponse);
router.get('/error', testController.getError);
router.get('/timeout', testController.getTimeout);

// Performance Testing
router.get('/heavy-response', (req, res) => {
  const size = parseInt(req.query.size) || 1000;
  const data = Array.from({ length: size }).map((_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `This is a heavy description for item ${i} to bloat the payload`,
    timestamp: new Date().toISOString()
  }));
  sendSuccess(res, 200, 'Large payload generated successfully', data);
});

router.get('/cpu-load', (req, res) => {
  const duration = parseInt(req.query.ms) || 2000;
  const start = Date.now();
  while (Date.now() - start < duration) {
    // block event loop
    Math.sqrt(Math.random());
  }
  sendSuccess(res, 200, `Blocked CPU for ${duration}ms successfully`);
});

router.get('/memory-load', (req, res) => {
  const arrays = [];
  try {
    for (let i = 0; i < 10000; i++) {
      arrays.push(new Array(1000).fill('memory load'));
    }
  } catch (e) {}
  
  sendSuccess(res, 200, 'Allocated temporary memory successfully');
});

module.exports = router;
