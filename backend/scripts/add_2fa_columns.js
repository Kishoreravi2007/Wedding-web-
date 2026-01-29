const { query } = require('../lib/db-gcp');

async function migrate() {
    try {
        console.log('🔄 Checking users table for 2FA columns...');

        // Add is_2fa_enabled column
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE;
    `);
        console.log('✅ Added is_2fa_enabled column');

        // Add two_factor_secret column
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
    `);
        console.log('✅ Added two_factor_secret column');

        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
