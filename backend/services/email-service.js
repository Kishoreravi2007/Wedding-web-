const nodemailer = require('nodemailer');
const AIService = require('./ai-service');

/**
 * Email Service for WeddingWeb
 * Handles transactional emails via Gmail SMTP
 */

// Email Service Configuration
const isProduction = process.env.NODE_ENV === 'production';

// Configure transporter
const transporter = nodemailer.createTransport({
  // 'service: gmail' is often more reliable on Render/Cloud than manual host/port
  service: (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.gmail.com') ? 'gmail' : undefined,
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // Often needed for cloud environments
  }
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error Detail:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);
    if (error.code === 'EAUTH') {
      console.error('   💡 TIP: Check if Gmail App Password is correct or if 2FA is enabled.');
    } else if (error.code === 'ESOCKET') {
      console.error('   💡 TIP: Connection blocked. Port 587 is often restricted on Render. Switch to Port 465 (secure: true).');
    }
    console.error('   Config Used:', {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || '587',
      user: process.env.EMAIL_USER || process.env.SMTP_USER,
      secure: process.env.SMTP_PORT === '465'
    });
  } else {
    console.log('✅ SMTP Server Connection Verified - Service is active');
  }
});

/**
 * Send a generic email
 * @param {Object} options - Email options (to, subject, text, html)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  // Try Resend first if API key is available
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      console.log(`🚀 [Email Service] Routing via Resend API: ${to}`);
      const data = await resend.emails.send({
        from: process.env.SMTP_FROM || 'WeddingWeb Support <help@weddingweb.co.in>',
        to: [to],
        subject,
        text,
        html
      });

      if (data.error) throw new Error(data.error.message);

      console.log('✅ Email sent via Resend successfully:', data.id);
      return { success: true, messageId: data.id, provider: 'resend' };
    } catch (resendError) {
      console.warn('⚠️ Resend API failed, falling back to SMTP:', resendError.message);
      // Fall through to SMTP logic
    }
  }

  try {
    const supportEmails = ['help.weddingweb@gmail.com', 'help@weddingweb.co.in'];
    const lowerSubject = (subject || '').toLowerCase();
    const isException = lowerSubject.includes('welcome') ||
      lowerSubject.includes('gallery') ||
      lowerSubject.includes('invitation') ||
      lowerSubject.includes('reset') ||
      lowerSubject.includes('password') ||
      lowerSubject.includes('enquiry') ||
      lowerSubject.includes('thanks') ||
      lowerSubject.includes('memories');

    if (supportEmails.some(email => to.toLowerCase().includes(email.toLowerCase())) && !isException) {
      console.warn(`⚠️ [Email Service] Skipping send to support address (auto-loop protection): ${to}. Subject: ${subject}`);
      return { success: true, skipped: true, message: 'Skipped support address (loop protection)' };
    }
    // Filter attachments to only include those referenced in the HTML
    const allAttachments = [
      {
        filename: 'logo.png',
        path: require('path').join(__dirname, '../../frontend/public/logo.png'),
        cid: 'logo'
      },
      {
        filename: 'hero-wedding.jpg',
        path: require('path').join(__dirname, '../../frontend/public/hero-wedding.jpg'),
        cid: 'hero'
      },
      {
        filename: 'hero-gallery.jpg',
        path: require('path').join(__dirname, '../../frontend/public/hero-gallery.jpg'),
        cid: 'hero-gallery'
      }
    ];

    const activeAttachments = allAttachments.filter(attachment =>
      html && html.includes(`cid:${attachment.cid}`)
    );

    const fromAddress = process.env.SMTP_FROM || `"WeddingWeb Support" <${process.env.EMAIL_USER || process.env.SMTP_USER || 'help.weddingweb@gmail.com'}>`;

    console.log(`📧 [Email Service] Sending via SMTP to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   From: ${fromAddress}`);

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject,
      text,
      html,
      attachments: activeAttachments
    });
    console.log('✅ Email sent via SMTP successfully: %s', info.messageId);
    return { success: true, messageId: info.messageId, provider: 'smtp' };
  } catch (error) {
    console.error('❌ Email delivery failed:');
    console.error('   To:', to);
    console.error('   Subject:', subject);
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    if (error.stack) console.error('   Stack Trace:', error.stack);

    return {
      success: false,
      error: error.message,
      code: error.code,
      tip: error.code === 'EAUTH' ? 'Gmail App Password may be invalid or expired' :
        error.code === 'ESOCKET' ? 'Connectivity issue - check if port 465/587 is blocked' : null
    };
  }
};

/**
 * Send a welcome email to a new user
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
const sendWelcomeEmail = async (to, name) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://weddingweb.co.in';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
        
        <!-- Header / Logo -->
        <div style="text-align: center; padding: 32px 0; border-bottom: 1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <img src="cid:logo" alt="WeddingWeb" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;" />
              </td>
              <td style="vertical-align: middle;">
                <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">WeddingWeb</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Hero Image -->
        <div style="width: 100%; height: auto; background-color: #e2e8f0;">
          <img src="cid:hero" alt="Welcome" style="width: 100%; height: auto; display: block;" />
        </div>

        <!-- Greeting & Content -->
        <div style="padding: 40px 32px; text-align: center;">
          <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">Welcome to WeddingWeb, ${name}!</h2>
          <p style="font-size: 16px; color: #64748b; line-height: 1.7; margin: 0 0 40px 0;">
            We're so excited to help you plan your perfect day. Wedding planning should be as beautiful as the ceremony itself. Let's get started with a few simple steps to bring your vision to life.
          </p>

          <!-- Onboarding Steps -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 40px;">
            <!-- Step 1 -->
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #f1f5f9; border-radius: 12px; background-color: #fafafa; margin-bottom: 12px;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-right: 16px;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background-color: rgba(23,84,207,0.1); text-align: center; line-height: 40px; color: #1754cf; font-size: 18px;">✓</div>
                    </td>
                    <td style="vertical-align: top; text-align: left;">
                      <strong style="font-size: 14px; color: #0f172a;">Complete Profile</strong><br/>
                      <span style="font-size: 13px; color: #64748b;">Add your wedding date and venue details to set your countdown.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 12px;"></td></tr>
            <!-- Step 2 -->
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #f1f5f9; border-radius: 12px; background-color: #fafafa;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-right: 16px;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background-color: rgba(23,84,207,0.1); text-align: center; line-height: 40px; color: #1754cf; font-size: 18px;">📷</div>
                    </td>
                    <td style="vertical-align: top; text-align: left;">
                      <strong style="font-size: 14px; color: #0f172a;">Upload Photos</strong><br/>
                      <span style="font-size: 13px; color: #64748b;">Share your favorite engagement shots with your guests.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 12px;"></td></tr>
            <!-- Step 3 -->
            <tr>
              <td style="padding: 12px 16px; border: 1px solid #f1f5f9; border-radius: 12px; background-color: #fafafa;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="width: 40px; vertical-align: top; padding-right: 16px;">
                      <div style="width: 40px; height: 40px; border-radius: 50%; background-color: rgba(23,84,207,0.1); text-align: center; line-height: 40px; color: #1754cf; font-size: 18px;">🎨</div>
                    </td>
                    <td style="vertical-align: top; text-align: left;">
                      <strong style="font-size: 14px; color: #0f172a;">Choose a Theme</strong><br/>
                      <span style="font-size: 13px; color: #64748b;">Pick a design that matches the vibe of your special day.</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Primary CTA -->
          <a href="${frontendUrl}/company/login" 
             style="display: inline-block; width: 100%; max-width: 400px; padding: 16px 32px; background-color: #1754cf; color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 8px; text-align: center; box-sizing: border-box; box-shadow: 0 4px 14px rgba(23,84,207,0.3);">
            Get Started
          </a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0 0 4px 0;">WeddingWeb</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 16px 0;">weddingweb.co.in</p>
          <div style="margin-bottom: 16px;">
            <a href="${frontendUrl}" style="color: #1754cf; font-size: 12px; font-weight: 500; text-decoration: none; margin: 0 8px;">Help Center</a>
            <span style="color: #cbd5e1;">|</span>
            <a href="${frontendUrl}" style="color: #1754cf; font-size: 12px; font-weight: 500; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
          </div>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.5; max-width: 300px; margin: 16px auto 0 auto;">
            You received this email because you signed up for WeddingWeb. If you have any questions, just reply to this email — we're here to help!
          </p>
          <p style="font-size: 10px; color: #cbd5e1; margin: 12px 0 0 0;">
            &copy; 2026 WeddingWeb AI Inc. Made with ❤️ in Kerala.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Welcome to WeddingWeb! 💍',
    text: `Hi ${name}, welcome to WeddingWeb! We're so excited to help you plan your perfect day. Get started at ${frontendUrl}/company/login`,
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
    const frontendUrl = process.env.FRONTEND_URL || 'https://weddingweb.co.in';

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
        
        <!-- Header / Logo -->
        <div style="text-align: center; padding: 32px 0; border-bottom: 1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <img src="cid:logo" alt="WeddingWeb" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;" />
              </td>
              <td style="vertical-align: middle;">
                <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">WeddingWeb</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Hero Image -->
        <div style="width: 100%; height: auto; background-color: #e2e8f0;">
          <img src="cid:hero" alt="Welcome" style="width: 100%; height: auto; display: block;" />
        </div>

        <!-- AI-Generated Content -->
        <div style="padding: 40px 32px; text-align: center;">
          <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 24px 0;">Welcome to WeddingWeb, ${name}!</h2>
          <p style="font-size: 16px; color: #475569; line-height: 1.7; margin: 0 0 40px 0; white-space: pre-wrap; text-align: left;">${body}</p>

          <!-- Primary CTA -->
          <a href="${frontendUrl}/company/login" 
             style="display: inline-block; width: 100%; max-width: 400px; padding: 16px 32px; background-color: #1754cf; color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 8px; text-align: center; box-sizing: border-box; box-shadow: 0 4px 14px rgba(23,84,207,0.3);">
            Get Started
          </a>

          ${isMock ? '<p style="font-size: 11px; color: #94a3b8; margin-top: 16px;">(Note: This was generated in AI Mock Mode)</p>' : ''}
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0 0 4px 0;">WeddingWeb</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 16px 0;">weddingweb.co.in</p>
          <div style="margin-bottom: 16px;">
            <a href="${frontendUrl}" style="color: #1754cf; font-size: 12px; font-weight: 500; text-decoration: none; margin: 0 8px;">Help Center</a>
            <span style="color: #cbd5e1;">|</span>
            <a href="${frontendUrl}" style="color: #1754cf; font-size: 12px; font-weight: 500; text-decoration: none; margin: 0 8px;">Privacy Policy</a>
          </div>
          <p style="font-size: 10px; color: #94a3b8; line-height: 1.5; max-width: 300px; margin: 16px auto 0 auto;">
            You received this email because you signed up for WeddingWeb. If you have any questions, just reply to this email — we're here to help!
          </p>
          <p style="font-size: 10px; color: #cbd5e1; margin: 12px 0 0 0;">
            &copy; 2026 WeddingWeb. Made with ❤️ in Kerala.
          </p>
        </div>
      </div>
    </body>
    </html>
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
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
        
        <!-- Header / Logo -->
        <div style="text-align: center; padding: 32px 0; border-bottom: 1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0" align="center">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <img src="cid:logo" alt="WeddingWeb" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;" />
              </td>
              <td style="vertical-align: middle;">
                <span style="font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">WeddingWeb</span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Content -->
        <div style="padding: 40px 32px; text-align: center;">
          <div style="width: 64px; height: 64px; background-color: rgba(23,84,207,0.1); border-radius: 16px; margin: 0 auto 24px auto; display: flex; align-items: center; justify-content: center; line-height: 64px; font-size: 32px; color: #1754cf;">
            🔐
          </div>
          <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0;">Reset your password</h2>
          <p style="font-size: 16px; color: #64748b; line-height: 1.7; margin: 0 0 40px 0;">
            Hi ${name},<br/>
            We received a request to reset the password for your account. No worries, it happens to the best of us! Click the button below to set a new password.
          </p>

          <!-- Primary CTA -->
          <a href="${resetUrl}" 
             style="display: inline-block; width: 100%; max-width: 400px; padding: 18px 32px; background-color: #1754cf; color: #ffffff; font-weight: 700; font-size: 16px; text-decoration: none; border-radius: 10px; text-align: center; box-sizing: border-box; box-shadow: 0 4px 14px rgba(23,84,207,0.3);">
            Set New Password
          </a>

          <p style="font-size: 14px; color: #94a3b8; margin: 40px 0 0 0;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>

        <!-- Link Fallback -->
        <div style="padding: 0 32px 40px 32px; text-align: center;">
          <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 8px;">If the button doesn't work, copy and paste this link:</p>
          <a href="${resetUrl}" style="font-size: 12px; color: #1754cf; word-break: break-all; text-decoration: none;">${resetUrl}</a>
        </div>

        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #f1f5f9;">
          <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0 0 4px 0;">WeddingWeb</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 16px 0;">weddingweb.co.in</p>
          <p style="font-size: 10px; color: #cbd5e1; margin: 0;">
            &copy; 2026 WeddingWeb AI Inc. Made with ❤️ in Kerala.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: 'Reset your WeddingWeb password 🔐',
    text: `Hi ${name}, click the following link to reset your password: ${resetUrl}. This link expires in 1 hour.`,
    html
  });
};

/**
 * Send a wedding invitation email with RSVP buttons
 * @param {Object} guest - Guest object (name, email, rsvp_token)
 * @param {Object} wedding - Wedding object (couple_name, wedding_date, venue, slug)
 */
