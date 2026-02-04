
const { query } = require('../lib/db-gcp');

async function fixSchema() {
  console.log('🔧 Starting Schema Fix...');

  try {
    // 1. Add email_offers_opt_in column to users
    console.log('👉 Adding email_offers_opt_in column to users...');
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS email_offers_opt_in BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Users table updated.');

    // 2. Create weddings table
    console.log('👉 Creating weddings table...');
    await query(`
      CREATE TABLE IF NOT EXISTS weddings (
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
        wedding_code TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Weddings table created/verified.');

    // 3. Add Music & Slug columns if they don't exist
    console.log('👉 Adding music and slug columns...');
    await query(`
            ALTER TABLE weddings 
            ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS music_url TEXT,
            ADD COLUMN IF NOT EXISTS music_source TEXT DEFAULT 'upload',
            ADD COLUMN IF NOT EXISTS playlist_url TEXT,
            ADD COLUMN IF NOT EXISTS volume INTEGER DEFAULT 50,
            ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
            ADD COLUMN IF NOT EXISTS wedding_code TEXT UNIQUE;
        `);
    console.log('✅ Weddings table schema updated with music & slug columns.');

    console.log('🎉 Schema fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Schema fix failed:', error);
    process.exit(1);
  }
}

fixSchema();
