const { query } = require('./lib/db-gcp');
const fs = require('fs');

async function checkUsers() {
    try {
        const { rows: users } = await query('SELECT id, username, role, wedding_id FROM users');
        const { rows: weddings } = await query('SELECT id, user_id, wedding_code, slug FROM weddings');

        const result = {
            users,
            weddings
        };

        fs.writeFileSync('linkage-result.json', JSON.stringify(result, null, 2));
        console.log('✅ Diagnostic results written to linkage-result.json');
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkUsers();
