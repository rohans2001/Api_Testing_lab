const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('super_admin', 'admin', 'manager'), userController.getAllUsers);
router.get('/:id', protect, authorize('super_admin', 'admin'), userController.getUserById);
router.delete('/:id', protect, authorize('super_admin', 'admin'), userController.deleteUser);

module.exports = router;
