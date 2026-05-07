const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, jobController.createJob);
router.get('/:id/status', protect, jobController.getJobStatus);
router.get('/:id/result', protect, jobController.getJobResult);

module.exports = router;
