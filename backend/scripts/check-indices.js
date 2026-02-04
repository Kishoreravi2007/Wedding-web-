
const { query } = require('../lib/db-gcp');

async function checkIndices() {
    try {
        const res = await query(`
            SELECT indexname, indexdef 
            FROM pg_indexes 
            WHERE tablename = 'weddings';
        `);
        console.log('Indices on weddings table:', res.rows);
    } catch (err) {
        console.error('Error checking indices:', err);
    }
}
checkIndices();
