/**
 * Seed notifications for the current user
 */
const { query } = require('../lib/db-gcp');
const NotificationService = require('../services/notification-service');

async function seed() {
    console.log('Seeding sample notifications...');

    try {
        // Get the first user (likely the admin/test user)
        const { rows: users } = await query('SELECT id, username FROM users LIMIT 1');
        if (users.length === 0) {
            console.error('No users found to seed notifications for.');
            process.exit(1);
        }

        const userId = users[0].id;
        console.log(`Seeding for user: ${users[0].username} (${userId})`);

        // 1. Personal Notification
        await NotificationService.createNotification(userId, {
            title: 'Profile Updated',
            message: 'Your photographer profile details were successfully updated.',
            type: 'success',
            category: 'personal',
            link: '/company/settings?tab=general'
        });

        // 2. Marketing/Offer Notification
        await NotificationService.createNotification(userId, {
            title: 'Special Offer: 20% Off Premium',
            message: 'Upgrade to our Platinum plan today and save 20% on your first month. Use code: WEDDING20',
            type: 'info',
            category: 'marketing',
            link: '/company/pricing'
        });

        // 3. System update
        await NotificationService.createNotification(userId, {
            title: 'New Feature: AI Bio Generator',
            message: 'Try our new Magic Button in settings to write your professional bio in seconds!',
            type: 'info',
            category: 'marketing',
            link: '/company/settings'
        });

        console.log('Sample notifications seeded successfully.');
    } catch (error) {
        console.error('Error seeding notifications:', error);
        process.exit(1);
    }

    process.exit(0);
}

seed();
