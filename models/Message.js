const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
        type: String,
        enum: ['unread', 'read', 'replied'],
        default: 'unread'
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
