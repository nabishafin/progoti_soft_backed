const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true // Short snippet
    },
    subtitle: {
        type: String,
        default: ""
    },
    tags: [{
        type: String
    }],
    content: {
        type: String,
        required: true // Full article body
    },
    conclusion: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    category: {
        type: String,
        required: true 
    },
    author: {
        type: String,
        default: 'Nostrix Team'
    },
    date: {
        type: String, 
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
