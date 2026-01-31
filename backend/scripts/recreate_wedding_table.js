require('dotenv').config({ path: '../.env' });
const { query } = require('../lib/db-gcp');

async function recreateTable() {
    try {
        console.log('🗑️ Dropping weddings table...');
        await query('DROP TABLE IF EXISTS weddings CASCADE');

        console.log('🏗️ Creating weddings table...');
        await query(`
            CREATE TABLE weddings (
                user_id UUID PRIMARY KEY,
                groom_name TEXT,
                bride_name TEXT,
                wedding_date TEXT,
                venue TEXT,
                guest_count INTEGER,
                theme TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Weddings table recreated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error recreating table:', error);
        process.exit(1);
    }
}

recreateTable();
