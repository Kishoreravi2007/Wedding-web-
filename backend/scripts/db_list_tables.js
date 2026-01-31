require('dotenv').config();
const { query } = require('../lib/db-gcp');

async function checkTables() {
    try {
        const { rows } = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('--- DATABASE TABLES ---');
        rows.forEach(row => console.log(`- ${row.table_name}`));
        console.log('-----------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error checking tables:', error);
        process.exit(1);
    }
}

checkTables();
