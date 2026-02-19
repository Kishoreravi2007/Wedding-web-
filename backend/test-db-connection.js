const { Pool } = require('pg');

// Trying Session Mode on the same host
const sessionConnectionString = 'postgresql://postgres.ihjrcrcxzmvwrqcmfgam:Kishore%402007@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const pool = new Pool({
  connectionString: sessionConnectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function test() {
  console.log('Testing connection to:', sessionConnectionString);
  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    const res = await client.query('SELECT NOW()');
    console.log('Time:', res.rows[0].now);
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    if (err.message.includes('SSL')) {
      console.log('-> This confirms the SSL negotiation failed.');
    }
    process.exit(1);
  }
}

test();
