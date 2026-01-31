const nodemailer = require('nodemailer');
const AIService = require('./ai-service');

/**
 * Email Service for WeddingWeb
 * Handles transactional emails via Gmail SMTP
 */

// Configure transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'help.weddingweb@gmail.com',
    // It's highly recommended to use an App Password for Gmail
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send a generic email
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || `"WeddingWeb Support" <${process.env.EMAIL_USER || 'help.weddingweb@gmail.com'}>`,
      to,
      subject,
      text,
      html,
      attachments: [
        {
          filename: 'logo.png',
          path: require('path').join(__dirname, '../../frontend/public/logo.png'),
          cid: 'logo' // same cid value as in the html img src
        }
      ]
    });
    console.log('📧 Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email delivery failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (to, name) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; rounded: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo" alt="WeddingWeb Logo" style="width: 60px; height: 60px; object-fit: contain;">
        <h1 style="color: #e11d48; margin-top: 10px;">Welcome to WeddingWeb!</h1>
      </div>
      <p style="font-size: 16px; color: #334155;">Hi ${name},</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        We're thrilled to have you join us! WeddingWeb is here to help you create, manage, and share your perfect wedding digital experience.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://weddingweb.co.in'}/company/login" 
           style="background-color: #e11d48; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
           Go to Your Dashboard
        </a>
      </div>
      <p style="font-size: 14px; color: #64748b;">
        If you have any questions, feel free to reply to this email. Our support team is here to help!
      </p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        &copy; 2025 WeddingWeb. Made with ❤️ in Kerala.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to WeddingWeb! 💍',
    text: `Hi ${name}, welcome to WeddingWeb! We're thrilled to have you join us.`,
    html
  });
};

/**
 * Send an AI-generated welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmailAI = async (to, name) => {
  try {
    console.log(`🤖 Generating AI welcome email for ${name}...`);
    const { subject, body, isMock } = await AIService.generateWelcomeEmail(name);

    const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo" alt="WeddingWeb Logo" style="width: 60px; height: 60px; object-fit: contain;">
        <h1 style="color: #e11d48; margin-top: 10px;">Welcome to WeddingWeb!</h1>
      </div>
      <p style="font-size: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${body}</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.FRONTEND_URL || 'https://weddingweb.co.in'}/company/login" 
           style="background-color: #e11d48; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
           Go to Your Dashboard
        </a>
      </div>
      <p style="font-size: 14px; color: #64748b;">
        If you have any questions, feel free to reply to this email. ${isMock ? '<br><small>(Note: This was generated in AI Mock Mode)</small>' : ''}
      </p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        &copy; 2025 WeddingWeb. Made with ❤️ in Kerala.
      </p>
    </div>
  `;

    return sendEmail({
      to,
      subject,
      text: body,
      html
    });
  } catch (error) {
    console.error('❌ AI Welcome Email failed, falling back to standard welcome:', error);
    return sendWelcomeEmail(to, name);
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} name - User's name (optional)
 */
const sendPasswordResetEmail = async (to, resetToken, name = 'User') => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://weddingweb.co.in'}/company/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo" alt="WeddingWeb Logo" style="width: 60px; height: 60px; object-fit: contain;">
        <h1 style="color: #e11d48; margin-top: 10px;">Reset Your Password</h1>
      </div>
      <p style="font-size: 16px; color: #334155;">Hi ${name},</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6;">
        We received a request to reset the password for your WeddingWeb account. 
        Click the button below to create a new password.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" 
           style="background: linear-gradient(to right, #e11d48, #db2777); color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block;">
           Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
        This link will expire in 1 hour. If you didn't request a password reset, 
        you can safely ignore this email - your password will remain unchanged.
      </p>
      <p style="font-size: 14px; color: #64748b;">
        If the button doesn't work, copy and paste this link into your browser:
        <br/>
        <a href="${resetUrl}" style="color: #e11d48; word-break: break-all;">${resetUrl}</a>
      </p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        &copy; 2026 WeddingWeb. Made with ❤️ in Kerala.
      </p>
    </div>
  `;

  return sendEmail({
    to,
    subject: 'Reset your WeddingWeb password 🔐',
    text: `Hi ${name}, click the following link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
    html
  });
};

/**
 * Send a test email
 */
const sendTestEmail = async (to) => {
  return sendEmail({
    to,
    subject: 'WeddingWeb Email Service Test 🧪',
    text: 'This is a test email from the WeddingWeb backend service.',
    html: '<h1>Success!</h1><p>Your WeddingWeb email service is working correctly.</p>'
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendWelcomeEmailAI,
  sendPasswordResetEmail,
  sendTestEmail
};
