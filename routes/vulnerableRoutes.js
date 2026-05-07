const express = require('express');
const router = express.Router();
const vulnController = require('../controllers/vulnerableController');
const { protect } = require('../middleware/authMiddleware');

// Intentional vulnerabilities for security testing
router.get('/users/:id', protect, vulnController.getAnyUserProfile); // IDOR
router.get('/redirect', vulnController.redirectUrl); // Open Redirect
router.patch('/profile', protect, vulnController.updateProfile); // Mass Assignment

module.exports = router;
