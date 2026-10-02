const Message = require('../models/Message');
const { sendEmail, escapeHtml } = require('../utils/sendEmail');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STATUSES = Message.schema.path('status').enumValues;

const getMessages = async (req, res, next) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

const sendEmailAndSaveMessage = async (req, res, next) => {
    try {
        const clean = (v, max) => String(v || '').trim().slice(0, max);
        const firstName = clean(req.body.firstName, 80);
        const lastName = clean(req.body.lastName, 80);
        const email = clean(req.body.email, 200).toLowerCase();
        const phone = clean(req.body.phone, 40);
        const subject = clean(req.body.subject, 200);
        const message = clean(req.body.message, 5000);

        if (!firstName || !email || !message) {
            res.status(400);
            throw new Error('Please fill in required fields: firstName, email, and message');
        }
        if (!EMAIL_RE.test(email)) {
            res.status(400);
            throw new Error('Please enter a valid email address');
        }

        // 1. Save to database first (this is the source of truth for the admin inbox)
        const savedMessage = await Message.create({ firstName, lastName, email, phone, subject, message });

        // 2. Notify by email. A mail failure must not lose the message or fail the request.
        let emailSent = true;
        try {
            await sendEmail({
                to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
                replyTo: email,
                subject: subject || `New form message from ${firstName}`,
                html: `
                    <h3>New Contact Request</h3>
                    <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                    <p><strong>Phone:</strong> ${escapeHtml(phone) || 'N/A'}</p>
                    <br>
                    <p><strong>Message:</strong></p>
                    <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
                `,
            });
        } catch (mailError) {
            emailSent = false;
            console.error('Contact email failed:', mailError.message);
        }

        res.status(200).json({
            success: true,
            message: 'Message received',
            emailSent,
            data: savedMessage
        });
    } catch (error) {
        next(error);
    }
};

const updateMessageStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!STATUSES.includes(status)) {
            res.status(400);
            throw new Error('Invalid status');
        }

        const msg = await Message.findById(req.params.id);

        if (!msg) {
            res.status(404);
            throw new Error('Message not found');
        }

        msg.status = status;
        await msg.save();

        res.status(200).json(msg);
    } catch (error) {
        next(error);
    }
};

const deleteMessage = async (req, res, next) => {
    try {
        const msg = await Message.findById(req.params.id);
        if (!msg) {
             res.status(404);
             throw new Error('Message not found');
        }
        await msg.deleteOne();
        res.status(200).json({ id: req.params.id, message: 'Message deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMessages,
    sendEmailAndSaveMessage,
    updateMessageStatus,
    deleteMessage
};
