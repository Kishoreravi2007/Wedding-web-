const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND table_schema = 'public'");
        const cols = res.rows.map(r => r.column_name).sort().join(', ');
        fs.writeFileSync('users_cols_public.txt', cols);
    } finally {
        client.release();
        await pool.end();
    }
}
run();
