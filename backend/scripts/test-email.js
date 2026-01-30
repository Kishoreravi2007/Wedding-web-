/**
 * Test script for backend email delivery
 * Run with: node backend/scripts/test-email.js <recipient_email>
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const { sendTestEmail } = require('../services/email-service');

const recipient = process.argv[2] || 'help.weddingweb@gmail.com';

async function runTest() {
    console.log(`🚀 Sending test email to: ${recipient}...`);

    if (!process.env.EMAIL_PASSWORD) {
        console.warn('⚠️ Warning: EMAIL_PASSWORD is not set in .env. This test will likely fail.');
    }

    const result = await sendTestEmail(recipient);

    if (result.success) {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
    } else {
        console.error('❌ Test email failed:', result.error);
        process.exit(1);
    }
}

runTest();
