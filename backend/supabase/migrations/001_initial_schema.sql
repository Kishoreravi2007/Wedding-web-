-- Migration: Initial schema for wedding photo management with face recognition
-- Created: 2025-10-14

-- =============================================================================
-- 1. CREATE TABLES
-- =============================================================================

-- Photos table: Stores photo metadata
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  size BIGINT NOT NULL,
  mimetype TEXT NOT NULL,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b')),
  title TEXT,
  description TEXT,
  event_type TEXT,
  tags TEXT[] DEFAULT '{}', -- Array of tags
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'firebase')),
  photographer_id UUID, -- References auth.users(id) - handled by Supabase Auth
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE photos IS 'Stores metadata for uploaded wedding photos';
COMMENT ON COLUMN photos.sister IS 'Identifies which sister''s wedding this photo belongs to';
COMMENT ON COLUMN photos.event_type IS 'Type of wedding event (ceremony, reception, etc.)';
COMMENT ON COLUMN photos.tags IS 'Array of tags for categorization and search';

-- People table: Stores information about people who can be recognized in photos
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('bride', 'groom', 'family', 'friend', 'vendor', 'other')),
  avatar_url TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE people IS 'Stores information about people recognized in photos';
COMMENT ON COLUMN people.role IS 'Role of the person in the wedding (bride, groom, family, etc.)';
COMMENT ON COLUMN people.sister IS 'Which wedding(s) this person is associated with';

-- Face descriptors table: Stores face recognition data
CREATE TABLE IF NOT EXISTS face_descriptors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor REAL[] NOT NULL, -- 128-dimensional face descriptor
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE, -- Source photo
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE face_descriptors IS 'Stores 128-dimensional face descriptors for face recognition';
COMMENT ON COLUMN face_descriptors.descriptor IS '128-dimensional array representing a face encoding';
COMMENT ON COLUMN face_descriptors.photo_id IS 'Reference photo where this face descriptor was extracted';
COMMENT ON COLUMN face_descriptors.confidence IS 'Confidence score of the face detection (0-1)';

-- Photo faces table: Links detected faces to photos
CREATE TABLE IF NOT EXISTS photo_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE,
  bounding_box JSONB NOT NULL, -- {x, y, width, height} in percentage
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),
  is_verified BOOLEAN DEFAULT FALSE, -- Manual verification by photographer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE photo_faces IS 'Junction table linking photos to detected faces';
COMMENT ON COLUMN photo_faces.bounding_box IS 'Face bounding box coordinates as {x, y, width, height} in percentage';
COMMENT ON COLUMN photo_faces.is_verified IS 'Whether the face identification has been manually verified';

-- =============================================================================
-- 2. CREATE INDEXES
-- =============================================================================

-- Photos indexes
CREATE INDEX IF NOT EXISTS idx_photos_sister ON photos(sister);
CREATE INDEX IF NOT EXISTS idx_photos_event_type ON photos(event_type);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_photos_photographer ON photos(photographer_id);

-- People indexes
CREATE INDEX IF NOT EXISTS idx_people_sister ON people(sister);
CREATE INDEX IF NOT EXISTS idx_people_name ON people(name);

-- Face descriptors indexes
CREATE INDEX IF NOT EXISTS idx_face_descriptors_person ON face_descriptors(person_id);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_photo ON face_descriptors(photo_id);

-- Photo faces indexes
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo ON photo_faces(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_person ON photo_faces(person_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_verified ON photo_faces(is_verified);

-- =============================================================================
-- 3. CREATE FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates the updated_at column on row updates';

-- =============================================================================
-- 4. CREATE TRIGGERS
-- =============================================================================

-- Trigger for photos updated_at
CREATE TRIGGER update_photos_updated_at
    BEFORE UPDATE ON photos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for people updated_at
CREATE TRIGGER update_people_updated_at
    BEFORE UPDATE ON people
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for photo_faces updated_at
CREATE TRIGGER update_photo_faces_updated_at
    BEFORE UPDATE ON photo_faces
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. ENABLE ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_faces ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. CREATE RLS POLICIES
-- =============================================================================

-- Photos policies
CREATE POLICY "Photos are viewable by everyone" 
  ON photos FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert photos" 
  ON photos FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own photos" 
  ON photos FOR UPDATE 
  USING (auth.uid() = photographer_id);

CREATE POLICY "Users can delete their own photos" 
  ON photos FOR DELETE 
  USING (auth.uid() = photographer_id);

-- People policies
CREATE POLICY "People are viewable by everyone" 
  ON people FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert people" 
  ON people FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update people" 
  ON people FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Face descriptors policies
CREATE POLICY "Face descriptors viewable by authenticated users" 
  ON face_descriptors FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert face descriptors" 
  ON face_descriptors FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete face descriptors" 
  ON face_descriptors FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Photo faces policies
CREATE POLICY "Photo faces viewable by everyone" 
  ON photo_faces FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can insert photo faces" 
  ON photo_faces FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photo faces" 
  ON photo_faces FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photo faces" 
  ON photo_faces FOR DELETE 
  USING (auth.role() = 'authenticated');

-- =============================================================================
-- 7. INSERT SAMPLE DATA (Optional - for testing)
-- =============================================================================

-- Sample people
INSERT INTO people (name, role, sister) VALUES
  ('Parvathy C', 'bride', 'sister-a'),
  ('Sreedevi C', 'bride', 'sister-b'),
  ('Groom A', 'groom', 'sister-a'),
  ('Groom B', 'groom', 'sister-b'),
  ('Mother', 'family', 'both'),
  ('Father', 'family', 'both')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- 8. GRANT PERMISSIONS
-- =============================================================================

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant access to tables
GRANT SELECT ON photos TO anon;
GRANT ALL ON photos TO authenticated;

GRANT SELECT ON people TO anon;
GRANT ALL ON people TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON face_descriptors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON photo_faces TO authenticated;

-- =============================================================================
-- 9. CREATE VIEWS (for easier querying)
-- =============================================================================

-- View: Photos with face count
CREATE OR REPLACE VIEW photos_with_faces AS
SELECT 
  p.*,
  COUNT(DISTINCT pf.id) as face_count,
  ARRAY_AGG(DISTINCT pe.name) FILTER (WHERE pe.name IS NOT NULL) as people_names
FROM photos p
LEFT JOIN photo_faces pf ON p.id = pf.photo_id
LEFT JOIN people pe ON pf.person_id = pe.id
GROUP BY p.id;

COMMENT ON VIEW photos_with_faces IS 'Photos with face count and list of recognized people';

-- View: People with photo count
CREATE OR REPLACE VIEW people_with_stats AS
SELECT 
  pe.*,
  COUNT(DISTINCT pf.photo_id) as photo_count,
  COUNT(DISTINCT fd.id) as descriptor_count
FROM people pe
LEFT JOIN photo_faces pf ON pe.id = pf.person_id
LEFT JOIN face_descriptors fd ON pe.id = fd.person_id
GROUP BY pe.id;

COMMENT ON VIEW people_with_stats IS 'People with their photo appearances and face descriptor counts';

-- Grant select on views
GRANT SELECT ON photos_with_faces TO anon, authenticated;
GRANT SELECT ON people_with_stats TO anon, authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

