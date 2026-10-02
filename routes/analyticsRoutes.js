const express = require('express');
const router = express.Router();
const { trackVisit, getSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { trackLimiter } = require('../middleware/rateLimiters');

router.post('/track', trackLimiter, trackVisit);
router.get('/summary', protect, admin, getSummary);

module.exports = router;
