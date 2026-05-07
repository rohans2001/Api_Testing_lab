const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize: roleAuth } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

router.post('/', [
  protect,
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('totalAmount').isFloat({ min: 0 }).withMessage('Total amount must be positive')
], validate, orderController.createOrder);

router.get('/', protect, orderController.getOrdersByUser);

router.patch('/:id/status', [
  protect,
  roleAuth('admin', 'manager'),
  body('status').isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], validate, orderController.updateOrderStatus);

module.exports = router;
