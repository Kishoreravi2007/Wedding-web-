const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

async function fixProductionDB() {
    console.log('🚀 Starting Production Database Fix...');

    // Use the DATABASE_URL from .env
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL not found in .env file');
        process.exit(1);
    }

    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Production Database');

        const sql = `
            -- 1. Add missing columns to users table
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_offers_opt_in') THEN
                    ALTER TABLE users ADD COLUMN email_offers_opt_in BOOLEAN DEFAULT TRUE;
                    RAISE NOTICE 'Added email_offers_opt_in column';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_2fa_enabled') THEN
                    ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT FALSE;
                    RAISE NOTICE 'Added is_2fa_enabled column';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='two_factor_secret') THEN
                    ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
                    RAISE NOTICE 'Added two_factor_secret column';
                END IF;
            END $$;

            -- 2. Verify results
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('email_offers_opt_in', 'is_2fa_enabled', 'two_factor_secret');
        `;

        const res = await client.query(sql);
        console.log('✅ Migration completed!');
        console.log('Columns currently in users table:');
        res[1].rows.forEach(row => {
            console.log(`- ${row.column_name} (${row.data_type})`);
        });

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        await client.end();
        console.log('👋 Disconnected');
    }
}

fixProductionDB();
