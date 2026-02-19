const { query } = require('../lib/db-gcp');

async function fixDataTypes() {
    console.log('🚀 Changing coupons table columns to BIGINT...');

    try {
        // Change usage_limit and usage_count to BIGINT
        await query(`
            ALTER TABLE coupons 
            ALTER COLUMN usage_limit TYPE BIGINT,
            ALTER COLUMN usage_count TYPE BIGINT;
        `);

        console.log('✅ Columns usage_limit and usage_count successfully changed to BIGINT.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

fixDataTypes();
