const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, cartController.getCart);
router.post('/add', protect, cartController.addToCart);

module.exports = router;
