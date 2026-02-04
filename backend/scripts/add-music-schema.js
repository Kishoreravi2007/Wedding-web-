
const { query } = require('../lib/db-gcp');

async function addMusicSchema() {
    console.log('🎵 Starting Music Schema Update...');

    try {
        // Add music_enabled column
        console.log('👉 Adding music_enabled column...');
        await query(`
      ALTER TABLE weddings 
      ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT FALSE;
    `);
        console.log('✅ music_enabled column added.');

        // Add music_url column
        console.log('👉 Adding music_url column...');
        await query(`
      ALTER TABLE weddings 
      ADD COLUMN IF NOT EXISTS music_url TEXT;
    `);
        console.log('✅ music_url column added.');

        console.log('🎉 Music schema update completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
}

addMusicSchema();
