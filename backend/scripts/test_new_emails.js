/**
 * Quick test script to send the new welcome + activity report emails
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { sendWelcomeEmail, sendActivityReportEmail, sendGalleryReadyEmail } = require('../services/email-service');

const TARGET_EMAIL = 'kishorekailas2@gmail.com';

async function main() {
    console.log('📧 Sending test emails to:', TARGET_EMAIL);
    console.log('');

    // 1. Test Welcome Email
    console.log('1️⃣  Sending Welcome Email...');
    try {
        const result1 = await sendWelcomeEmail(TARGET_EMAIL, 'Kishore');
        console.log('   ✅ Welcome Email:', result1.success ? 'Sent!' : 'Failed', result1.messageId || result1.error);
    } catch (err) {
        console.error('   ❌ Welcome Email error:', err.message);
    }

    console.log('');

    // 2. Test Activity Report Email
    console.log('2️⃣  Sending Activity Report Email...');
    try {
        const result2 = await sendActivityReportEmail(TARGET_EMAIL, 'Kishore', {
            totalWeddings: 12,
            weddingsGrowth: '+15%',
            photosUploaded: 8432,
            photosGrowth: '+8%',
            storageUsed: '1.2 TB',
            storageTotal: '2 TB',
            storagePercent: 60,
            activities: [
                {
                    title: 'Sarah & David Johnson',
                    description: 'Downloaded 142 photos from "Wedding Ceremony" gallery',
                    time: '2 hours ago'
                },
                {
                    title: 'Mark Thompson',
                    description: 'Purchased 3 high-res prints from "Portrait Session"',
                    time: 'Yesterday'
                },
                {
                    title: 'New Shared Gallery',
                    description: '"The Miller Anniversary" was shared with 4 recipients',
                    time: 'Feb 14'
                }
            ]
        }, 'Feb 1 - Feb 16, 2026', 'February');
        console.log('   ✅ Activity Report:', result2.success ? 'Sent!' : 'Failed', result2.messageId || result2.error);
    } catch (err) {
        console.error('   ❌ Activity Report error:', err.message);
    }

    // 3. Test Gallery Ready Email
    console.log('3️⃣  Sending Gallery Ready Email...');
    try {
        const result3 = await sendGalleryReadyEmail(TARGET_EMAIL, 'Sarah & James', 'sarah-james-2026', {
            photoCount: '1,248'
        });
        console.log('   ✅ Gallery Ready Email:', result3.success ? 'Sent!' : 'Failed', result3.messageId || result3.error);
    } catch (err) {
        console.error('   ❌ Gallery Ready Email error:', err.message);
    }

    console.log('');
    console.log('🎉 Done! Check your inbox at', TARGET_EMAIL);
}

main();
