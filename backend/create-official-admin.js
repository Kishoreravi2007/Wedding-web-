/**
 * Create/Update Official Admin User: Kishore Ravi
 * Username: admin@weddingweb.co.in
 * Password: Kishore@2007
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { query } = require('./lib/db-gcp');

async function setupOfficialAdmin() {
    console.log('🔐 Setting up official admin: Kishore Ravi');
    console.log('===========================================\n');

    const username = 'admin@weddingweb.co.in';
    const password = 'Kishore@2007';
    const fullName = 'Kishore Ravi';
    const role = 'admin';

    try {
        // Step 1: Check if user already exists
        console.log('1️⃣ Checking if user already exists...');
        const { rows: existingUsers } = await query(
            'SELECT id FROM users WHERE LOWER(username) = $1',
            [username.toLowerCase()]
        );

        let userId;
        const hashedPassword = await bcrypt.hash(password, 12);

        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
            console.log(`⚠️ User already exists (ID: ${userId}). Updating password...`);

            await query(
                'UPDATE users SET password = $1, role = $2, is_active = true WHERE id = $3',
                [hashedPassword, role, userId]
            );
            console.log('✅ User credentials updated.');
        } else {
            console.log('2️⃣ Creating new user in database...');
            const { rows: newUsers } = await query(
                `INSERT INTO users (username, password, role, is_active, created_at)
                 VALUES ($1, $2, $3, true, NOW())
                 RETURNING id`,
                [username.toLowerCase(), hashedPassword, role]
            );
            userId = newUsers[0].id;
            console.log(`✅ User created successfully (ID: ${userId}).`);
        }

        // Step 3: Update Profile
        console.log('3️⃣ Syncing profile name...');
        const { rows: profiles } = await query(
            'SELECT id FROM profiles WHERE user_id = $1::text OR email = $2',
            [userId, username.toLowerCase()]
        );

        if (profiles.length > 0) {
            await query(
                'UPDATE profiles SET full_name = $1, email = $2, updated_at = NOW() WHERE id = $3',
                [fullName, username.toLowerCase(), profiles[0].id]
            );
            console.log('✅ Profile updated.');
        } else {
            await query(
                `INSERT INTO profiles (user_id, full_name, email, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                [userId.toString(), fullName, username.toLowerCase()]
            );
            console.log('✅ New profile created.');
        }

        console.log('\n🎉 Admin Setup Complete!');
        console.log('-------------------------------------------');
        console.log(`Username: ${username}`);
        console.log(`Password: ${password}`);
        console.log(`Name:     ${fullName}`);
        console.log('-------------------------------------------');

    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

setupOfficialAdmin();
