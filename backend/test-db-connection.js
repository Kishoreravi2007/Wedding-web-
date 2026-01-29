const { Client } = require('pg');

const runTest = async (params) => {
  const desc = `${params.user}@${params.host}:${params.port}`;
  console.log(`Testing: ${desc}`);
  const client = new Client({
    ...params,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000
  });
  try {
    await client.connect();
    console.log("✅ Connection: SUCCESS");
    const res = await client.query('SELECT current_user, current_database()');
    console.log("   User:", res.rows[0].current_user);
    console.log("   DB:", res.rows[0].current_database);
    await client.end();
    return true;
  } catch (err) {
    console.error("❌ Connection: FAILED");
    console.error("   Error:", err.message);
    if (client) try { await client.end(); } catch (e) { }
    return false;
  }
};

(async () => {
  const projectRef = "ihjrcrcxzmvwrqcmfgam";
  const pass = "Kishore@2007";
  const poolerHost = "aws-1-ap-south-1.pooler.supabase.com";
  const directHost = "db.ihjrcrcxzmvwrqcmfgam.supabase.co";

  console.log(`Starting DNS diagnostics for project: ${projectRef}`);

  // Variant 1: Pooler Transaction (Port 6543)
  await runTest({
    host: poolerHost,
    port: 6543,
    user: `postgres.${projectRef}`,
    password: pass,
    database: "postgres"
  });

  // Variant 2: Pooler Session (Port 5432)
  await runTest({
    host: poolerHost,
    port: 5432,
    user: `postgres.${projectRef}`,
    password: pass,
    database: "postgres"
  });

  // Variant 3: Direct DB (Port 5432)
  await runTest({
    host: directHost,
    port: 5432,
    user: "postgres",
    password: pass,
    database: "postgres"
  });

  console.log("Diagnostics complete.");
})();
