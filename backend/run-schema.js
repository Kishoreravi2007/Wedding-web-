/**
 * Run production schema against Supabase using the working db-gcp connection
 */
const db = require('./lib/db-gcp');

const schema = `
-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Helper for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Weddings Table
CREATE TABLE IF NOT EXISTS weddings (
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
  custom_domain TEXT,
  enable_photo_booth BOOLEAN DEFAULT true,
  enable_face_recognition BOOLEAN DEFAULT true,
  enable_wishes BOOLEAN DEFAULT true,
  enable_live_stream BOOLEAN DEFAULT false,
  max_photos INTEGER DEFAULT 1000,
  storage_used_mb DECIMAL(10,2) DEFAULT 0,
  contact_email TEXT,
  contact_phone TEXT,
  photographer_username TEXT,
  photographer_password TEXT,
  user_id UUID,
  slug TEXT,
  theme TEXT DEFAULT 'classic',
  music_url TEXT,
  music_source TEXT DEFAULT 'none',
  playlist_url TEXT,
  volume REAL DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INTEGER DEFAULT 0,
    last_login_attempt TIMESTAMP WITH TIME ZONE,
    locked_until TIMESTAMP WITH TIME ZONE,
    wedding_id UUID REFERENCES weddings(id) ON DELETE SET NULL,
    email_offers_opt_in BOOLEAN DEFAULT false,
    has_premium_access BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    is_2fa_enabled BOOLEAN DEFAULT false,
    profile JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Auth Audit Log
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT,
    partner_name TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Photos Table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  size BIGINT NOT NULL,
  mimetype TEXT NOT NULL,
  sister TEXT NOT NULL,
  title TEXT,
  description TEXT,
  event_type TEXT,
  tags TEXT[] DEFAULT '{}',
  storage_provider TEXT DEFAULT 'supabase',
  photographer_id UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. People Table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar_url TEXT,
  sister TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Face Descriptors
CREATE TABLE IF NOT EXISTS face_descriptors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor REAL[] NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  confidence REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Photo Faces
CREATE TABLE IF NOT EXISTS photo_faces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE,
  bounding_box JSONB NOT NULL,
  confidence REAL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Wishes Table
CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  wish TEXT,
  audio_url TEXT,
  recipient TEXT NOT NULL DEFAULT 'both',
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Anonymous',
  email VARCHAR(255),
  rating INTEGER NOT NULL,
  category VARCHAR(50) DEFAULT 'general',
  message TEXT NOT NULL,
  page_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Contact Messages
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  event_date DATE,
  guest_count INTEGER,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Call Records
CREATE TABLE IF NOT EXISTS call_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    package_type TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    rating INTEGER NOT NULL,
    text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Guests
CREATE TABLE IF NOT EXISTS guests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    side TEXT DEFAULT 'both',
    rsvp_status TEXT DEFAULT 'pending',
    dietary_restrictions TEXT,
    plus_one BOOLEAN DEFAULT false,
    table_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. Event Timeline
CREATE TABLE IF NOT EXISTS event_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ,
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_weddings_updated_at') THEN
        CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_photos_updated_at') THEN
        CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
        CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_sister ON photos(sister);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_person ON face_descriptors(person_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo ON photo_faces(photo_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_weddings_code ON weddings(wedding_code);
CREATE INDEX IF NOT EXISTS idx_weddings_user ON weddings(user_id);
`;

// Admin user creation (bcrypt hash of Kishore@2007)
const adminSQL = `
INSERT INTO users (username, password, role, is_active)
VALUES (
  'admin@weddingweb.co.in',
  '$2b$12$ZtmqYrkLYWi/pGvygWbgO.DSUhkNbtM8GRtahXDggc9d8YzMG8.B2',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password, role, is_active)
VALUES (
  'kr5770203@gmail.com',
  '$2b$12$ZtmqYrkLYWi/pGvygWbgO.DSUhkNbtM8GRtahXDggc9d8YzMG8.B2',
  'admin',
  true
)
ON CONFLICT (username) DO NOTHING;
`;

async function run() {
    console.log('🚀 Starting...');
    // Wait for the SSL negotiation to complete
    await new Promise(r => setTimeout(r, 3000));

    try {
        console.log('📋 Creating tables...');
        await db.query(schema);
        console.log('✅ All tables created!');

        console.log('👤 Creating admin users...');
        await db.query(adminSQL);
        console.log('✅ Admin users created!');

        // Verify
        const tables = await db.query(`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        console.log('📊 Tables in database:', tables.rows.map(r => r.table_name).join(', '));

        const users = await db.query('SELECT id, username, role FROM users');
        console.log('👥 Users:', JSON.stringify(users.rows));

        process.exit(0);
    } catch (e) {
        console.error('❌ FAIL:', e.message);
        process.exit(1);
    }
}

run();
