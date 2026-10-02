const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/sendEmail');

const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES || '15m';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES || '7d';
const refreshSecret = () => process.env.JWT_REFRESH_SECRET || `${process.env.JWT_SECRET}_refresh`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const signAccessToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: ACCESS_EXPIRES });

const signRefreshToken = (id) =>
    jwt.sign({ id, type: 'refresh' }, refreshSecret(), { expiresIn: REFRESH_EXPIRES });

const publicUser = (user) => ({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
});

// Shape the frontend (LoginPage / baseApi) reads
const authPayload = (user) => {
    const accessToken = signAccessToken(user._id);
    return {
        user: publicUser(user),
        token: accessToken, // kept for older clients
        accessToken,
        refreshToken: signRefreshToken(user._id),
    };
};

const fail = (res, status, message) => {
    res.status(status);
    throw new Error(message);
};

const registerUser = async (req, res, next) => {
    try {
        const name = String(req.body.name || '').trim();
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        if (!name || !email || !password) fail(res, 400, 'Please add name, email, and password');
        if (!EMAIL_RE.test(email)) fail(res, 400, 'Please enter a valid email address');
        if (password.length < MIN_PASSWORD) fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters`);

        if (await User.findOne({ email })) fail(res, 400, 'User already exists');

        const user = await User.create({
            name,
            email,
            password,
            role: 'user' // Hardcoded to 'user' for security
        });

        res.status(201).json(authPayload(user));
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req, res, next) => {
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        const password = String(req.body.password || '');

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json(authPayload(user));
        } else {
            fail(res, 401, 'Invalid credentials');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Exchange a refresh token for a new access + refresh token
// @route   POST /api/auth/refresh-auth
const refreshAuth = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) fail(res, 401, 'No refresh token');

        let decoded;
        try {
            decoded = jwt.verify(refreshToken, refreshSecret());
        } catch {
            fail(res, 401, 'Invalid or expired refresh token');
        }
        if (decoded.type !== 'refresh') fail(res, 401, 'Invalid refresh token');

        const user = await User.findById(decoded.id).select('-password');
        if (!user) fail(res, 401, 'User no longer exists');

        res.json(authPayload(user));
    } catch (error) {
        next(error);
    }
};

const getMe = async (req, res, next) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
};

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        if (!User.schema.path('role').enumValues.includes(role)) fail(res, 400, 'Invalid role');

        if (String(req.user._id) === req.params.id && role !== 'admin') {
            fail(res, 400, 'You cannot remove your own admin access');
        }

        const user = await User.findById(req.params.id);
        if (!user) fail(res, 404, 'User not found');

        user.role = role;
        const updatedUser = await user.save();
        res.status(200).json(publicUser(updatedUser));
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user (tokens are stateless; client discards them)
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res, next) => {
    try {
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a password reset link
// @route   POST /api/auth/forgot-password
// Always responds the same way so it can't be used to discover registered emails.
const forgotPassword = async (req, res, next) => {
    const genericReply = { message: 'If that email is registered, a reset link has been sent.' };
    try {
        const email = String(req.body.email || '').trim().toLowerCase();
        if (!EMAIL_RE.test(email)) fail(res, 400, 'Please enter a valid email address');

        const user = await User.findOne({ email });
        if (!user) return res.json(genericReply);

        const rawToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        user.resetPasswordExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 min
        await user.save();

        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
        const link = `${clientUrl}/reset-password?token=${rawToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Reset your Nostrix password',
                html: `<p>Hi ${user.name.replace(/</g, '&lt;')},</p>
                       <p>Click the link below to set a new password. It expires in 30 minutes.</p>
                       <p><a href="${link}">${link}</a></p>
                       <p>If you didn't request this, you can ignore this email.</p>`,
            });
        } catch (mailError) {
            console.error('Reset email failed:', mailError.message);
        }

        res.json(genericReply);
    } catch (error) {
        next(error);
    }
};

// @desc    Set a new password using the emailed token
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
    try {
        const token = String(req.body.token || '');
        const password = String(req.body.password || '');

        if (!token) fail(res, 400, 'Reset token is missing');
        if (password.length < MIN_PASSWORD) fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters`);

        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            resetPasswordToken: hashed,
            resetPasswordExpire: { $gt: new Date() },
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) fail(res, 400, 'Reset link is invalid or has expired');

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password updated. You can now log in.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    refreshAuth,
    getMe,
    getUsers,
    updateUserRole,
    logoutUser,
    forgotPassword,
    resetPassword,
};
