const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 100, default: 80 },
    category: { type: String, default: 'General', trim: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
