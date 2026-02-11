/**
 * Diagnostic script to check users table schema in Cloud SQL
 */
const { query } = require('./lib/db-gcp');

async function checkSchema() {
    console.log('🔍 Checking users table schema in Cloud SQL...\n');
    try {
        const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);

        if (res.rows.length === 0) {
            console.log('❌ Table "users" not found!');
        } else {
            console.log('✅ Columns found:');
            res.rows.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type})`);
            });

            const required = ['id', 'username', 'role', 'is_active', 'email_offers_opt_in', 'has_premium_access', 'wedding_id'];
            const missing = required.filter(col => !res.rows.some(r => r.column_name === col));

            if (missing.length > 0) {
                console.log('\n⚠️  Missing columns:', missing.join(', '));
            } else {
                console.log('\n✅ All required columns present.');
            }
        }
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
