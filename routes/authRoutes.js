const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    refreshAuth,
    getMe,
    getUsers,
    updateUserRole,
    logoutUser,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { authLimiter } = require('../middleware/rateLimiters');

// Public (rate limited)
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh-auth', refreshAuth);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Private
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);

// Admin only
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
