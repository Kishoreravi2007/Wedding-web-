const { query } = require('./backend/lib/db-gcp');

async function checkSchema() {
    try {
        console.log('🔍 Checking profiles table columns...');
        const { rows } = await query(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles'"
        );

        if (rows.length === 0) {
            console.log('❌ Table "profiles" not found!');
        } else {
            console.log('✅ Columns found:', JSON.stringify(rows, null, 2));
        }
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkSchema();
