const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    // ১. বেসিক ইনফরমেশন (কার্ডে দেখানোর জন্য)
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true }, 
    tags: [{ type: String }], // উদা: ["React", "UI/UX", "Tailwind"]

    // ২. ক্লায়েন্ট এবং ডিউরেশন (ডিটেইলস পেজের সাইডবারে থাকবে)
    clientInfo: {
        name: { type: String, required: true },   // ক্লায়েন্টের নাম
        duration: { type: String, required: true } // প্রজেক্টের সময়কাল (উদা: 2 Months)
    },

    // ৩. কেইস স্টাডি (ডিটেইলস পেজের মূল অংশ)
    caseStudy: {
        challenge: { type: String, required: true },  // প্রজেক্টের মূল চ্যালেঞ্জ কী ছিল?
        solution: { type: String, required: true },   // আপনি কী সমাধান দিয়েছেন?
        keyFeatures: [{ type: String }],              // কী কী প্রধান ফিচার আছে (লিস্ট আকারে)
        resultImpact: { type: String }                // প্রজেক্টের আউটকাম বা ফলাফল কী ছিল?
    },

    // ৪. লাইভ প্রিভিউ লিঙ্ক
    liveLink: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
