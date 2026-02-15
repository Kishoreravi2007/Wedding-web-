const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function repair() {
    const client = await pool.connect();
    try {
        console.log('🔨 Final Database Repair...');

        const queries = [
            // Notifications Table
            `CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        category TEXT DEFAULT 'personal',
        link TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
            'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE',

            // event_timeline Table
            `CREATE TABLE IF NOT EXISTS event_timeline (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_date DATE,
        event_time TIME,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        location_map_url TEXT,
        photo_url TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,

            // payment_history and premium_memberships (already likely exists but ensures types)
            'ALTER TABLE payment_history ALTER COLUMN amount TYPE NUMERIC(10,2)',
            'ALTER TABLE premium_memberships ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)'
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
