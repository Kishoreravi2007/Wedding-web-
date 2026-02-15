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
        console.log('🔍 Checking users table columns...');
        const res = await client.query('SELECT * FROM users LIMIT 0');
        const columns = res.fields.map(f => f.name);
        console.log('Columns found:', columns.join(', '));
    } catch (err) {
        console.error('❌ Error checking columns:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

check();
