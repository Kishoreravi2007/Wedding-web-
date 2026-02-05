/**
 * Fix Music URLs Script
 * 
 * This script updates any music_url entries in the weddings table
 * that have the wrong port (5005) to use the correct port (5001).
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const { query } = require('../lib/db-gcp');

async function fixMusicUrls() {
    console.log('🔧 Checking for music URLs with incorrect port...');

    try {
        // Find affected rows
        const checkResult = await query(
            `SELECT user_id, music_url FROM weddings WHERE music_url LIKE '%localhost:5005%'`
        );

        console.log(`Found ${checkResult.rows.length} wedding(s) with incorrect music URLs.`);

        if (checkResult.rows.length === 0) {
            console.log('✅ No URLs need fixing.');
            return;
        }

        // Log affected rows
        checkResult.rows.forEach(row => {
            console.log(`  - User ID: ${row.user_id}`);
            console.log(`    Old URL: ${row.music_url}`);
        });

        // Fix the URLs
        const updateResult = await query(
            `UPDATE weddings 
             SET music_url = REPLACE(music_url, 'localhost:5005', 'localhost:5001')
             WHERE music_url LIKE '%localhost:5005%'
             RETURNING user_id, music_url`
        );

        console.log(`\n✅ Fixed ${updateResult.rowCount} music URL(s).`);
        updateResult.rows.forEach(row => {
            console.log(`  - User ID: ${row.user_id}`);
            console.log(`    New URL: ${row.music_url}`);
        });

    } catch (error) {
        console.error('❌ Error fixing music URLs:', error);
    }

    process.exit(0);
}

fixMusicUrls();
