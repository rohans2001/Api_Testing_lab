const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize: roleAuth } = require('../middleware/roleMiddleware');

router.get('/', protect, notifController.getUserNotifications);
router.post('/send', protect, roleAuth('admin'), notifController.sendNotification);
router.patch('/:id/read', protect, notifController.markAsRead);

module.exports = router;
