const { query } = require('./lib/db-gcp');

const schemaSql = `
-- Unified Schema for Wedding Web (Supabase/PostgreSQL) - Robust version

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
  package_type TEXT DEFAULT 'basic' CHECK (package_type IN ('basic', 'premium', 'luxury')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed', 'archived')),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure weddings columns exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='status') THEN
        ALTER TABLE weddings ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed', 'archived'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='package_type') THEN
        ALTER TABLE weddings ADD COLUMN package_type TEXT DEFAULT 'basic' CHECK (package_type IN ('basic', 'premium', 'luxury'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='venue_address') THEN
        ALTER TABLE weddings ADD COLUMN venue_address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='theme_color') THEN
        ALTER TABLE weddings ADD COLUMN theme_color TEXT DEFAULT '#ff6b9d';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='weddings' AND column_name='wedding_month') THEN
        ALTER TABLE weddings ADD COLUMN wedding_month TEXT;
    END IF;
END $$;

-- 4. Photos Table (Integrated with Wedding)
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  size BIGINT NOT NULL,
  mimetype TEXT NOT NULL,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b')),
  title TEXT,
  description TEXT,
  event_type TEXT,
  tags TEXT[] DEFAULT '{}',
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'firebase', 'gcs')),
  photographer_id UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure wedding_id exists in photos
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='photos' AND column_name='wedding_id') THEN
        ALTER TABLE photos ADD COLUMN wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. People Table (Integrated with Wedding)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('bride', 'groom', 'family', 'friend', 'vendor', 'other')),
  avatar_url TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure wedding_id exists in people
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='people' AND column_name='wedding_id') THEN
        ALTER TABLE people ADD COLUMN wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 6. Face Descriptors
CREATE TABLE IF NOT EXISTS face_descriptors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor REAL[] NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Photo Faces
CREATE TABLE IF NOT EXISTS photo_faces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE,
  bounding_box JSONB NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wishes Table (Integrated with Wedding)
CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  wish TEXT,
  audio_url TEXT,
  recipient TEXT NOT NULL DEFAULT 'both' CHECK (recipient IN ('sister-a', 'sister-b', 'parvathy', 'sreedevi', 'both')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure wedding_id exists in wishes
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='wishes' AND column_name='wedding_id') THEN
        ALTER TABLE wishes ADD COLUMN wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 9. Feedback, Contact, Call Records, Users, Profiles
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) DEFAULT 'Anonymous',
  email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category VARCHAR(50) DEFAULT 'general' CHECK (category IN ('general', 'feature', 'bug', 'ui', 'performance', 'other')),
  message TEXT NOT NULL,
  page_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved', 'archived')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  event_date DATE,
  guest_count INTEGER,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Re-run get_wedding_stats function
CREATE OR REPLACE FUNCTION get_wedding_stats(p_wedding_id UUID)
RETURNS TABLE(
  total_photos BIGINT,
  total_people BIGINT,
  total_wishes BIGINT,
  storage_used_mb DECIMAL
)
LANGUAGE sql
AS $$
  SELECT 
    COALESCE((SELECT COUNT(*) FROM photos WHERE wedding_id = p_wedding_id), 0)::BIGINT as total_photos,
    COALESCE((SELECT COUNT(*) FROM people WHERE wedding_id = p_wedding_id), 0)::BIGINT as total_people,
    COALESCE((SELECT COUNT(*) FROM wishes WHERE wedding_id = p_wedding_id), 0)::BIGINT as total_wishes,
    COALESCE((SELECT SUM(size) FROM photos WHERE wedding_id = p_wedding_id), 0)::DECIMAL / 1048576.0 as storage_used_mb;
$$;

-- Triggers (Check before creating)
DO $$ 
BEGIN
    -- Weddings update trigger
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_weddings_updated_at') THEN
        CREATE TRIGGER update_weddings_updated_at BEFORE UPDATE ON weddings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Sample Weddings
INSERT INTO weddings (wedding_code, bride_name, groom_name, wedding_date, status)
VALUES ('priya-rahul-2026', 'Priya', 'Rahul', '2026-02-14', 'upcoming')
ON CONFLICT (wedding_code) DO NOTHING;

-- Initial Admin
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$eSPrLVK3zT/lDPbjRQlfhucIT8c4FtKzMXwafUxiCJaY7SK0MY2TW', 'admin') 
ON CONFLICT DO NOTHING;
`;

async function applySchema() {
  console.log('🚀 Applying/Updating unified schema to Supabase...');
  try {
    await query(schemaSql);
    console.log('✅ Schema updated successfully!');
  } catch (error) {
    console.error('❌ Error updating schema:', error);
  } finally {
    process.exit();
  }
}

applySchema();
