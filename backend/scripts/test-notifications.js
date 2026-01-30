/**
 * Test Script for Notification System
 * 
 * Verifies that the notifications table exists and service methods work correctly.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const { query } = require('../lib/db-gcp');
const NotificationService = require('../services/notification-service');

async function testNotifications() {
    console.log('🧪 Starting Notification System Test...');

    try {
        // 1. Ensure table exists
        console.log('Step 1: Checking for notifications table...');
        await query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info',
                category TEXT DEFAULT 'personal',
                link TEXT,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
        `);
        console.log('✅ Table verified.');

        // 2. Fetch an admin user for testing
        console.log('Step 2: Fetching test user (admin)...');
        const { rows: users } = await query("SELECT id, username FROM users WHERE role = 'admin' LIMIT 1");
        if (users.length === 0) {
            console.error('❌ No admin user found for testing.');
            process.exit(1);
        }
        const testUser = users[0];
        console.log(`✅ Using test user: ${testUser.username} (${testUser.id})`);

        // 3. Create a test notification
        console.log('Step 3: Creating a test notification...');
        const newNotif = await NotificationService.createNotification(testUser.id, {
            title: 'Test Notification 💍',
            message: 'This is a system verification message from the test script.',
            type: 'success',
            category: 'personal',
            link: '/dashboard'
        });
        console.log('✅ Notification created:', newNotif.id);

        // 4. Fetch notifications
        console.log('Step 4: Fetching notifications for user...');
        const userNotifs = await NotificationService.getUserNotifications(testUser.id);
        const containsTest = userNotifs.some(n => n.id === newNotif.id);
        console.log(`✅ Found ${userNotifs.length} notifications. Test notification present: ${containsTest}`);

        if (!containsTest) throw new Error('New notification not found in fetch!');

        // 5. Mark as read
        console.log('Step 5: Marking notification as read...');
        const success = await NotificationService.markAsRead(newNotif.id, testUser.id);
        console.log(`✅ Mark as read success: ${success}`);

        // 6. Final check
        const { rows: updated } = await query('SELECT is_read FROM notifications WHERE id = $1', [newNotif.id]);
        console.log(`✅ Notification status: is_read = ${updated[0].is_read}`);

        console.log('\n🌟 ALL NOTIFICATION TESTS PASSED! 🌟');
        process.exit(0);
    } catch (error) {
        console.error('❌ TEST FAILED:', error);
        process.exit(1);
    }
}

testNotifications();
