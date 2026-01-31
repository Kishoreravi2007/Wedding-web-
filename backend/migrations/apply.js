const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { query } = require('../lib/db-gcp');

async function applyMigration() {
    try {
        const migrationPath = path.join(__dirname, 'migration_clock_maps.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('🚀 Applying migration...');

        // Split by semicolon if there are multiple statements (simple approach)
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');

        for (const statement of statements) {
            await query(statement);
            console.log(`✅ Executed: ${statement.trim().substring(0, 50)}...`);
        }

        console.log('🎉 Migration applied successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

applyMigration();
