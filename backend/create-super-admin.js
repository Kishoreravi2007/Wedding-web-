require('dotenv').config({ path: __dirname + '/.env' });
const { query } = require('./lib/db-gcp');
const bcrypt = require('bcryptjs');

async function createSuperAdmin() {
    const email = 'kishorekailas1@gmail.com';
    const password = 'Kishore@2007';
    const role = 'admin';
    const fullName = 'Kishore Ravi';

    console.log(`🛡️ Creating Super Admin: ${email}\n`);

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const { rows } = await query(
            `INSERT INTO users (username, password, role, is_active, created_at)
       VALUES ($1, $2, $3, true, NOW())
       RETURNING id, username, role`,
            [email, hashedPassword, role]
        );

        const user = rows[0];
        console.log(`✅ User created: ${user.username} (ID: ${user.id})`);

        // Create profile
        await query(
            `INSERT INTO profiles (user_id, full_name, email, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())`,
            [user.id, fullName, email]
        );
        console.log(`✅ Profile created for ${fullName}`);

        console.log(`\n🔐 Login Credentials:`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    }
}

createSuperAdmin().then(() => process.exit(0));
