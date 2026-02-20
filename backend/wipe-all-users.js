const { query } = require('./lib/db-gcp');

async function wipeAllUsers() {
    console.log('☢️ Wiping ALL users from SQL database...\n');
    try {
        // Delete from profiles first due to FK constraints if any
        await query("DELETE FROM profiles");
        console.log('✅ Profiles wiped.');

        const { rowCount } = await query("DELETE FROM users");
        console.log(`✅ Successfully deleted ${rowCount} user accounts.`);
    } catch (err) {
        console.error('❌ Error wiping users:', err);
    }
}

wipeAllUsers().then(() => process.exit(0));
