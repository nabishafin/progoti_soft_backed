const nodemailer = require('nodemailer');

const createTransporter = () =>
    nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

// Escape user-provided text before putting it into HTML emails
const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const sendEmail = async ({ to, subject, html, replyTo }) => {
    const transporter = createTransporter();
    return transporter.sendMail({
        from: `"Nostrix" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        replyTo,
    });
};

module.exports = { sendEmail, escapeHtml };
