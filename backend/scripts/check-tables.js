const { query } = require('../lib/db-gcp');

async function checkTables() {
    try {
        const { rows } = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
        console.log('Tables in database:');
        rows.forEach(row => console.log(`- ${row.table_name}`));
    } catch (error) {
        console.error('Error checking tables:', error);
    } finally {
        process.exit();
    }
}

checkTables();
