const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const productController = require('../controllers/productController');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const { authorize: roleAuth } = require('../middleware/roleMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

router.post('/', [
  protect,
  roleAuth('admin', 'manager'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], validate, productController.createProduct);

module.exports = router;
