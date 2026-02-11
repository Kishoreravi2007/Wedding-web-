const { query } = require('./lib/db-gcp');

async function checkSchema() {
    try {
        const { rows } = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'photos'
        `);
        console.log('Photos table columns:');
        rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`);
        });
    } catch (err) {
        console.error('Error checking schema:', err.message);
    } finally {
        process.exit(0);
    }
}

checkSchema();
