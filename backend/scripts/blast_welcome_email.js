/**
 * Script to send AI-generated welcome emails to all existing users.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { query } = require('../lib/db-gcp');
const emailService = require('../services/email-service');

async function blastWelcomeEmails() {
    console.log('🚀 Starting Welcome Email Blast...');

    try {
        // Fetch all users with their full names from profiles if available
        const { rows: users } = await query(`
            SELECT u.id, u.username, u.email_offers_opt_in, p.full_name 
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id::uuid
        `);
        console.log(`📊 Found ${users.length} users in the database.`);

        let successCount = 0;
        let failCount = 0;
        let skipCount = 0;

        for (const user of users) {
            const email = user.username; // In this app, username is often the email

            // Basic email validation
            if (!email || !email.includes('@')) {
                console.log(`⏩ Skipping user ${user.id} (${user.username}) - invalid email format.`);
                skipCount++;
                continue;
            }

            // We send welcome emails even if opt-in is false, 
            // as this is a transactional-style 'welcome' back/intro.
            // However, we could respect it if desired. 
            // User requested 'all existing users', so we proceed.

            try {
                console.log(`📧 Sending AI Welcome Email to: ${email}...`);
                const displayName = user.full_name || email.split('@')[0];
                const result = await emailService.sendWelcomeEmailAI(email, displayName);

                if (result.success) {
                    successCount++;
                } else {
                    console.error(`❌ Failed to send to ${email}:`, result.error);
                    failCount++;
                }
            } catch (error) {
                console.error(`❌ Error processing user ${email}:`, error);
                failCount++;
            }

            // Small delay to avoid hitting rate limits or overwhelming the AI
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log('\n--- Blast Results ---');
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`⏩ Skipped: ${skipCount}`);
        console.log('----------------------');

    } catch (error) {
        console.error('💥 Blast failed with fatal error:', error);
    }

    process.exit(0);
}

blastWelcomeEmails();
