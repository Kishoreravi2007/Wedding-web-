const { query } = require('./lib/db-gcp');
require('dotenv').config({ path: './backend/.env' });

async function checkWeddingsSchema() {
    try {
        const res = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'weddings';
    `);
        console.log('Weddings table columns:');
        res.rows.forEach(row => console.log(`- ${row.column_name}`));
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkWeddingsSchema();
