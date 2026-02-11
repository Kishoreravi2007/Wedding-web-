const { query } = require('./lib/db-gcp');

async function checkUsers() {
    try {
        const { rows: users } = await query('SELECT id, username, role, wedding_id FROM users');
        console.log('--- ALL USERS ---');
        console.table(users);

        const { rows: weddings } = await query('SELECT id, user_id, wedding_code, slug FROM weddings');
        console.log('\n--- ALL WEDDINGS ---');
        console.table(weddings);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkUsers();
