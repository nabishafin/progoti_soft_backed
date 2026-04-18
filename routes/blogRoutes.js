const express = require('express');
const router = express.Router();
const { 
    getBlogs, 
    getBlog, 
    createBlog, 
    updateBlog, 
    deleteBlog 
} = require('../controllers/blogController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getBlogs)
    .post(protect, admin, upload.single('image'), createBlog);

router.route('/:id')
    .get(getBlog)
    .put(protect, admin, upload.single('image'), updateBlog)
    .delete(protect, admin, deleteBlog);

module.exports = router;
