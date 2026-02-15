const { query } = require('./lib/db-gcp');
const bcrypt = require('bcryptjs');

async function setupAdminUser() {
    console.log('🔐 Setting up Admin User (Direct DB Connection)');
    console.log('==============================================\n');

    try {
        // 1. Create table
        console.log('1️⃣ Ensuring users table exists...');
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
        await query(createTableSQL);
        console.log('✅ Users table ready\n');

        // 2. Hash password
        console.log('2️⃣ Hashing password...');
        const username = 'kishore';
        const password = 'qwerty123';
        const role = 'admin';
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Insert/Update User
        console.log('3️⃣ Creating/updating admin user...');

        // Check if user exists
        const checkUser = await query('SELECT * FROM users WHERE username = $1', [username]);

        if (checkUser.rowCount > 0) {
            console.log('   User exists, updating password...');
            await query(
                'UPDATE users SET password = $1, role = $2, updated_at = CURRENT_TIMESTAMP WHERE username = $3',
                [hashedPassword, role, username]
            );
        } else {
            console.log('   Creating new user...');
            await query(
                'INSERT INTO users (username, password, role, is_active) VALUES ($1, $2, $3, true)',
                [username, hashedPassword, role]
            );
        }

        console.log('✅ Admin user created/updated successfully!\n');

        console.log('\n🎉 Admin User Setup Complete!');
        console.log('=====================================');
        console.log('Username: kishore');
        console.log('Password: qwerty123');
        console.log('=====================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupAdminUser();
