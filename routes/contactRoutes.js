const express = require('express');
const router = express.Router();
const { sendEmailAndSaveMessage, getMessages, updateMessageStatus, deleteMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { contactLimiter } = require('../middleware/rateLimiters');

// Public route to submit a form (sends email & saves to DB), rate limited against spam
router.post('/', contactLimiter, sendEmailAndSaveMessage);

// Admin-only routes to manage messages from the admin panel
router.route('/messages')
    .get(protect, admin, getMessages);

router.route('/messages/:id')
    .put(protect, admin, updateMessageStatus)
    .delete(protect, admin, deleteMessage);

module.exports = router;