const sendInvitationEmail = async (guest, wedding) => {
  const rsvpBaseUrl = `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/public/guests/rsvp/${guest.rsvp_token}`;
  const weddingUrl = `${process.env.FRONTEND_URL || 'https://weddingweb.co.in'}/weddings/${wedding.slug}`;

  const formattedDate = wedding.wedding_date ? new Date(wedding.wedding_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'TBA';

  const html = `
    <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #fecdd3; border-radius: 20px; background-color: #fffafb;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo" alt="WeddingWeb" style="width: 50px; height: 50px; margin-bottom: 20px;">
        <h2 style="color: #9f1239; font-size: 24px; margin: 0; letter-spacing: 1px;">You're Invited!</h2>
        <div style="width: 50px; hieght: 1px; background-color: #fda4af; margin: 15px auto;"></div>
      </div>
      
      <p style="font-size: 18px; color: #4c0519; text-align: center; font-style: italic;">
        Dear ${guest.name},
      </p>
      
      <p style="font-size: 16px; color: #334155; text-align: center; line-height: 1.8;">
        We are delighted to invite you to celebrate the wedding of
      </p>
      
      <h1 style="color: #e11d48; text-align: center; font-size: 28px; margin: 20px 0;">
        ${wedding.couple_name}
      </h1>
      
      <div style="background-color: #fff; padding: 20px; border-radius: 12px; border: 1px dashed #fda4af; margin: 25px 0; text-align: center;">
        <p style="margin: 5px 0; font-weight: bold; color: #9f1239;">${formattedDate}</p>
        <p style="margin: 5px 0; color: #334155;">at ${wedding.venue || 'Our Wedding Venue'}</p>
      </div>

      <p style="font-size: 15px; color: #334155; text-align: center; margin-bottom: 30px;">
        Please let us know if you can make it:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${rsvpBaseUrl}/attending" 
           style="background-color: #e11d48; color: white; padding: 12px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block; margin: 10px; box-shadow: 0 4px 14px 0 rgba(225, 29, 72, 0.39);">
           Yes, I'm Coming!
        </a>
        <a href="${rsvpBaseUrl}/declined" 
           style="background-color: #f1f5f9; color: #64748b; padding: 12px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block; margin: 10px; border: 1px solid #e2e8f0;">
           Respectfully Decline
        </a>
      </div>
      
      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 40px;">
        View our wedding website for more details, registry, and location:
        <br/>
        <a href="${weddingUrl}" style="color: #e11d48; text-decoration: underline;">${weddingUrl}</a>
      </p>
      
      <hr style="border: 0; border-top: 1px solid #fff1f2; margin: 40px 0;">
      <p style="font-size: 11px; color: #94a3b8; text-align: center;">
        Sent via WeddingWeb.co.in - Modern Wedding Experiences
      </p>
    </div>
  `;

  return sendEmail({
    to: guest.email,
    subject: `Wedding Invitation: ${wedding.couple_name} 💍`,
    text: `Hi ${guest.name}, you are invited to the wedding of ${wedding.couple_name} on ${formattedDate}. Please RSVP at ${rsvpBaseUrl}/attending`,
    html
  });
};

/**
 * Send a monthly activity report email to a user
 * @param {string} to - Recipient email
 * @param {string} name - User's name or studio name
 * @param {Object} stats - Activity statistics
 * @param {number} stats.totalWeddings - Total weddings managed
 * @param {string} stats.weddingsGrowth - Growth percentage e.g. "+15%"
 * @param {number} stats.photosUploaded - Total photos uploaded
 * @param {string} stats.photosGrowth - Growth percentage e.g. "+8%"
 * @param {string} stats.storageUsed - Storage used e.g. "1.2 TB"
 * @param {string} stats.storageTotal - Total storage e.g. "2 TB"
 * @param {number} stats.storagePercent - Storage usage percentage (0-100)
 * @param {Array} stats.activities - Recent activity items [{title, description, time, avatarUrl?}]
 * @param {string} reportPeriod - Report period e.g. "Feb 1 - Feb 28, 2026"
 * @param {string} reportMonth - Month name e.g. "February"
 */
const sendActivityReportEmail = async (to, name, stats = {}, reportPeriod = '', reportMonth = '') => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://weddingweb.co.in';

  // Defaults
  const totalWeddings = stats.totalWeddings || 0;
  const weddingsGrowth = stats.weddingsGrowth || '+0%';
  const photosUploaded = stats.photosUploaded || 0;
  const photosGrowth = stats.photosGrowth || '+0%';
  const storageUsed = stats.storageUsed || '0 GB';
  const storageTotal = stats.storageTotal || '5 GB';
  const storagePercent = stats.storagePercent || 0;
  const activities = stats.activities || [];

  // Build activity rows
  const activityRows = activities.map(activity => {
    const avatarCell = activity.avatarUrl
      ? `<img src="${activity.avatarUrl}" alt="" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />`
      : `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: rgba(23,84,207,0.1); text-align: center; line-height: 40px; color: #1754cf; font-size: 16px;">📋</div>`;

    return `
      <tr>
        <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="width: 50px; vertical-align: top;">${avatarCell}</td>
              <td style="vertical-align: top; padding-left: 12px;">
                <strong style="font-size: 13px; color: #0f172a; display: block; margin-bottom: 2px;">${activity.title || 'Activity'}</strong>
                <span style="font-size: 12px; color: #64748b;">${activity.description || ''}</span>
              </td>
              <td style="vertical-align: top; text-align: right; white-space: nowrap;">
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">${activity.time || ''}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 700px; margin: 32px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">

        <!-- Header Section -->
        <div style="padding: 32px; border-bottom: 1px solid #f1f5f9;">
          <!-- Logo Row -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
            <tr>
              <td style="vertical-align: middle; padding-right: 10px;">
                <img src="cid:logo" alt="WeddingWeb" style="width: 36px; height: 36px; object-fit: contain; border-radius: 8px;" />
              </td>
              <td style="vertical-align: middle;">
                <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">WeddingWeb</span>
              </td>
            </tr>
          </table>
          <!-- Title -->
          <h1 style="font-size: 26px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;">Your ${reportMonth} Activity Report</h1>
          <p style="font-size: 14px; color: #64748b; margin: 0; font-weight: 500;">Summary for the period ${reportPeriod}</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 32px;">

          <!-- Stats Grid (3 columns) -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 32px;">
            <tr>
              <!-- Stat Card 1: Total Weddings -->
              <td style="width: 33%; vertical-align: top; padding-right: 8px;">
                <div style="padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #fafafa;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                    <tr>
                      <td><span style="display: inline-block; background-color: rgba(23,84,207,0.1); color: #1754cf; padding: 6px; border-radius: 8px; font-size: 18px;">💍</span></td>
                      <td style="text-align: right;"><span style="font-size: 11px; font-weight: 700; color: #059669; background-color: #d1fae5; padding: 3px 8px; border-radius: 4px;">${weddingsGrowth}</span></td>
                    </tr>
                  </table>
                  <p style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Total Weddings</p>
                  <p style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">${totalWeddings}</p>
                </div>
              </td>
              <!-- Stat Card 2: Photos Uploaded -->
              <td style="width: 33%; vertical-align: top; padding: 0 4px;">
                <div style="padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #fafafa;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                    <tr>
                      <td><span style="display: inline-block; background-color: rgba(23,84,207,0.1); color: #1754cf; padding: 6px; border-radius: 8px; font-size: 18px;">📷</span></td>
                      <td style="text-align: right;"><span style="font-size: 11px; font-weight: 700; color: #059669; background-color: #d1fae5; padding: 3px 8px; border-radius: 4px;">${photosGrowth}</span></td>
                    </tr>
                  </table>
                  <p style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Photos Uploaded</p>
                  <p style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0;">${photosUploaded.toLocaleString()}</p>
                </div>
              </td>
              <!-- Stat Card 3: Storage Used -->
              <td style="width: 33%; vertical-align: top; padding-left: 8px;">
                <div style="padding: 20px; border-radius: 12px; border: 1px solid #f1f5f9; background-color: #fafafa;">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 12px;">
                    <tr>
                      <td><span style="display: inline-block; background-color: rgba(23,84,207,0.1); color: #1754cf; padding: 6px; border-radius: 8px; font-size: 18px;">☁️</span></td>
                      <td style="text-align: right;"><span style="font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase;">Capacity</span></td>
                    </tr>
                  </table>
                  <p style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 4px 0;">Storage Used</p>
                  <p style="font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">${storageUsed} <span style="font-size: 13px; font-weight: 400; color: #94a3b8;">of ${storageTotal}</span></p>
                  <!-- Progress Bar -->
                  <div style="height: 6px; width: 100%; background-color: #e2e8f0; border-radius: 50px; overflow: hidden;">
                    <div style="height: 100%; width: ${storagePercent}%; background-color: #1754cf; border-radius: 50px;"></div>
                  </div>
                </div>
              </td>
            </tr>
          </table>

          <!-- Recent Activity Section -->
          ${activities.length > 0 ? `
          <div style="margin-bottom: 32px;">
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-bottom: 1px solid #f1f5f9; margin-bottom: 16px;">
              <tr>
                <td><h2 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0;">Recent Activity</h2></td>
                <td style="text-align: right;"><a href="${frontendUrl}/company/login" style="font-size: 13px; font-weight: 500; color: #1754cf; text-decoration: none;">View All</a></td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
              ${activityRows}
            </table>
          </div>
          ` : ''}

          <!-- CTA Section -->
          <div style="text-align: center; padding: 24px 0 8px 0;">
            <a href="${frontendUrl}/company/login" 
               style="display: inline-block; padding: 16px 40px; background-color: #1754cf; color: #ffffff; font-weight: 700; font-size: 15px; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 14px rgba(23,84,207,0.25);">
              View Full Dashboard →
            </a>
            <p style="font-size: 12px; color: #94a3b8; margin: 16px 0 0 0;">
              Need more features? <a href="${frontendUrl}" style="color: #1754cf; font-weight: 600; text-decoration: none;">Upgrade your plan</a>
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding: 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9;">
          <!-- About & Links Row -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="vertical-align: top; width: 60%;">
                <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">About your report</p>
                <p style="font-size: 11px; color: #64748b; line-height: 1.6; margin: 0;">
                  This monthly performance report is automatically generated based on your WeddingWeb account activity. It helps you track your growth and manage your wedding portfolio.
                </p>
              </td>
              <td style="vertical-align: top; text-align: right;">
                <a href="${frontendUrl}" style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background-color: #e2e8f0; text-align: center; line-height: 32px; color: #475569; text-decoration: none; font-size: 14px; margin: 0 4px;">@</a>
                <a href="${frontendUrl}" style="display: inline-block; width: 32px; height: 32px; border-radius: 50%; background-color: #e2e8f0; text-align: center; line-height: 32px; color: #475569; text-decoration: none; font-size: 14px; margin: 0 4px;">🌐</a>
              </td>
            </tr>
          </table>

          <!-- Bottom Footer -->
          <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0 0 6px 0;">WeddingWeb</p>
            <p style="font-size: 10px; color: #94a3b8; margin: 0 0 4px 0;">weddingweb.co.in</p>
            <p style="font-size: 10px; color: #94a3b8; line-height: 1.5; margin: 8px 0 0 0;">
              You are receiving this because you're a WeddingWeb member.<br/>
              <a href="${frontendUrl}" style="color: #94a3b8; text-decoration: underline;">Unsubscribe</a> or 
              <a href="${frontendUrl}" style="color: #94a3b8; text-decoration: underline;">Manage Preferences</a>
            </p>
            <p style="font-size: 10px; color: #cbd5e1; margin: 12px 0 0 0;">
              &copy; 2026 WeddingWeb AI Inc. Made with ❤️ in Kerala.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `📊 Your ${reportMonth} Activity Report — WeddingWeb`,
    text: `Hi ${name}, here's your ${reportMonth} activity report. Total Weddings: ${totalWeddings}, Photos Uploaded: ${photosUploaded}, Storage: ${storageUsed} of ${storageTotal}. View your full dashboard at ${frontendUrl}/company/login`,
    html
  });
};

