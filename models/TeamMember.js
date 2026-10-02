const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    title: { type: String, default: '', trim: true }, // e.g. "CEO, Nostrix Creative"
    image: { type: String, default: '' },
    socials: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' }
    },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
