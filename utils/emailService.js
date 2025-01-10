import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Replace with the actual SMTP host if needed
    port: 465, // Use port 465 for SSL
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL, // Replace with Ethereal user or valid email
        pass: process.env.EMAIL_PASSWORD, // Replace with your email password
    },
    connectionTimeout: 60000, // 60 seconds timeout
    greetingTimeout: 30000, // 30 seconds timeout
});

const sendEmail = async (to, subject, text, html) => {
    try {
       
        if (!to) {
            throw new Error("No recipients defined");
        }

        const info = await transporter.sendMail({
            from: process.env.EMAIL,
            to,
            subject,
            text,
            html,
        });

        return {
            success: true,
            messageId: info.messageId,
        };
    }
    catch (error) {
        console.error('Error in sending the email:', error);
        return {
            success: false,
            error: error.message,
        };
    }
};

export default sendEmail;
