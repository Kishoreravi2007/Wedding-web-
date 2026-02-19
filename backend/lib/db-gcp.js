/**
 * Google Cloud SQL -> Supabase Database Connection
 * 
 * Manages connection pool to Supabase instance (PostgreSQL)
 * Uses standard 'pg' library.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

// Get database credentials from environment variables
const dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase/Cloud SQL
    }
};

// Fallback to individual vars if DATABASE_URL is missing (legacy)
if (!process.env.DATABASE_URL) {
    dbConfig.user = process.env.DB_USER;
    dbConfig.password = process.env.DB_PASSWORD;
    dbConfig.database = process.env.DB_NAME;
    dbConfig.host = process.env.DB_HOST;
    dbConfig.port = process.env.DB_PORT || 5432;
}

// Add pool settings
dbConfig.max = 20;
dbConfig.idleTimeoutMillis = 30000;
dbConfig.connectionTimeoutMillis = 10000;

// Validate configuration
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.warn(`⚠️  Missing Database environment variables!`);
    console.warn('   Database operations will fail until DATABASE_URL or DB_* vars are set.');
}

// Create connection pool
const pool = new Pool(dbConfig);

// Keep track of connection errors
pool.on('error', (err, client) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

/**
 * Execute a SQL query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 */
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        // console.log('executed query', { text, duration, rows: res.rowCount });
        return res;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Get a client from the pool (for transactions)
 */
const getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Monkey patch the query method to keep track of the last query executed
    const timeout = 5000;
    const lastQuery = { text: '', params: [] };

    client.query = (...args) => {
        lastQuery.text = args[0];
        lastQuery.params = args[1];
        return query.apply(client, args);
    };

    client.release = () => {
        // clear the last query
        client.query = query;
        client.release = release;
        return release.apply(client);
    };

    return client;
};

module.exports = {
    query,
    getClient,
    pool
};
