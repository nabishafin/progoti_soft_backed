require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

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

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'progoti software API is running' });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`\x1b[1;33m%s\x1b[0m`, `Server running on port ${PORT}`);
});
