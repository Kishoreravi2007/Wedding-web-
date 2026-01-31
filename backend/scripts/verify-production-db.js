const { Client } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

async function verifyAndFixProductionDB() {
    console.log('🔍 PRODUCTION DATABASE VERIFICATION');
    console.log('='.repeat(50));

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('❌ Error: DATABASE_URL not found in .env file');
        process.exit(1);
    }

    console.log('📡 Connecting to:', connectionString.split('@')[1]?.split('/')[0] || 'database');

    const client = new Client({
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected to Production Database\n');

        // 1. List all current columns in users table
        console.log('📋 Current columns in users table:');
        const colsResult = await client.query(`
            SELECT column_name, data_type, column_default
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position;
        `);

        colsResult.rows.forEach(row => {
            console.log(`   - ${row.column_name} (${row.data_type}) ${row.column_default ? `DEFAULT ${row.column_default}` : ''}`);
        });

        // 2. Check for required columns
        const requiredColumns = [
            'is_2fa_enabled',
            'two_factor_secret',
            'email_offers_opt_in',
            'is_active',
            'login_attempts',
            'last_login_attempt',
            'locked_until'
        ];

        const existingColumns = colsResult.rows.map(r => r.column_name);
        const missingColumns = requiredColumns.filter(c => !existingColumns.includes(c));

        console.log('\n📊 Column Check:');
        requiredColumns.forEach(col => {
            const exists = existingColumns.includes(col);
            console.log(`   ${exists ? '✅' : '❌'} ${col}`);
        });

        if (missingColumns.length > 0) {
            console.log('\n🔧 Adding missing columns...');

            const migrations = {
                'is_2fa_enabled': 'ALTER TABLE users ADD COLUMN is_2fa_enabled BOOLEAN DEFAULT FALSE;',
                'two_factor_secret': 'ALTER TABLE users ADD COLUMN two_factor_secret TEXT;',
                'email_offers_opt_in': 'ALTER TABLE users ADD COLUMN email_offers_opt_in BOOLEAN DEFAULT TRUE;',
                'is_active': 'ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;',
                'login_attempts': 'ALTER TABLE users ADD COLUMN login_attempts INTEGER DEFAULT 0;',
                'last_login_attempt': 'ALTER TABLE users ADD COLUMN last_login_attempt TIMESTAMP WITH TIME ZONE;',
                'locked_until': 'ALTER TABLE users ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;'
            };

            for (const col of missingColumns) {
                try {
                    await client.query(migrations[col]);
                    console.log(`   ✅ Added ${col}`);
                } catch (e) {
                    console.log(`   ⚠️ ${col}: ${e.message}`);
                }
            }
        } else {
            console.log('\n✅ All required columns exist!');
        }

        // 3. Verify again
        console.log('\n📊 Final Verification:');
        const finalResult = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'users'
            AND column_name IN ('is_2fa_enabled', 'two_factor_secret', 'email_offers_opt_in', 'is_active')
            ORDER BY column_name;
        `);

        finalResult.rows.forEach(row => {
            console.log(`   ✅ ${row.column_name} (${row.data_type})`);
        });

        console.log('\n✅ Database verification complete!');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await client.end();
        console.log('👋 Disconnected');
    }
}

verifyAndFixProductionDB();
