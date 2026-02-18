const { query } = require('./lib/db-gcp');

async function checkTables() {
    try {
        const { rows } = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables in database:', rows.map(r => r.table_name).join(', '));

        const tablesToCheck = ['users', 'auth_audit_log', 'profiles', 'weddings', 'photos'];
        for (const table of tablesToCheck) {
            const exists = rows.find(r => r.table_name === table);
            if (exists) {
                console.log(`\n✅ Table '${table}' exists.`);
                const { rows: columns } = await query(`
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_name = $1
                    ORDER BY column_name
                `, [table]);
                console.log(`   Columns:`, columns.map(c => `${c.column_name} (${c.data_type})`).join(', '));
            } else {
                console.log(`\n❌ Table '${table}' DOES NOT exist.`);
            }
        }
    } catch (error) {
        console.error('Error checking tables:', error.message);
    }
}

checkTables();
