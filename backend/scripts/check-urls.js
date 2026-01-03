/**
 * Diagnostic Script: Check Photo URLs
 * 
 * This script prints the public_url of photos in the database.
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const { PhotoDB } = require('../lib/sql-db');

async function checkUrls() {
    try {
        console.log('🔍 Fetching photos from database...');
        const result = await PhotoDB.findAll({ limit: 10 });
        const photos = result.photos || result;

        if (photos.length === 0) {
            console.log('ℹ️ No photos found in database.');
            return;
        }

        console.log(`✅ Found ${photos.length} photos.`);
        photos.forEach(p => {
            console.log(`- ID: ${p.id} | Sister: ${p.sister} | URL: ${p.publicUrl || p.public_url}`);
        });

    } catch (error) {
        console.error('❌ Error checking URLs:', error.message);
        if (error.message.includes('ECONNREFUSED')) {
            console.log('💡 Tip: Make sure the database is accessible from your local machine (e.g., via Cloud SQL Proxy).');
        }
    }
}

checkUrls();
