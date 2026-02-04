const { query } = require('./lib/db-gcp');

async function check() {
    try {
        console.log('--- Checking weddings table columns ---');
        const cols = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'weddings'");
        console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));

        console.log('--- Checking tables ---');
        const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', JSON.stringify(tables.rows, null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
}

check();
