const { query } = require('./lib/db-gcp');

async function checkSchema() {
    try {
        const { rows } = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'photos'
        `);
        const cols = rows.map(r => r.column_name).join(', ');
        console.log('COLUMNS: ' + cols);
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
