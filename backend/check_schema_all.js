const { query } = require('./lib/db-gcp');

async function checkSchema() {
    try {
        const photos = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'photos'");
        const weddings = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'weddings'");

        console.log('PHOTOS COLUMNS:');
        console.log(photos.rows.map(r => r.column_name).join(', '));

        console.log('\nWEDDINGS COLUMNS:');
        console.log(weddings.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkSchema();
