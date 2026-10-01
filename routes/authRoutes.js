const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    getUsers,
    updateUserRole,
    logoutUser,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

// Public
router.post('/register', registerUser);
router.post('/login', loginUser);

// Private
router.get('/me', protect, getMe);
router.post('/logout', protect, logoutUser);

// Admin only
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
