/**
 * Migration Script: Fix weddings.user_id type from INTEGER to UUID
 */
const { query } = require('../lib/db-gcp');

async function migrateWeddingsUserIdType() {
    console.log('🔧 Starting user_id type migration...');

    try {
        // Check if the column type is already UUID
        const checkResult = await query(`
      SELECT data_type FROM information_schema.columns 
      WHERE table_name = 'weddings' AND column_name = 'user_id'
    `);

        if (checkResult.rows.length > 0 && checkResult.rows[0].data_type === 'uuid') {
            console.log('✅ user_id is already UUID type. No migration needed.');
            process.exit(0);
        }

        console.log('👉 Current user_id type:', checkResult.rows[0]?.data_type || 'unknown');
        console.log('👉 Altering user_id column type to UUID...');

        // PostgreSQL allows this if the data can be cast
        await query(`
      ALTER TABLE weddings 
      ALTER COLUMN user_id TYPE UUID USING user_id::text::uuid
    `);

        console.log('✅ user_id type migrated to UUID successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);

        // If ALTER fails, try dropping and recreating the table
        console.log('👉 Attempting to recreate the weddings table...');

        try {
            // Backup existing data
            const backupResult = await query('SELECT * FROM weddings');
            console.log(`   Found ${backupResult.rows.length} wedding records`);

            // Drop the table
            await query('DROP TABLE IF EXISTS weddings CASCADE');
            console.log('   Dropped old weddings table');

            // Recreate with correct types
            await query(`
        CREATE TABLE weddings (
          id SERIAL PRIMARY KEY,
          user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          groom_name TEXT,
          bride_name TEXT,
          wedding_date DATE,
          venue TEXT,
          guest_count INTEGER DEFAULT 0,
          theme TEXT DEFAULT 'Modern Elegance',
          wedding_time TEXT,
          show_countdown BOOLEAN DEFAULT TRUE,
          music_enabled BOOLEAN DEFAULT FALSE,
          music_url TEXT,
          music_source TEXT DEFAULT 'upload',
          playlist_url TEXT,
          volume INTEGER DEFAULT 50,
          slug TEXT UNIQUE,
          wedding_code TEXT UNIQUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
            console.log('   Created new weddings table with UUID user_id');

            // Re-insert data if any
            if (backupResult.rows.length > 0) {
                console.log('   Restoring wedding data...');
                for (const row of backupResult.rows) {
                    await query(`
            INSERT INTO weddings (user_id, groom_name, bride_name, wedding_date, venue, guest_count, theme, wedding_time, show_countdown, music_enabled, music_url, music_source, playlist_url, volume, slug, wedding_code, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `, [
                        row.user_id,
                        row.groom_name,
                        row.bride_name,
                        row.wedding_date,
                        row.venue,
                        row.guest_count,
                        row.theme,
                        row.wedding_time,
                        row.show_countdown,
                        row.music_enabled,
                        row.music_url,
                        row.music_source,
                        row.playlist_url,
                        row.volume,
                        row.slug,
                        row.wedding_code,
                        row.created_at,
                        row.updated_at
                    ]);
                }
                console.log(`   Restored ${backupResult.rows.length} wedding records`);
            }

            console.log('✅ Weddings table recreated successfully!');
            process.exit(0);
        } catch (recreateError) {
            console.error('❌ Recreate also failed:', recreateError.message);
            process.exit(1);
        }
    }
}

migrateWeddingsUserIdType();
