const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('🚀 Starting Email Opt-in Migration...');

        const query = `
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS email_offers_opt_in BOOLEAN DEFAULT FALSE;
        `;

        await client.query(query);
        console.log('✅ Column email_offers_opt_in added successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        await client.end();
    }
}

migrate();
