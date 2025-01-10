const verifyEmailTemplate = (username, otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f9f9f9;
                color: #333;
                margin: 0;
                padding: 0;
            }
            .email-container {
                max-width: 600px;
                margin: 20px auto;
                background: #ffffff;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            .header {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .content {
                font-size: 16px;
                margin: 20px 0;
            }
            .otp {
                font-size: 20px;
                font-weight: bold;
                color: #4CAF50;
                margin: 10px 0;
            }
            .footer {
                font-size: 12px;
                color: #888;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">Verify Your Email Address</div>
            <div class="content">
                Hello <strong>${username}</strong>,<br><br>
                Thank you for signing up! Please use the OTP below to verify your email address.
            </div>
            <div class="otp">${otp}</div>
            <div class="content">
                If you did not sign up for an account, you can safely ignore this email.
            </div>
            <div class="footer">
                &copy; 2025 Your Company Name. All rights reserved.
            </div>
        </div>
    </body>
    </html>
    `;
};

export default verifyEmailTemplate