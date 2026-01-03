-- Cleaned up GCP SQL Schema for Wedding Web
-- Removed Supabase-specific roles and RLS

-- Enable UUID extension if not enabled (standard for PG)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table (for backend-managed auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    login_attempts INTEGER DEFAULT 0,
    last_login_attempt TIMESTAMP WITH TIME ZONE,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Audit log table
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

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL, -- Flexible ID (could be Firebase UID)
    full_name TEXT,
    location TEXT,
    bio TEXT,
    avatar_url TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Photos table
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
  storage_provider TEXT DEFAULT 'gcs' CHECK (storage_provider IN ('supabase', 'firebase', 'gcs')),
  photographer_id UUID,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. People table
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('bride', 'groom', 'family', 'friend', 'vendor', 'other')),
  avatar_url TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Face descriptors table
CREATE TABLE IF NOT EXISTS face_descriptors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor REAL[] NOT NULL, -- 128, 512, or 4096-dimensional
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Photo faces table
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

-- 7. Indexes
CREATE INDEX IF NOT EXISTS idx_photos_sister ON photos(sister);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_person ON face_descriptors(person_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo ON photo_faces(photo_id);

-- 8. Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Triggers
CREATE TRIGGER update_photos_updated_at BEFORE UPDATE ON photos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_photo_faces_updated_at BEFORE UPDATE ON photo_faces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Initial User (Photographer)
-- Password is 'admin123' hashed (bcrypt might be needed, but this is for initial SQL)
INSERT INTO users (username, password, role) 
VALUES ('admin', '$2b$10$eSPrLVK3zT/lDPbjRQlfhucIT8c4FtKzMXwafUxiCJaY7SK0MY2TW', 'admin') 
ON CONFLICT DO NOTHING;
