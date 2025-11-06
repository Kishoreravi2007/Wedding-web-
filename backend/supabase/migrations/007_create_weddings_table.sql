-- =====================================================
-- WEDDINGS/CUSTOMERS TABLE
-- Manages multiple wedding clients instead of hardcoded sister-a/sister-b
-- =====================================================

-- =====================================================
-- 1. CREATE WEDDINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  wedding_code TEXT UNIQUE NOT NULL, -- URL-friendly code (e.g., 'sreedevi-vaishag-2026')
  bride_name TEXT NOT NULL,
  groom_name TEXT,
  
  -- Wedding Details
  wedding_date DATE,
  wedding_month TEXT, -- e.g., 'January 2026'
  venue TEXT,
  venue_address TEXT,
  
  -- Package & Status
  package_type TEXT DEFAULT 'basic' CHECK (package_type IN ('basic', 'premium', 'luxury')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'upcoming', 'completed', 'archived')),
  
  -- Customization
  theme_color TEXT DEFAULT '#ff6b9d',
  custom_domain TEXT,
  
  -- Features Enabled
  enable_photo_booth BOOLEAN DEFAULT true,
  enable_face_recognition BOOLEAN DEFAULT true,
  enable_wishes BOOLEAN DEFAULT true,
  enable_live_stream BOOLEAN DEFAULT false,
  
  -- Storage & Limits
  max_photos INTEGER DEFAULT 1000,
  storage_used_mb DECIMAL(10,2) DEFAULT 0,
  
  -- Contact Information
  contact_email TEXT,
  contact_phone TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT wedding_date_valid CHECK (wedding_date IS NULL OR wedding_date >= CURRENT_DATE - INTERVAL '1 year')
);

COMMENT ON TABLE weddings IS 'Stores information about wedding clients/customers';
COMMENT ON COLUMN weddings.wedding_code IS 'URL-friendly unique identifier (used in URLs)';
COMMENT ON COLUMN weddings.package_type IS 'Service package level';
COMMENT ON COLUMN weddings.status IS 'Current status of the wedding event';

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_weddings_code ON weddings(wedding_code);
CREATE INDEX IF NOT EXISTS idx_weddings_status ON weddings(status);
CREATE INDEX IF NOT EXISTS idx_weddings_date ON weddings(wedding_date);
CREATE INDEX IF NOT EXISTS idx_weddings_created_at ON weddings(created_at DESC);

-- =====================================================
-- 3. ADD WEDDING_ID TO EXISTING TABLES
-- =====================================================

-- Add wedding_id to photos table
ALTER TABLE photos 
  ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_photos_wedding_id ON photos(wedding_id);

-- Add wedding_id to people table
ALTER TABLE people 
  ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_people_wedding_id ON people(wedding_id);

-- Add wedding_id to wishes table
ALTER TABLE wishes
  ADD COLUMN IF NOT EXISTS wedding_id UUID REFERENCES weddings(id) ON DELETE CASCADE;

-- Create index
CREATE INDEX IF NOT EXISTS idx_wishes_wedding_id ON wishes(wedding_id);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Public can view active weddings
CREATE POLICY "Public can view active weddings" ON weddings
FOR SELECT USING (status IN ('active', 'upcoming'));

-- Authenticated users can insert weddings
CREATE POLICY "Authenticated users can insert weddings" ON weddings
FOR INSERT TO authenticated WITH CHECK (true);

-- Users can update their own weddings
CREATE POLICY "Users can update their weddings" ON weddings
FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.jwt() ->> 'role' = 'admin'
);

-- Admin can delete weddings
CREATE POLICY "Admin can delete weddings" ON weddings
FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- 5. SEED DATA - JANUARY 2026 CUSTOMERS
-- =====================================================

-- Insert the two current customers for January 2026
INSERT INTO weddings (
  wedding_code,
  bride_name,
  groom_name,
  wedding_date,
  wedding_month,
  package_type,
  status,
  theme_color,
  enable_photo_booth,
  enable_face_recognition,
  enable_wishes
) VALUES 
(
  'sreedevi-vaishag-2026',
  'Sreedevi',
  'Vaishag',
  '2026-01-11', -- January 11, 2026
  'January 2026',
  'premium',
  'upcoming',
  '#e91e63',
  true,
  true,
  true
),
(
  'paravthy-hari-2026',
  'Paravthy',
  'Hari',
  '2026-01-04', -- January 04, 2026
  'January 2026',
  'premium',
  'upcoming',
  '#9c27b0',
  true,
  true,
  true
)
ON CONFLICT (wedding_code) DO NOTHING;

