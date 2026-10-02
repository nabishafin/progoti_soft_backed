const errorHandler = (err, req, res, next) => {
    // If a handler forgot to set a status, res.statusCode is still 200
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message;

    if (err.name === 'CastError') {
        statusCode = 404;
        message = 'Resource not found';
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map((e) => e.message).join(', ');
    } else if (err.code === 11000) {
        statusCode = 400;
        message = 'Duplicate value, that record already exists';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
    }

    const isProd = process.env.NODE_ENV === 'production';
    // Never leak internals of unexpected errors in production
    if (isProd && statusCode === 500) message = 'Server error';

    res.status(statusCode).json({
        message,
        stack: isProd ? undefined : err.stack,
    });
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {
    errorHandler,
    notFound
};
