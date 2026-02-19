const { query } = require('./lib/db-gcp');
const fs = require('fs').promises;
const path = require('path');

async function applyMigration() {
    const migrationPath = path.join(__dirname, 'migrations/add_photo_privacy.sql');
    try {
        const sql = await fs.readFile(migrationPath, 'utf8');
        console.log('Applying migration...');
        await query(sql);
        console.log('✅ Migration applied successfully.');
    } catch (error) {
        console.error('❌ Failed to apply migration:', error);
        process.exit(1);
    }
}

applyMigration();
