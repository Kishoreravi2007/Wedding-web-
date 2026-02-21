const { query } = require('./backend/lib/db-gcp.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend/.env') });

async function checkTables() {
    console.log('🔍 Checking database tables...');
    try {
        const tables = ['users', 'profiles', 'weddings', 'photos', 'contact_messages'];
        for (const table of tables) {
            try {
                const { rows } = await query(`
                    SELECT column_name, data_type, is_nullable 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                    ORDER BY ordinal_position;
                `, [table]);

                if (rows.length > 0) {
                    console.log(`✅ Table '${table}' exists. Columns:`);
                    rows.forEach(col => console.log(`   - ${col.column_name}: ${col.data_type} (Nullable: ${col.is_nullable})`));
                } else {
                    console.error(`❌ Table '${table}' DOES NOT EXIST or is empty.`);
                }
            } catch (err) {
                console.error(`❌ Error checking table '${table}':`, err.message);
            }
        }
    } catch (error) {
        console.error('💥 overall failure:', error);
    } finally {
        process.exit(0);
    }
}

checkTables();