/**
 * Send a "Gallery Ready" email to a couple after their wedding
 * @param {string} to - Recipient email
 * @param {string} coupleNames - Names of the couple e.g., "Sarah & James"
 * @param {string} gallerySlug - The slug for the wedding gallery
 * @param {Object} stats - Optional stats about the gallery
 */
const sendGalleryReadyEmail = async (to, coupleNames, gallerySlug, stats = {}) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://weddingweb.co.in';
  const galleryUrl = `${frontendUrl}/weddings/${gallerySlug}`;

  const photoCount = stats.photoCount || '1,200';

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
    <body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: 'Manrope', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
      <div style="max-width: 800px; margin: 0 auto; background-color: #ffffff; min-height: 100vh; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <!-- Header Section -->
        <div style="padding: 24px 40px; border-bottom: 1px solid #f1f5f9; text-align: left;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="vertical-align: middle;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align: middle; padding-right: 10px;">
                      <img src="cid:logo" alt="" style="width: 30px; height: 30px; object-fit: contain;" />
                    </td>
                    <td style="vertical-align: middle;">
                      <span style="font-size: 18px; font-weight: 800; color: #111318; letter-spacing: -0.5px; text-transform: uppercase;">WeddingWeb</span>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <a href="${frontendUrl}" style="font-size: 12px; font-weight: 600; color: #64748b; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-right: 24px;">Portfolio</a>
                <a href="${frontendUrl}/company/login" style="display: inline-block; background-color: #1754cf; color: #ffffff; padding: 10px 20px; border-radius: 8px; font-size: 12px; font-weight: 700; text-decoration: none; text-transform: uppercase; letter-spacing: 1px;">Expert Login</a>
              </td>
            </tr>
          </table>
        </div>

        <!-- Hero Section -->
        <div style="padding: 32px 40px;">
          <div style="border-radius: 12px; overflow: hidden; background-color: #e2e8f0;">
            <img src="cid:hero-gallery" alt="Wedding Couple" style="width: 100%; height: auto; display: block;" />
          </div>
        </div>

        <!-- Greeting & Content -->
        <div style="padding: 0 40px; text-align: center;">
          <h1 style="font-size: 48px; font-weight: 800; color: #111318; margin: 0 0 16px 0; letter-spacing: -2px; line-height: 1.1;">
            Your memories are ready to view, <br/> ${coupleNames}
          </h1>
          <p style="font-size: 18px; font-weight: 300; color: #64748b; line-height: 1.7; margin: 0 auto 40px auto; max-width: 600px;">
            It was a true honor to document your beautiful day. Every laugh, every tear, and every dance move has been preserved for you to cherish forever.
          </p>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; padding-bottom: 48px;">
          <a href="${galleryUrl}" style="display: inline-block; min-width: 240px; padding: 20px 32px; background-color: #1754cf; color: #ffffff; font-weight: 700; font-size: 18px; text-decoration: none; border-radius: 50px; box-shadow: 0 10px 20px rgba(23,84,207,0.2);">
            View Your Gallery &rarr;
          </a>
        </div>

        <!-- AI Experience Section -->
        <div style="background-color: #f8fafc; padding: 48px 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: #1754cf; margin: 0 0 8px 0;">The WeddingWeb Experience</p>
            <h2 style="font-size: 24px; font-weight: 700; color: #111318; margin: 0;">Experience Your Wedding through AI</h2>
          </div>

          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <!-- Feature 1 -->
              <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
                <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background-color: rgba(23,84,207,0.1); color: #1754cf; line-height: 48px; font-size: 24px; margin: 0 auto 16px auto;">📸</div>
                  <h4 style="font-size: 16px; font-weight: 700; color: #111318; margin: 0 0 8px 0;">${photoCount} Photos Organized</h4>
                  <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">AI-powered categorization by ceremony, reception, and portraits.</p>
                </div>
              </td>
              <!-- Feature 2 -->
              <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
                <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background-color: rgba(23,84,207,0.1); color: #1754cf; line-height: 48px; font-size: 24px; margin: 0 auto 16px auto;">👤</div>
                  <h4 style="font-size: 16px; font-weight: 700; color: #111318; margin: 0 0 8px 0;">Facial Recognition</h4>
                  <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">Find every photo of your family and friends instantly with smart sorting.</p>
                </div>
              </td>
              <!-- Feature 3 -->
              <td style="width: 33.33%; padding: 0 10px; vertical-align: top;">
                <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; text-align: center;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background-color: rgba(23,84,207,0.1); color: #1754cf; line-height: 48px; font-size: 24px; margin: 0 auto 16px auto;">✨</div>
                  <h4 style="font-size: 16px; font-weight: 700; color: #111318; margin: 0 0 8px 0;">Smart Highlights</h4>
                  <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">An AI-curated selection of the most emotional and iconic moments.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Footer -->
        <div style="padding: 48px 40px; text-align: center; border-top: 1px solid #f1f5f9;">
          <div style="margin-bottom: 32px;">
            <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 12px;">📸</a>
            <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 12px;">🔗</a>
            <a href="#" style="color: #94a3b8; text-decoration: none; margin: 0 12px;">✉️</a>
          </div>
          <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #111318; margin: 0 0 8px 0;">WeddingWeb Studio</p>
          <p style="font-size: 11px; color: #94a3b8; margin: 0 0 16px 0;">&copy; 2026 WeddingWeb AI Inc. All Rights Reserved.</p>
          <p style="font-size: 11px; color: #94a3b8; font-style: italic; margin: 0 0 32px 0;">Captured with love, delivered with intelligence.</p>
          <div style="border-top: 1px solid #f1f5f9; padding-top: 32px;">
            <a href="#" style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; text-decoration: underline;">Unsubscribe from notifications</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `✨ Your Wedding Memories are Ready: ${coupleNames}`,
    text: `Hi ${coupleNames}, your wedding memories are ready to view! Check them out at ${galleryUrl}`,
    html
  });
};

