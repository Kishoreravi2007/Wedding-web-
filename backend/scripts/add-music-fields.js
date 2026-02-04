
const { query } = require('../lib/db-gcp');

async function migrate() {
    try {
        console.log('Starting migration: Adding specific music columns...');

        // Check and add music_source
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='music_source') THEN 
                    ALTER TABLE weddings ADD COLUMN music_source TEXT DEFAULT 'upload'; 
                    RAISE NOTICE 'Added music_source column';
                END IF;
            END $$;
        `);

        // Check and add playlist_url
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='playlist_url') THEN 
                    ALTER TABLE weddings ADD COLUMN playlist_url TEXT; 
                    RAISE NOTICE 'Added playlist_url column';
                END IF;
            END $$;
        `);

        // Check and add volume
        await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='volume') THEN 
                    ALTER TABLE weddings ADD COLUMN volume INTEGER DEFAULT 50; 
                    RAISE NOTICE 'Added volume column';
                END IF;
            END $$;
        `);

        console.log('✅ Migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
