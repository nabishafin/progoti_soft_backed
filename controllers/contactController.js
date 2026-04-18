const nodemailer = require('nodemailer');
const Message = require('../models/Message');

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
        const { firstName, lastName, email, phone, subject, message } = req.body;

        if (!firstName || !email || !message) {
            res.status(400);
            throw new Error('Please fill in required fields: firstName, email, and message');
        }

        // 1. Save to Database First
        const savedMessage = await Message.create({
            firstName,
            lastName,
            email,
            phone,
            subject,
            message
        });

        // 2. Transporter for Nodemailer
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 3. Email options
        const mailOptions = {
            from: `"${firstName} ${lastName || ''}" <${email}>`,
            to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
            subject: subject || `New Form Message from ${firstName}`,
            html: `
                <h3>New Contact Request</h3>
                <p><strong>Name:</strong> ${firstName} ${lastName || ''}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
                <br>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        };

        // 4. Send Email
        const info = await transporter.sendMail(mailOptions);
        console.log("Message sent to Email: %s", info.messageId);

        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully and saved to DB',
            data: savedMessage
        });
    } catch (error) {
        console.error(error);
        res.status(500);
        next(new Error('Process failed. Could not send email or save.'));
    }
};

const updateMessageStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const msg = await Message.findById(req.params.id);

        if (!msg) {
            res.status(404);
            throw new Error('Message not found');
        }

        msg.status = status || msg.status;
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
