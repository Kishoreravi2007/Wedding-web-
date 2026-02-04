const { query } = require('./lib/db-gcp');

async function checkSchema() {
    try {
        const res = await query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'profiles';
        `);
        console.log('Profiles Table Schema:', res.rows);
    } catch (err) {
        console.error(err);
    }
}

checkSchema();
