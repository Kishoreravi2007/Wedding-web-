const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') }); // Changed to .env from .env.production if running locally

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function inspect() {
    const client = await pool.connect();
    try {
        const tables = ['wishes'];

        for (const table of tables) {
            console.log(`\n📋 Columns for table: ${table}`);
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);

            if (res.rowCount === 0) {
                console.log('   (Table does not exist)');
            } else {
                res.rows.forEach(row => {
                    console.log(`   - ${row.column_name} (${row.data_type})`);
                });
            }
        }
    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
