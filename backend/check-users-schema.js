const { query } = require('./lib/db-gcp');

(async () => {
    try {
        console.log('Checking users table schema...');
        const { rows } = await query(
            `SELECT column_name, data_type 
             FROM information_schema.columns 
             WHERE table_name = 'users';`
        );
        console.log(JSON.stringify(rows.map(r => r.column_name), null, 2));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
})();