/**
 * Send contact enquiry emails (auto-reply to customer and alert to admin)
 * @param {Object} data - Enquiry data (name, email, message, trackingId, context, aiReply)
 */
const sendContactEnquiryEmails = async (data) => {
  const { name, email, message, trackingId, context, aiReply } = data;
  const adminEmail = process.env.ADMIN_EMAIL || 'help.weddingweb@gmail.com';
  const frontendUrl = process.env.FRONTEND_URL || 'https://weddingweb.co.in';

  // 1. Send Auto-Reply to Customer
  const customerHtml = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="cid:logo" alt="WeddingWeb" style="width: 50px; height: 50px; object-fit: contain;">
        <h2 style="color: #1754cf;">Thank you for contacting WeddingWeb!</h2>
      </div>
      <p style="font-size: 16px; color: #334155;">Hi ${name},</p>
      <p style="font-size: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${aiReply}</p>
      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Tracking ID: ${trackingId} | <a href="${frontendUrl}" style="color: #94a3b8;">weddingweb.co.in</a>
      </p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Thanks for contacting WeddingWeb',
    text: `Hi ${name},\n\n${aiReply}\n\nBest regards,\nTeam WeddingWeb`,
    html: customerHtml
  });

  // 2. Send Admin Notification
  const adminHtml = `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>New Enquiry Received</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>Tracking ID</b></td><td style="padding: 8px; border: 1px solid #ddd;">${trackingId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>Name</b></td><td style="padding: 8px; border: 1px solid #ddd;">${name}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>Email</b></td><td style="padding: 8px; border: 1px solid #ddd;">${email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>Context</b></td><td style="padding: 8px; border: 1px solid #ddd;">${context || 'Contact Form'}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><b>Message</b></td><td style="padding: 8px; border: 1px solid #ddd;">${message}</td></tr>
      </table>
      <h3>AI Generated Reply:</h3>
      <p style="background: #f9f9f9; padding: 15px; border-left: 4px solid #1754cf;">${aiReply}</p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New enquiry from ${name}`,
    text: `New enquiry from ${name}\nEmail: ${email}\nMessage: ${message}\nAI Reply: ${aiReply}`,
    html: adminHtml
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
  sendTestEmail,
  sendInvitationEmail,
  sendActivityReportEmail,
  sendGalleryReadyEmail,
  sendContactEnquiryEmails
};
