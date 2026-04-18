const express = require('express');
const router = express.Router();
const { sendEmailAndSaveMessage, getMessages, updateMessageStatus, deleteMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

// Public route to submit a form (sends email & saves to DB)
router.post('/', sendEmailAndSaveMessage);

// Protected routes to manage messages from an admin panel
router.route('/messages')
    .get(protect, getMessages);

router.route('/messages/:id')
    .put(protect, updateMessageStatus)
    .delete(protect, deleteMessage);

module.exports = router;
