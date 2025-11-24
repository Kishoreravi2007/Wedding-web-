const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Email Service
 * Sends emails using SMTP configuration
 */

let transporter = null;

/**
 * Initialize email transporter
 */
function getEmailTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check if email is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('⚠️ Email not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || '587'),
    secure: smtpPort === '465', // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 * @returns {Promise<Object>} Result of email send
 */
async function sendEmail({ to, subject, text, html }) {
  try {
    const emailTransporter = getEmailTransporter();
    
    if (!emailTransporter) {
      console.warn('⚠️ Email not configured - skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;
    const adminEmail = process.env.ADMIN_EMAIL || smtpFrom;

    const mailOptions = {
      from: `"Wedding Website" <${smtpFrom}>`,
      to: to || adminEmail,
      subject: subject,
      text: text,
      html: html || text.replace(/\n/g, '<br>'),
    };

    const info = await emailTransporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', {
      to: mailOptions.to,
      subject: mailOptions.subject,
      messageId: info.messageId,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Send call summary email
 * @param {Object} callData - Call data
 * @returns {Promise<Object>} Result of email send
 */
async function sendCallSummaryEmail(callData) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.warn('⚠️ ADMIN_EMAIL not set - cannot send call summary');
    return { success: false, error: 'Admin email not configured' };
  }

  const subject = `Call Summary: ${callData.name || 'Unknown'} - ${callData.phoneNumber}`;
  
  const text = `
Call Summary Report
===================

Call Details:
- Name: ${callData.name || 'Unknown'}
- Phone: ${callData.phoneNumber}
- Email: ${callData.email || 'Not provided'}
- Reason: ${callData.reason || 'General inquiry'}
- Duration: ${callData.duration || 'N/A'}
- Status: ${callData.status || 'completed'}

Call Summary:
${callData.summary || 'No summary provided'}

${callData.transcript ? `\nFull Transcript:\n${callData.transcript}` : ''}

${callData.resolution ? `\nResolution:\n${callData.resolution}` : ''}

---
This is an automated summary from your Wedding Website system.
  `.trim();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Call Summary Report</h2>
      
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #666;">Call Details</h3>
        <p><strong>Name:</strong> ${callData.name || 'Unknown'}</p>
        <p><strong>Phone:</strong> ${callData.phoneNumber}</p>
        <p><strong>Email:</strong> ${callData.email || 'Not provided'}</p>
        <p><strong>Reason:</strong> ${callData.reason || 'General inquiry'}</p>
        <p><strong>Duration:</strong> ${callData.duration || 'N/A'}</p>
        <p><strong>Status:</strong> ${callData.status || 'completed'}</p>
      </div>

      <div style="background: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #333;">Call Summary</h3>
        <p style="white-space: pre-wrap;">${callData.summary || 'No summary provided'}</p>
      </div>

      ${callData.transcript ? `
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #666;">Full Transcript</h3>
        <p style="white-space: pre-wrap; font-family: monospace; font-size: 12px;">${callData.transcript}</p>
      </div>
      ` : ''}

      ${callData.resolution ? `
      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #1976d2;">Resolution</h3>
        <p style="white-space: pre-wrap;">${callData.resolution}</p>
      </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
      <p style="color: #999; font-size: 12px;">
        This is an automated summary from your Wedding Website system.
      </p>
    </div>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: subject,
    text: text,
    html: html,
  });
}

module.exports = {
  sendEmail,
  sendCallSummaryEmail,
  getEmailTransporter,
};

