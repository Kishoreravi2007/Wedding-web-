require('dotenv').config({ path: '../.env' });
const { query } = require('../lib/db-gcp');

async function createTable() {
    try {
        console.log('🏗️ Creating weddings table...');
        await query(`
            CREATE TABLE IF NOT EXISTS weddings (
                user_id UUID PRIMARY KEY, -- Removed REFERENCES users(id) to avoid FK issues if types mismatch, usually UUID
                groom_name TEXT,
                bride_name TEXT,
                wedding_date TEXT, -- Storing as text for simplicity or TIMESTAMP
                venue TEXT,
                guest_count INTEGER,
                theme TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('✅ Weddings table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating table:', error);
        process.exit(1);
    }
}

createTable();
