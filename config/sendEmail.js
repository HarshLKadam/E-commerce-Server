import sendEmail from '../utils/emailService.js';

const sendEmailfun = async (to, subject, text, html) => {
    try {
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
