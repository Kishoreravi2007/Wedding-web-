/**
 * Google Cloud SQL Database Connection
 * 
 * Manages connection pool to Cloud SQL instance (PostgreSQL)
 * Uses standard 'pg' library.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

// Get database credentials from environment variables
const dbConfig = process.env.DATABASE_URL
    ? { connectionString: process.env.DATABASE_URL }
    : {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
    };

// Add pool settings
dbConfig.max = 20;
dbConfig.idleTimeoutMillis = 30000;
dbConfig.connectionTimeoutMillis = 10000;

// Validate configuration
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
const missingVars = process.env.DATABASE_URL
    ? []
    : requiredEnvVars.filter(key => !process.env[key]);

if (missingVars.length > 0) {
    console.warn(`⚠️  Missing Cloud SQL environment variables: ${missingVars.join(', ')}`);
    console.warn('   Database operations will fail until these are set.');
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
