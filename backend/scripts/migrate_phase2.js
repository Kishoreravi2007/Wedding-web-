require('dotenv').config({ path: '../.env' });
const { query } = require('../lib/db-gcp');

async function migrate() {
    try {
        console.log('🏗️ Starting Phase 2 Migrations...');

        // Ensure UUID extension
        await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        console.log('✅ UUID extension ready.');

        // Guests Table
        await query(`
            CREATE TABLE IF NOT EXISTS guests (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                group_name TEXT,
                rsvp_status TEXT DEFAULT 'pending',
                dietary_requirements TEXT,
                plus_one BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Guests table created.');

        // Timeline Table
        await query(`
            CREATE TABLE IF NOT EXISTS event_timeline (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                event_time TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                location TEXT,
                sort_order INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log('✅ Event Timeline table created.');

        console.log('🎉 Phase 2 Migrations Completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
