const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    clientName: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true // e.g. "CEO at Company"
    },
    review: {
        type: String,
        required: true
    },
    image: {
        type: String, // Empty if no avatar
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    }
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
