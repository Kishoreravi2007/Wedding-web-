const { query } = require('./lib/db-gcp');
const fs = require('fs');

async function dumpDB() {
    try {
        const photos = await query("SELECT * FROM photos");
        const weddings = await query("SELECT * FROM weddings");

        const data = {
            photos: photos.rows,
            weddings: weddings.rows
        };

        fs.writeFileSync('db_dump.txt', JSON.stringify(data, null, 2));
        console.log('✅ Dumped to db_dump.txt');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

dumpDB();
