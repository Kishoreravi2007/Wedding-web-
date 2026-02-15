/**
 * Master Database Schema & Repair Script
 * 
 * This script ensures ALL required tables, columns, indexes, and triggers exist.
 * It uses 'IF NOT EXISTS' and 'ADD COLUMN IF NOT EXISTS' for maximum safety.
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env.production') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const schemaQueries = [
    // 1. Extensions
    'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"',
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto"',

    // 2. Helper function
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
   RETURNS TRIGGER AS $$
   BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
   END;
   $$ LANGUAGE plpgsql`,

    // 3. Weddings Table
    `CREATE TABLE IF NOT EXISTS weddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wedding_code TEXT UNIQUE NOT NULL,
    bride_name TEXT NOT NULL,
    groom_name TEXT,
    wedding_date DATE,
    wedding_month TEXT,
    venue TEXT,
    venue_address TEXT,
    package_type TEXT DEFAULT 'basic',
    status TEXT DEFAULT 'active',
    theme_color TEXT DEFAULT '#ff6b9d',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS user_id UUID',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 0',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS photographer_username TEXT',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS photographer_password TEXT',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS custom_domain TEXT',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS enable_photo_booth BOOLEAN DEFAULT true',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS enable_face_recognition BOOLEAN DEFAULT true',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS enable_wishes BOOLEAN DEFAULT true',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS enable_live_stream BOOLEAN DEFAULT false',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS max_photos INTEGER DEFAULT 1000',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS storage_used_mb DECIMAL(10,2) DEFAULT 0',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS contact_email TEXT',
    'ALTER TABLE weddings ADD COLUMN IF NOT EXISTS contact_phone TEXT',

    // 4. Users Table
    `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS wedding_id UUID',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS has_premium_access BOOLEAN DEFAULT false',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_attempt TIMESTAMPTZ',
    'ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ',

    // 5. Profiles Table
    `CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS partner_name TEXT',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT',
    'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT',

    // 6. Guests Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 7. Event Timeline Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,

    // 8. Photos Table
    `CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    public_url TEXT NOT NULL,
    size BIGINT NOT NULL,
    mimetype TEXT NOT NULL,
    sister TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE',
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS title TEXT',
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS description TEXT',
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS event_type TEXT',
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT \'{}\'',
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS storage_provider TEXT DEFAULT \'gcs\'',
    'ALTER TABLE photos ADD COLUMN IF NOT EXISTS photographer_id UUID',

    // 9. People Table
    `CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE people ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE',
    'ALTER TABLE people ADD COLUMN IF NOT EXISTS avatar_url TEXT',
    'ALTER TABLE people ADD COLUMN IF NOT EXISTS sister TEXT',

    // 10. Face Descriptors
    `CREATE TABLE IF NOT EXISTS face_descriptors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    descriptor REAL[] NOT NULL,
    photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE face_descriptors ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id) ON DELETE CASCADE',
    'ALTER TABLE face_descriptors ADD COLUMN IF NOT EXISTS confidence REAL',

    // 11. Photo Faces
    `CREATE TABLE IF NOT EXISTS photo_faces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
    bounding_box JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS person_id UUID REFERENCES people(id) ON DELETE SET NULL',
    'ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE',
    'ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS confidence REAL',
    'ALTER TABLE photo_faces ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE',

    // 12. Wishes Table
    `CREATE TABLE IF NOT EXISTS wishes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    wish TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE wishes ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE',
    'ALTER TABLE wishes ADD COLUMN IF NOT EXISTS audio_url TEXT',
    'ALTER TABLE wishes ADD COLUMN IF NOT EXISTS recipient TEXT DEFAULT \'both\'',
    'ALTER TABLE wishes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()',

    // 13. Feedback
    `CREATE TABLE IF NOT EXISTS feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'Anonymous',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS email VARCHAR(255)',
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS rating INTEGER',
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT \'general\'',
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS page_url VARCHAR(500)',
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'new\'',
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS admin_notes TEXT',
    'ALTER TABLE feedback ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',

    // 14. Contact Messages
    `CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS email VARCHAR(255) NOT NULL DEFAULT \'unknown\'',
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone VARCHAR(20)',
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS event_date DATE',
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS guest_count INTEGER',
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT \'new\'',
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS response TEXT',
    'ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()',

    // 15. Premium Tables
    `CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1',
    'ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT \'{}\'',
    'ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'pending\'',
    'ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS payment_gateway VARCHAR(50)',
    'ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS payment_gateway_response JSONB',
    'ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()',

    `CREATE TABLE IF NOT EXISTS premium_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  )`,
    'ALTER TABLE premium_memberships ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT \'{}\'',
    'ALTER TABLE premium_memberships ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1',
    'ALTER TABLE premium_memberships ADD COLUMN IF NOT EXISTS payment_id UUID',
    'ALTER TABLE premium_memberships ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT \'active\'',
    'ALTER TABLE premium_memberships ADD COLUMN IF NOT EXISTS notes TEXT',

    // 16. Reviews
    `CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      rating INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  )`,
    'ALTER TABLE reviews ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id)',
    'ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE',

    // 17. Indexes (Safe creation)
    'CREATE INDEX IF NOT EXISTS idx_photos_sister ON photos(sister)',
    'CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC)',
    'CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)',
    'CREATE INDEX IF NOT EXISTS idx_weddings_code ON weddings(wedding_code)',

    // 18. Triggers (Safe creation)
    `DO $$ 
   BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_weddings_updated_at') THEN
           CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
       END IF;
       IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
           CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
       END IF;
   END $$`
];

async function init() {
    console.log('🚀 Starting Comprehensive Database Initialization & Repair...');
    const client = await pool.connect();
    try {
        console.log('✅ Connected to database.');

        for (const q of schemaQueries) {
            try {
                await client.query(q);
                // console.log(`   OK: ${q.substring(0, 50)}...`);
            } catch (err) {
                console.warn(`   ⚠️ Error executing query: ${q.substring(0, 50)}...`);
                console.warn(`      Reason: ${err.message}`);
            }
        }

        console.log('\n✅ Database initialization/repair completed.');
    } catch (err) {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

init();
