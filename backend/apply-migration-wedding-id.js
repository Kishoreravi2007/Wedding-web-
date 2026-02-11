/**
 * Migration script to add wedding_id column to users table in Cloud SQL
 */
const { query } = require('./lib/db-gcp');

async function applyMigration() {
    console.log('🚀 Applying migration: adding "wedding_id" column to "users" table...\n');
    try {
        // Add wedding_id column if it doesn't exist
        // Using UUID type to match weddings.id
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS wedding_id UUID;
    `);

        console.log('✅ Column "wedding_id" added successfully (or already exists).');

        // Also ensure has_premium_access and other critical columns exist for security checks
        // as suggested by diagnostic earlier
        await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS has_premium_access BOOLEAN DEFAULT false;
    `);
        console.log('✅ Column "has_premium_access" ensured.');

    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        console.error(err);
    } finally {
        process.exit(0);
    }
}

applyMigration();
