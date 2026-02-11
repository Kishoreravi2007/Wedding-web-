/**
 * Diagnostic script to check weddings table schema in Cloud SQL
 */
const { query } = require('./lib/db-gcp');

async function checkWeddingsSchema() {
    console.log('🔍 Checking weddings table schema in Cloud SQL...\n');
    try {
        const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'weddings'
    `);

        if (res.rows.length === 0) {
            console.log('❌ Table "weddings" not found!');
        } else {
            console.log('✅ Columns found:');
            res.rows.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type})`);
            });

            const userIdCol = res.rows.find(r => r.column_name === 'user_id');
            if (userIdCol) {
                console.log(`\n💡 user_id type: ${userIdCol.data_type}`);
            } else {
                console.log('\n⚠️  Missing column: user_id');
            }
        }

        // Also check for uuid-ossp extension if we're using UUIDs
        const extRes = await query("SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'");
        if (extRes.rows.length > 0) {
            console.log('✅ uuid-ossp extension is enabled.');
        } else {
            console.log('⚠️  uuid-ossp extension is NOT enabled.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkWeddingsSchema();
