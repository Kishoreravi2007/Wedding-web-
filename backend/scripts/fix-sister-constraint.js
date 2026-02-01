require('dotenv').config({ path: '../.env' });
const { query } = require('../lib/db-gcp');

async function fixConstraints() {
    console.log('🔧 Removing legacy "sister" check constraints...');

    try {
        await query('BEGIN');

        // Drop constraint on photos table (sister)
        await query('ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_sister_check');
        console.log('✅ Dropped photos_sister_check');

        // Drop constraint on photos table (storage_provider)
        await query('ALTER TABLE photos DROP CONSTRAINT IF EXISTS photos_storage_provider_check');
        console.log('✅ Dropped photos_storage_provider_check');

        // Drop constraint on people table (just in case)
        await query('ALTER TABLE people DROP CONSTRAINT IF EXISTS people_sister_check');
        console.log('✅ Dropped people_sister_check');

        await query('COMMIT');
        console.log('🎉 Successfully removed constraints. Dynamic wedding slugs are now supported.');
    } catch (error) {
        await query('ROLLBACK');
        console.error('❌ Error removing constraints:', error);
    } finally {
        process.exit();
    }
}

fixConstraints();
