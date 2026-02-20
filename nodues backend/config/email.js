const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

// Verify email configuration
const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        logger.info('Email configuration verified successfully');
        return true;
    } catch (error) {
        logger.error(`Email configuration verification failed: ${error.message}`);
        return false;
    }
};

// Send email function
const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
            attachments
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Failed to send email to ${to}: ${error.message}`);
        return { success: false, error: error.message };
    }
};

module.exports = {
    createTransporter,
    verifyEmailConfig,
    sendEmail
};
