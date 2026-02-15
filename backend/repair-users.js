const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function repair() {
    const client = await pool.connect();
    try {
        console.log('🔨 Repairing public.users schema...');

        const queries = [
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS has_premium_access BOOLEAN DEFAULT false',
            'ALTER TABLE users ADD COLUMN IF NOT EXISTS wedding_id UUID',

            'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()',
            'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0',
            'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS user_id UUID',

            // Ensure guests table is correct
            `CREATE TABLE IF NOT EXISTS guests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        group_name TEXT,
        rsvp_status TEXT DEFAULT 'pending',
        dietary_requirements TEXT,
        plus_one BOOLEAN DEFAULT FALSE,
        rsvp_token TEXT UNIQUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
            'ALTER TABLE guests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()'
        ];

        for (const q of queries) {
            try {
                await client.query(q);
                console.log(`✅ ${q.substring(0, 50)}...`);
            } catch (e) {
                console.warn(`❌ Fail: ${q.substring(0, 50)}... - ${e.message}`);
            }
        }
    } finally {
        client.release();
        await pool.end();
    }
}

repair();
