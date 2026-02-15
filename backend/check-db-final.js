const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function check() {
    const client = await pool.connect();
    try {
        const userCount = await client.query('SELECT COUNT(*) FROM users');
        const searchPath = await client.query('SHOW search_path');
        const dbName = await client.query('SELECT current_database()');

        console.log(`📊 DB Name: ${dbName.rows[0].current_database}`);
        console.log(`📊 Search Path: ${searchPath.rows[0].search_path}`);
        console.log(`👥 Users Count: ${userCount.rows[0].count}`);

        const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('📦 Public Tables:', tables.rows.map(r => r.table_name).join(', '));

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

check();
