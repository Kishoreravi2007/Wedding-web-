const bcrypt = require('bcryptjs');
const db = require('./lib/db-gcp');

async function run() {
    await new Promise(r => setTimeout(r, 3000));

    try {
        // Hash the actual password
        const hash = await bcrypt.hash('Kishore@2007', 12);
        console.log('Generated hash');

        // Update admin users with correct password
        await db.query(
            `UPDATE users SET password = $1 WHERE username IN ('admin@weddingweb.co.in', 'kr5770203@gmail.com')`,
            [hash]
        );
        console.log('Updated admin passwords');

        // Verify
        const r = await db.query('SELECT username, role, is_active FROM users');
        console.log('Users:', JSON.stringify(r.rows, null, 2));

        // Verify tables
        const tables = await db.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

        process.exit(0);
    } catch (e) {
        console.error('FAIL:', e.message);
        process.exit(1);
    }
}

run();
