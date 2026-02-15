const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function inspect() {
    const client = await pool.connect();
    try {
        console.log('🔍 Checking for table: weddings');
        const res = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'weddings'
      );
    `);

        if (res.rows[0].exists) {
            console.log('✅ table "weddings" EXISTS.');
            const cols = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'weddings'
      `);
            console.log('Columns:', cols.rows.map(r => r.column_name).join(', '));
        } else {
            console.log('❌ table "weddings" DOES NOT EXIST.');
        }
    } catch (err) {
        console.error('Inspection failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

inspect();
