const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function list() {
    const client = await pool.connect();
    try {
        console.log('📋 Listing all tables in all schemas:');
        const res = await client.query(`
      SELECT table_schema, table_name 
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog')
      ORDER BY table_schema, table_name;
    `);

        res.rows.forEach(row => {
            console.log(`- ${row.table_schema}.${row.table_name}`);
        });
    } catch (err) {
        console.error('List failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

list();
