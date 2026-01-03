/**
 * Create Photographer User in Production Database
 * 
 * This script connects to the production Cloud SQL database
 * and creates the photographer user with credentials:
 * Username: photographer
 * Password: photo123
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');

// For production, we'll use the DATABASE_URL from .env
const { Pool } = require('pg');

async function createPhotographerUser() {
    console.log('🔐 Creating Photographer User in Production Database...\n');

    // Create connection pool
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        // Test connection
        console.log('1️⃣ Testing database connection...');
        await pool.query('SELECT NOW()');
        console.log('✅ Connected to database successfully\n');

        // Generate bcrypt hash for password
        console.log('2️⃣ Generating secure password hash...');
        const password = 'photo123';
        const passwordHash = await bcrypt.hash(password, 10);
        console.log('✅ Password hash generated\n');

        // Check if user already exists
        console.log('3️⃣ Checking if photographer user exists...');
        const { rows: existingUsers } = await pool.query(
            "SELECT id, username, role FROM users WHERE username = 'photographer'"
        );

        if (existingUsers.length > 0) {
            console.log('ℹ️  Photographer user already exists!');
            console.log(`   ID: ${existingUsers[0].id}`);
            console.log(`   Username: ${existingUsers[0].username}`);
            console.log(`   Role: ${existingUsers[0].role}\n`);

            // Update password
            console.log('4️⃣ Updating password...');
            await pool.query(
                "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE username = 'photographer'",
                [passwordHash]
            );
            console.log('✅ Password updated successfully!\n');
        } else {
            // Create new user
            console.log('4️⃣ Creating new photographer user...');
            const { rows: newUsers } = await pool.query(
                `INSERT INTO users (username, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, username, role`,
                ['photographer', passwordHash, 'photographer', true]
            );

            console.log('✅ Photographer user created successfully!');
            console.log(`   ID: ${newUsers[0].id}`);
            console.log(`   Username: ${newUsers[0].username}`);
            console.log(`   Role: ${newUsers[0].role}\n`);
        }

        // Test authentication
        console.log('5️⃣ Testing authentication...');
        const { rows: users } = await pool.query(
            "SELECT id, username, password_hash, role FROM users WHERE username = 'photographer'"
        );

        if (users.length > 0) {
            const isValid = await bcrypt.compare('photo123', users[0].password_hash);
            if (isValid) {
                console.log('✅ Authentication test passed!\n');
            } else {
                console.log('❌ Authentication test failed!\n');
            }
        }

        // Success summary
        console.log('🎉 Setup Complete!');
        console.log('==================\n');
        console.log('Photographer Portal Credentials:');
        console.log('  Username: photographer');
        console.log('  Password: photo123\n');
        console.log('Login URLs:');
        console.log('  Production: https://weddingweb.co.in/photographer-login');
        console.log('  Local: http://localhost:3000/photographer-login\n');

        await pool.end();
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('  1. Check DATABASE_URL in .env file');
        console.error('  2. Ensure Cloud SQL allows connections from your IP');
        console.error('  3. Verify database name and credentials');
        console.error('  4. Check if users table exists\n');

        await pool.end();
        process.exit(1);
    }
}

createPhotographerUser();
