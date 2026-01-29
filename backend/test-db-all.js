const { Pool } = require('pg');

async function testConnection(host, port, user, pass, db) {
    const connectionString = `postgresql://${user}:${pass}@${host}:${port}/${db}`;
    const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });

    console.log(`\n🔍 Testing: ${host}:${port}`);
    try {
        const client = await pool.connect();
        console.log(`✅ SUCCESS: ${host}:${port}`);
        const res = await client.query('SELECT current_database(), current_user');
        console.log('📊 Result:', res.rows[0]);
        client.release();
        return true;
    } catch (err) {
        console.error(`❌ FAILED: ${host}:${port} - ${err.message}`);
        return false;
    } finally {
        await pool.end();
    }
}

async function run() {
    const projectRef = "ihjrcrcxzmvwrqcmfgam";
    const pass = "Kishore@2007";
    const user = `postgres.${projectRef}`;
    const db = "postgres";

    const hosts = [
        "aws-0-ap-south-1.pooler.supabase.com",
        "aws-1-ap-south-1.pooler.supabase.com"
    ];
    const ports = [6543, 5432];

    for (const host of hosts) {
        for (const port of ports) {
            await testConnection(host, port, user, pass, db);
        }
    }
}

run();
