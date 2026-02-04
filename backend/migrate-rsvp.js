const db = require('./lib/db-gcp');

async function migrate() {
    try {
        console.log('🔄 Starting migration: Adding rsvp_token to guests...');

        // Ensure pgcrypto is available for UUID generation
        await db.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
        console.log('✅ pgcrypto extension is ready');

        // Add rsvp_token column if it doesn't exist
        const checkColumn = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'guests' AND column_name = 'rsvp_token'
        `);

        if (checkColumn.rows.length === 0) {
            await db.query('ALTER TABLE guests ADD COLUMN rsvp_token UUID DEFAULT gen_random_uuid() UNIQUE');
            console.log('✅ Successfully added rsvp_token column');

            // Populate existing rows with tokens (if any)
            await db.query('UPDATE guests SET rsvp_token = gen_random_uuid() WHERE rsvp_token IS NULL');
            console.log('✅ Populated existing rows with tokens');
        } else {
            console.log('ℹ️ Column rsvp_token already exists.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await db.pool.end();
        console.log('👋 Database connection closed');
    }
}

migrate();
