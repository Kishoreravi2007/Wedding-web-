const { query } = require('./lib/db-gcp');

async function listAdmins() {
    console.log('🛡️ Listing all admin accounts in SQL database...\n');
    try {
        const { rows } = await query(
            `SELECT u.id, u.username, u.role, u.is_active, p.email, p.full_name
       FROM users u
       LEFT JOIN profiles p ON u.id = p.user_id::uuid OR u.username = p.email
       WHERE u.role = 'admin'`
        );

        if (rows.length === 0) {
            console.log('No users with "admin" role found.');
            return;
        }

        rows.forEach((user, i) => {
            console.log(`${i + 1}. Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Full Name: ${user.full_name}`);
            console.log(`   Active: ${user.is_active}`);
            console.log(`   ID: ${user.id}`);
            console.log('─'.repeat(40));
        });
    } catch (err) {
        console.error('Error listing admins:', err);
    }
}

listAdmins().then(() => process.exit(0));
