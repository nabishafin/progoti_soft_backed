require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiters');

// Connect to database if MONGO_URI is available
if (process.env.MONGO_URI && process.env.MONGO_URI !== 'your_mongo_db_connection_string') {
    connectDB();
} else {
    console.warn("MongoDB URI not found in .env. Skipping db connection.");
}

// Connect to Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name') {
    try {
        connectCloudinary();
        console.log(`\x1b[1;32m%s\x1b[0m`, 'Cloudinary Configured Successfully');
    } catch (error) {
        console.warn('Cloudinary failed to connect', error.message);
    }
} else {
    console.warn("Cloudinary keys not found in .env. Uploads will fail.");
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.startsWith('change_this')) {
    console.warn('JWT_SECRET is missing or still the placeholder. Set a long random value in .env.');
}

const app = express();

// Behind Vercel / proxies: needed so rate limiting sees the real client IP
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS: set CLIENT_URL (comma separated) to restrict; unset = allow all (dev)
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/$/, ''))
    .filter(Boolean);
app.use(cors({
    origin: allowedOrigins.length
        ? (origin, cb) => (!origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(null, false))
        : true,
}));

// Body parsing with a size cap
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'progoti software API is running' });
});

// Rate limit the whole API, then mount routes
app.use('/api', apiLimiter);

const { skillsRouter, teamRouter } = require('./routes/contentRoutes');

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/skills', skillsRouter);
app.use('/api/team', teamRouter);

// Error handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// On Vercel the platform calls the exported app; locally we listen on a port
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\x1b[1;33m%s\x1b[0m`, `Server running on port ${PORT}`);
    });
}

module.exports = app;
