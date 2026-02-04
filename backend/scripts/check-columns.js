
const { query } = require('../lib/db-gcp');

async function checkColumns() {
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'weddings';
        `);
        console.log('Columns in weddings table:', res.rows);
    } catch (err) {
        console.error('Error checking columns:', err);
    }
}

checkColumns();
