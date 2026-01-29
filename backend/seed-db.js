const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const schemaPath = path.join(__dirname, 'gcp_schema.sql');
const schemaSql = fs.readFileSync(schemaPath, 'utf8');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function main() {
    console.log('Connecting to database...');
    try {
        await client.connect();
        console.log('Connected successfully.');

        console.log('Running schema...');
        await client.query(schemaSql);
        console.log('Schema applied successfully!');

    } catch (err) {
        console.error('Error applying schema:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

main();
