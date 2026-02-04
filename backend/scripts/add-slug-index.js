
const { query } = require('../lib/db-gcp');

async function migrate() {
    try {
        console.log('Starting migration: Adding unique index to wedding_code...');

        // Add Unique Index
        // WE use CREATE UNIQUE INDEX IF NOT EXISTS to be safe
        await query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_weddings_wedding_code ON weddings (wedding_code);
        `);

        console.log('✅ Unique index added/verified on wedding_code');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        // If it fails due to duplicates, we might need to know
        if (error.code === '23505') {
            console.error('⚠️ Duplicate values exist! You must resolve duplicates before adding this constraint.');
        }
    }
}

migrate();
