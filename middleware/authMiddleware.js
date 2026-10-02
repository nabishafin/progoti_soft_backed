const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401);
        return next(new Error('Not authorized, no token'));
    }

    try {
        const token = header.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401);
            return next(new Error('Not authorized, user no longer exists'));
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401);
        next(new Error('Not authorized, token failed'));
    }
};

module.exports = { protect };
