const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Master Database Initialization & Repair...');

    // Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    const queries = [
      // 1. Users
      `CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT TRUE,
        login_attempts INTEGER DEFAULT 0,
        last_login_attempt TIMESTAMP WITH TIME ZONE,
        locked_until TIMESTAMP WITH TIME ZONE,
        email_offers_opt_in BOOLEAN DEFAULT FALSE,
        has_premium_access BOOLEAN DEFAULT FALSE,
        wedding_id UUID,
        is_2fa_enabled BOOLEAN DEFAULT FALSE,
        two_factor_secret TEXT,
        password_reset_token TEXT,
        password_reset_expires TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS has_premium_access BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS wedding_id UUID',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT',

      // 2. Weddings
      `CREATE TABLE IF NOT EXISTS weddings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        groom_name TEXT,
        bride_name TEXT,
        wedding_date DATE,
        venue TEXT,
        guest_count INTEGER DEFAULT 0,
        theme TEXT,
        wedding_time TIME,
        show_countdown BOOLEAN DEFAULT TRUE,
        music_enabled BOOLEAN DEFAULT FALSE,
        music_url TEXT,
        music_source TEXT,
        playlist_url TEXT,
        volume INTEGER DEFAULT 50,
        wedding_code TEXT UNIQUE,
        customizations JSONB DEFAULT '{}',
        photographer_username TEXT,
        photographer_password TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,
      'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',
      'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wedding_code TEXT UNIQUE',

      // 3. Profiles
      `CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        full_name TEXT,
        partner_name TEXT,
        email TEXT,
        location TEXT,
        bio TEXT,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 4. Reviews
      `CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        text TEXT NOT NULL,
        is_approved BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,

      // 5. Audit Log
      `CREATE TABLE IF NOT EXISTS auth_audit_log (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        details JSONB DEFAULT '{}',
        ip_address TEXT,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 6. Premium Memberships
      `CREATE TABLE IF NOT EXISTS premium_memberships (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        plan_id TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        features JSONB DEFAULT '[]',
        expiry_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 7. Guests (RSVP)
      `CREATE TABLE IF NOT EXISTS guests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        group_name TEXT,
        rsvp_status TEXT DEFAULT 'pending',
        dietary_requirements TEXT,
        plus_one BOOLEAN DEFAULT FALSE,
        rsvp_token TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 8. Event Timeline
      `CREATE TABLE IF NOT EXISTS event_timeline (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        event_date DATE,
        event_time TIME,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT,
        location_map_url TEXT,
        photo_url TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // 9. Notifications
      `CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        category TEXT DEFAULT 'personal',
        link TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`
    ];

    for (const q of queries) {
      try {
        await client.query(q);
        console.log(`✅ Success: ${q.trim().substring(0, 50)}...`);
      } catch (e) {
        console.warn(`⚠️  Warning: ${e.message} during query: ${q.trim().substring(0, 50)}...`);
      }
    }

    console.log('✅ Database initialization/repair completed.');

  } catch (err) {
    console.error('❌ Fatal error during initialization:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
