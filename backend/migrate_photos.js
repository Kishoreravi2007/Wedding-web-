const { query } = require('./lib/db-gcp');

async function migrate() {
    try {
        console.log('🚀 Starting migration: Linking photos to weddings...');

        // 1. Link photos based on Photographer association
        const { rowCount: count1 } = await query(`
            UPDATE photos p
            SET wedding_id = u.wedding_id
            FROM users u
            WHERE p.photographer_id = u.id
            AND p.wedding_id IS NULL
            AND u.wedding_id IS NOT NULL
        `);
        console.log(`✅ Linked ${count1} photos via photographer association.`);

        // 2. Link photos based on legacy 'sister' (wedding_code)
        const { rowCount: count2 } = await query(`
            UPDATE photos p
            SET wedding_id = w.id
            FROM weddings w
            WHERE (p.sister = w.wedding_code OR p.sister = w.slug)
            AND p.wedding_id IS NULL
        `);
        console.log(`✅ Linked ${count2} photos via legacy sister/slug association.`);

        // 3. For photos that are still NULL but have sister='none', 
        // they might be orphans or from a specific wedding. 
        // We'll leave them for now unless we can identify them.

        console.log('🏁 Migration completed.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
