const { query } = require('./backend/lib/db-gcp');

async function debugProfile() {
    try {
        console.log('🔍 Fetching latest user...');
        const { rows: users } = await query('SELECT * FROM users ORDER BY created_at DESC LIMIT 1');

        if (users.length === 0) {
            console.log('❌ No users found.');
            return;
        }

        const user = users[0];
        console.log('👤 Latest User:', {
            id: user.id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
        });

        console.log(`🔍 Fetching profile for user ${user.id}...`);
        const { rows: profiles } = await query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);

        if (profiles.length === 0) {
            console.log('⚠️ No profile found for this user!');
        } else {
            console.log('✅ Profile found:', profiles[0]);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

debugProfile();
