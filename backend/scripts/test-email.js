/**
 * Standalone Email Diagnostic Script
 * Use this to test SMTP configuration independently.
 */
require('dotenv').config({ path: __dirname + '/../.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('🚀 Starting Email Diagnostic...');
    console.log('-----------------------------------');

    if (process.env.RESEND_API_KEY) {
        console.log('📡 Provider: Resend API');
        console.log(`🔑 API Key: Found (${process.env.RESEND_API_KEY.substring(0, 5)}...)`);
    } else {
        console.log('📡 Provider: SMTP (Gmail/Custom)');
        console.log(`🏠 Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
        console.log(`📍 Port: ${process.env.SMTP_PORT || '465 (Default)'}`);
        console.log(`👤 User: ${process.env.EMAIL_USER || process.env.SMTP_USER}`);
    }
    console.log('-----------------------------------');

    const testRecipient = process.argv[2] || process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

    if (process.env.RESEND_API_KEY) {
        try {
            console.log(`📧 Sending test email via Resend to: ${testRecipient}...`);
            const fetch = require('node-fetch');
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: process.env.SMTP_FROM || 'onboarding@resend.dev',
                    to: testRecipient,
                    subject: 'WeddingWeb Resend Diagnostic 🧪',
                    html: '<h1>Resend API Success!</h1><p>Your production Resend integration is operational.</p>'
                }),
            });
            const result = await response.json();
            if (response.ok) {
                console.log('✅ Resend Email sent successfully!');
                console.log('🆔 ID:', result.id);
            } else {
                console.error('❌ Resend API Error:', result.message);
            }
        } catch (e) {
            console.error('❌ Resend Diagnostic Failed:', e.message);
        }
        return;
    }

    const transporter = nodemailer.createTransport({
        service: (!process.env.SMTP_HOST || process.env.SMTP_HOST === 'smtp.gmail.com') ? 'gmail' : undefined,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
        auth: {
            user: process.env.EMAIL_USER || process.env.SMTP_USER,
            pass: process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('🔍 Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Successful!');

        if (!testRecipient) {
            console.log('⚠️ No recipient specified. Skipping test email send.');
            console.log('Usage: node backend/scripts/test-email.js <recipient-email>');
            return;
        }

        console.log(`📧 Sending test email to: ${testRecipient}...`);
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || `"WeddingWeb Tester" <${process.env.EMAIL_USER}>`,
            to: testRecipient,
            subject: 'WeddingWeb Production Diagnostic Email (Port 465) 🧪',
            text: 'If you are reading this, your production SMTP configuration (Port 465) is working correctly.',
            html: '<h1>SMTP Diagnostic Success!</h1><p>Your production email service (Port 465) is operational.</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('🆔 Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Diagnostic Failed:');
        console.error('   Code:', error.code);
        console.error('   Message:', error.message);
        if (error.response) console.error('   Response:', error.response);

        console.log('\n💡 TROUBLESHOOTING TIPS:');
        if (error.code === 'EAUTH') {
            console.log('   - Verify GMAIL_APP_PASSWORD is correct.');
            console.log('   - Ensure 2FA is enabled on the Gmail account.');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED' || error.code === 'ESOCKET') {
            console.log('   - Port 587 and 25 are often blocked on cloud providers like Render.');
            console.log('   - We have switched to Port 465 (SMTPS) for better compatibility.');
            console.log('   - Ensure your firewall allows outgoing traffic on Port 465.');
        }
    }
}

testEmail();