-- =====================================================
-- 6. MIGRATION HELPER FUNCTION
-- =====================================================

-- Function to migrate old 'sister' data to new wedding system
CREATE OR REPLACE FUNCTION migrate_sister_to_weddings()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  sister_a_wedding_id UUID;
  sister_b_wedding_id UUID;
BEGIN
  -- Get or create wedding for sister-a (if exists in legacy data)
  INSERT INTO weddings (
    wedding_code,
    bride_name,
    wedding_month,
    status,
    package_type
  ) VALUES (
    'sister-a-legacy',
    'Parvathy C',
    'Legacy',
    'archived',
    'basic'
  )
  ON CONFLICT (wedding_code) DO UPDATE SET wedding_code = 'sister-a-legacy'
  RETURNING id INTO sister_a_wedding_id;

  -- Get or create wedding for sister-b
  INSERT INTO weddings (
    wedding_code,
    bride_name,
    wedding_month,
    status,
    package_type
  ) VALUES (
    'sister-b-legacy',
    'Sreedevi C',
    'Legacy',
    'archived',
    'basic'
  )
  ON CONFLICT (wedding_code) DO UPDATE SET wedding_code = 'sister-b-legacy'
  RETURNING id INTO sister_b_wedding_id;

  -- Migrate photos
  UPDATE photos 
  SET wedding_id = sister_a_wedding_id 
  WHERE sister = 'sister-a' AND wedding_id IS NULL;
  
  UPDATE photos 
  SET wedding_id = sister_b_wedding_id 
  WHERE sister = 'sister-b' AND wedding_id IS NULL;

  -- Migrate people
  UPDATE people 
  SET wedding_id = sister_a_wedding_id 
  WHERE sister = 'sister-a' AND wedding_id IS NULL;
  
  UPDATE people 
  SET wedding_id = sister_b_wedding_id 
  WHERE sister = 'sister-b' AND wedding_id IS NULL;

  -- Migrate wishes
  UPDATE wishes 
  SET wedding_id = sister_a_wedding_id 
  WHERE recipient IN ('sister-a', 'parvathy') AND wedding_id IS NULL;
  
  UPDATE wishes 
  SET wedding_id = sister_b_wedding_id 
  WHERE recipient IN ('sister-b', 'sreedevi') AND wedding_id IS NULL;

  RAISE NOTICE 'Migration completed successfully';
END;
$$;

-- Run the migration automatically
SELECT migrate_sister_to_weddings();

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get wedding by code
CREATE OR REPLACE FUNCTION get_wedding_by_code(p_wedding_code TEXT)
RETURNS TABLE(
  id UUID,
  wedding_code TEXT,
  bride_name TEXT,
  groom_name TEXT,
  wedding_date DATE,
  theme_color TEXT,
  status TEXT
)
LANGUAGE sql
AS $$
  SELECT 
    id,
    wedding_code,
    bride_name,
    groom_name,
    wedding_date,
    theme_color,
    status
  FROM weddings
  WHERE weddings.wedding_code = p_wedding_code
  AND status IN ('active', 'upcoming');
$$;

-- Function to get wedding statistics
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
    (SELECT COUNT(*) FROM photos WHERE wedding_id = p_wedding_id),
    (SELECT COUNT(*) FROM people WHERE wedding_id = p_wedding_id),
    (SELECT COUNT(*) FROM wishes WHERE wedding_id = p_wedding_id),
    (SELECT COALESCE(SUM(size), 0) / 1048576.0 FROM photos WHERE wedding_id = p_wedding_id)
  ;
$$;

-- =====================================================
-- 8. UPDATE TRIGGER FOR updated_at
-- =====================================================
CREATE TRIGGER update_weddings_updated_at
  BEFORE UPDATE ON weddings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
-- 
-- ✅ Created weddings table for customer management
-- ✅ Added wedding_id to photos, people, and wishes tables
-- ✅ Created indexes for performance
-- ✅ Set up Row Level Security policies
-- ✅ Added seed data for January 2026 customers:
--    - Sreedevi & Vaishag
--    - Paravthy & Hari
-- ✅ Created helper functions for wedding management
-- ✅ Migration function for legacy 'sister' data
-- 
-- Next Steps:
-- 1. Update backend API to use wedding_id
-- 2. Create admin UI for wedding management
-- 3. Update frontend to work with wedding_code
-- =====================================================

