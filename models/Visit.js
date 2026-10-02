const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
    path: { type: String, required: true, maxlength: 300 },
    visitorId: { type: String, required: true, maxlength: 64 }, // random id kept in the visitor's browser
    referrer: { type: String, default: '', maxlength: 300 },
    device: { type: String, enum: ['desktop', 'mobile', 'tablet'], default: 'desktop' }
}, { timestamps: { createdAt: true, updatedAt: false } });

visitSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
