import sendEmail from '../utils/emailService.js';

const sendEmailfun = async (to, subject, text, html) => {
    try {
        // Debugging: Log the parameters to ensure correct values are passed
        console.log("sendEmailfun called with:", { to, subject, text, html });

        // Call sendEmail function
        const result = await sendEmail(to, subject, text, html);

        if (result.success) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error in sendEmailfun:', error);
        return false;
    }
};

export default sendEmailfun;
