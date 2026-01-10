const { Client } = require('pg');

const runTest = async (connectionString) => {
  console.log(`Testing: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("✅ Custom Connection: SUCCESS");
    const res = await client.query('SELECT current_user, current_database()');
    console.log("   User:", res.rows[0].current_user);
    console.log("   DB:", res.rows[0].current_database);
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ Custom Connection: FAILED");
    console.error("   Error:", err.message);
    if (client) try { await client.end(); } catch (e) {}
    return false;
  }
};

const url1 = "postgresql://postgres.dmsghmogmwmpxjaipbod:Kishore%402007@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
// Try without encoded @ (pg might parse incorrectly but worth a shot if 1 fails)
const url2 = "postgresql://postgres.dmsghmogmwmpxjaipbod:Kishore@2007@aws-0-ap-south-1.pooler.supabase.com:6543/postgres";
// Try direct connection
const url3 = "postgresql://postgres:Kishore%402007@db.dmsghmogmwmpxjaipbod.supabase.co:5432/postgres";

(async () => {
    let success = await runTest(url1);
    if (!success) success = await runTest(url2);
    if (!success) success = await runTest(url3);
})();
