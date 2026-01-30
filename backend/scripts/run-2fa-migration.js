const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    console.log('🚀 Starting 2FA Migration on Production...');

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Required for Supabase/Cloud SQL SSL connections
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database');

        const migrationSql = fs.readFileSync(path.join(__dirname, '../2fa_migration.sql'), 'utf8');
        console.log('📝 Executing migration SQL...');

        await client.query(migrationSql);

        console.log('✨ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Database connection closed');
    }
}

runMigration();
