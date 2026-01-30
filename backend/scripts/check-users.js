const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUsers() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const { rows } = await client.query('SELECT id, username, is_active, role FROM users');
        console.log('JSON_START');
        console.log(JSON.stringify(rows, null, 2));
        console.log('JSON_END');
    } catch (error) {
        console.error('❌ Error checking users:', error.message);
    } finally {
        await client.end();
    }
}

checkUsers();
