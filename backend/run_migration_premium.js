const { query } = require('./lib/db-gcp');

async function run() {
    try {
        console.log('Adding has_premium_access column to users table...');
        await query('ALTER TABLE users ADD COLUMN IF NOT EXISTS has_premium_access BOOLEAN DEFAULT FALSE;');
        console.log('✅ Success: has_premium_access column added.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error applying migration:', err);
        process.exit(1);
    }
}

run();
