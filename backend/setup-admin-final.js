const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function run() {
    const username = 'kishore';
    const password = 'qwerty123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const client = await pool.connect();
    try {
        console.log(`🔐 Setting up Admin User '${username}'...`);

        // UPSERT using ON CONFLICT
        const res = await client.query(`
      INSERT INTO "users" ("username", "password", "role", "is_active")
      VALUES ($1, $2, 'admin', true)
      ON CONFLICT ("username") 
      DO UPDATE SET 
        "password" = EXCLUDED."password",
        "role" = 'admin',
        "is_active" = true,
        "updated_at" = NOW()
      RETURNING "id";
    `, [username, hashedPassword]);

        console.log(`✅ Success! User ID: ${res.rows[0].id}`);
        console.log('Admin user kishore/qwerty123 is ready.');
    } catch (err) {
        console.error('❌ Error:', err.message);
        if (err.detail) console.error('Detail:', err.detail);
        console.error(err.stack);
    } finally {
        client.release();
        await pool.end();
    }
}

run();
