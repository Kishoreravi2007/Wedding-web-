const { query } = require('./lib/db-gcp');
const fs = require('fs').promises;
const path = require('path');

async function applyMigration() {
    const migrationPath = path.join(__dirname, 'migrations/fix_analytics_tables.sql');
    try {
        const sql = await fs.readFile(migrationPath, 'utf8');
        console.log('Applying analytics fix migration...');
        await query(sql);
        console.log('✅ Analytics tables created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to apply migration:', error);
        process.exit(1);
    }
}

applyMigration();
