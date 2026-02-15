const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
    const client = await pool.connect();
    let log = '';
    try {
        await client.query('INSERT INTO "users" ("username", "password", "role", "is_active") VALUES ($1, $2, $3, $4)', ['test', 'test', 'admin', true]);
        log = 'SUCCESS! No error?';
    } catch (err) {
        log = JSON.stringify({
            message: err.message,
            code: err.code,
            column: err.column,
            detail: err.detail,
            table: err.table,
            schema: err.schema
        }, null, 2);
    } finally {
        fs.writeFileSync('diag_final.txt', log);
        client.release();
        await pool.end();
    }
}
run();
