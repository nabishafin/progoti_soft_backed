const express = require('express');
const router = express.Router();
const {
    getTestimonials,
    getTestimonial,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getTestimonials)
    .post(protect, admin, upload.single('image'), createTestimonial);

router.route('/:id')
    .get(getTestimonial)
    .put(protect, admin, upload.single('image'), updateTestimonial)
    .delete(protect, admin, deleteTestimonial);

module.exports = router;
