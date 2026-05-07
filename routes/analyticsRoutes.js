const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize: roleAuth } = require('../middleware/roleMiddleware');

router.get('/dashboard', protect, roleAuth('admin', 'manager'), analyticsController.getDashboardStats);

module.exports = router;
