const rateLimit = require('express-rate-limit');

const make = (windowMs, limit, message) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-7',
        legacyHeaders: false,
        message: { message },
    });

// Whole API
const apiLimiter = make(15 * 60 * 1000, 600, 'Too many requests, please try again later.');

// Login / register / password reset: slow down brute force
const authLimiter = make(15 * 60 * 1000, 30, 'Too many attempts, please try again in 15 minutes.');

// Public contact form: stop spam
const contactLimiter = make(60 * 60 * 1000, 8, 'Too many messages sent, please try again later.');

// Page view tracking
const trackLimiter = make(60 * 1000, 120, 'Too many requests.');

module.exports = { apiLimiter, authLimiter, contactLimiter, trackLimiter };
