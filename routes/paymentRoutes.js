const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, paymentController.initiatePayment);

module.exports = router;
