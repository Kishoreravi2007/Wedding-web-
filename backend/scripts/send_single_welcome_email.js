/**
 * One-off script to send AI-generated welcome email to a specific address.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const emailService = require('../services/email-service');

async function sendSingleEmail() {
    const targetEmail = 'kr5770203@gmail.com';
    const targetName = 'Kishore Ravi';

    console.log(`📧 Sending AI Welcome Email to: ${targetEmail}...`);

    try {
        const result = await emailService.sendWelcomeEmailAI(targetEmail, targetName);
        if (result.success) {
            console.log(`✅ Success! Welcome email sent to ${targetEmail}`);
        } else {
            console.error(`❌ Failed:`, result.error);
        }
    } catch (error) {
        console.error(`💥 Fatal error:`, error);
    }

    process.exit(0);
}

sendSingleEmail();
