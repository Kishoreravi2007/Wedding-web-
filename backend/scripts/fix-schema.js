
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
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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

        console.log('🎉 Schema fix completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Schema fix failed:', error);
        process.exit(1);
    }
}

fixSchema();
