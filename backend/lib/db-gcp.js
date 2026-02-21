/**
 * Google Cloud SQL -> Supabase Database Connection
 * 
 * Manages connection pool to Supabase instance (PostgreSQL)
 * Uses standard 'pg' library.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

// Get database credentials from environment variables
const buildDbConfig = (useSSL = true) => {
    const config = {
        connectionString: process.env.DATABASE_URL,
    };

    // Only add SSL if requested - Supabase Transaction Pooler (6543) does NOT support SSL
    if (useSSL) {
        config.ssl = { rejectUnauthorized: false };
    } else {
        config.ssl = false;
    }

    // Fallback to individual vars if DATABASE_URL is missing (legacy)
    if (!process.env.DATABASE_URL) {
        config.user = process.env.DB_USER;
        config.password = process.env.DB_PASSWORD;
        config.database = process.env.DB_NAME;
        config.host = process.env.DB_HOST;
        config.port = process.env.DB_PORT || 5432;
    }

    // Pool settings
    config.max = 20;
    config.idleTimeoutMillis = 30000;
    config.connectionTimeoutMillis = 10000;

    return config;
};

// Validate configuration
if (!process.env.DATABASE_URL && !process.env.DB_HOST) {
    console.warn(`⚠️  Missing Database environment variables!`);
    console.warn('   Database operations will fail until DATABASE_URL or DB_* vars are set.');
}

// Create connection pool - try with SSL first
let pool = new Pool(buildDbConfig(true));
let sslFallbackAttempted = false;

// Handle SSL rejection gracefully
const initPool = async () => {
    try {
        // We now check the connection string to decide SSL default
        const isSupabasePooler = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('pooler');

        if (isSupabasePooler) {
            console.log('📡 Supabase Pooler detected, defaulting to non-SSL...');
            pool = new Pool(buildDbConfig(false));
            sslFallbackAttempted = true;
        }

        const client = await pool.connect();
        console.log(`✅ Database connected (${sslFallbackAttempted ? 'non-SSL' : 'SSL'})`);
        client.release();
    } catch (err) {
        if (err.message && err.message.includes('SSL') && !sslFallbackAttempted) {
            console.warn('⚠️  SSL rejected by server, reconnecting without SSL...');
            sslFallbackAttempted = true;
            await pool.end();
            pool = new Pool(buildDbConfig(false));
            try {
                const client = await pool.connect();
                console.log('✅ Database connected (no-SSL fallback)');
                client.release();
            } catch (err2) {
                console.error('❌ Database connection failed even without SSL:', err2.message);
            }
        } else {
            console.error('❌ Database connection failed:', err.message);
        }
    }
};

// Run init - store promise so queries can await it
const initPromise = initPool();

/**
 * Execute a SQL query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 */
const query = async (text, params) => {
    await initPromise; // Wait for SSL negotiation to complete
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
    await initPromise; // Wait for SSL negotiation to complete
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
    get pool() { return pool; }
};
