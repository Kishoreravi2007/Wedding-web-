const db = require('./lib/db-gcp');

async function check() {
    await new Promise(r => setTimeout(r, 3000));
    try {
        const r = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
        console.log('Tables:', r.rows.map(r => r.table_name).join(', '));

        const u = await db.query('SELECT username, role, is_active FROM users');
        console.log('Users:', JSON.stringify(u.rows));

        process.exit(0);
    } catch (e) {
        console.error('FAIL:', e.message);
        process.exit(1);
    }
}
check();
