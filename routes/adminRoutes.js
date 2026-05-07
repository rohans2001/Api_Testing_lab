const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize: roleAuth } = require('../middleware/roleMiddleware');

router.get('/logs', protect, roleAuth('admin'), adminController.getSystemLogs);
router.patch('/maintenance-mode', protect, roleAuth('admin'), adminController.toggleMaintenance);

module.exports = router;
