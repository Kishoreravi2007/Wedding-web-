-- Run this in Supabase SQL Editor if you haven't already
-- This creates the weddings table and helper functions

-- =====================================================
-- 1. CREATE WEDDINGS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS weddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  wedding_code TEXT UNIQUE NOT NULL,
  bride_name TEXT NOT NULL,
  groom_name TEXT,
  
  -- Wedding Details
  wedding_date DATE,
  wedding_month TEXT,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_weddings_code ON weddings(wedding_code);
CREATE INDEX IF NOT EXISTS idx_weddings_status ON weddings(status);
CREATE INDEX IF NOT EXISTS idx_weddings_date ON weddings(wedding_date);
CREATE INDEX IF NOT EXISTS idx_weddings_created_at ON weddings(created_at DESC);

-- =====================================================
-- 3. ENABLE ROW LEVEL SECURITY (Allow all for now)
-- =====================================================
ALTER TABLE weddings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on weddings" ON weddings;

-- Allow all operations for now (you can restrict this later)
CREATE POLICY "Allow all operations on weddings" ON weddings
FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- 4. CREATE WEDDING STATS FUNCTION
-- =====================================================
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
    COALESCE((SELECT SUM(size) FROM photos WHERE wedding_id = p_wedding_id), 0)::DECIMAL / 1048576.0 as storage_used_mb
$$;

-- =====================================================
-- 5. INSERT SAMPLE WEDDINGS (if not exists)
-- =====================================================
INSERT INTO weddings (
  wedding_code,
  bride_name,
  groom_name,
  wedding_date,
  wedding_month,
  venue,
  venue_address,
  package_type,
  status,
  theme_color,
  contact_email,
  contact_phone,
  enable_photo_booth,
  enable_face_recognition,
  enable_wishes,
  enable_live_stream,
  max_photos
) VALUES 
(
  'sreedevi-vaishag-2026',
  'Sreedevi',
  'Vaishag',
  '2026-01-11',
  'January 2026',
  'Grand Palace',
  '123 Main St, City',
  'premium',
  'upcoming',
  '#e91e63',
  'sreedevi@example.com',
  '+91 1234567890',
  true,
  true,
  true,
  false,
  1000
),
(
  'parvathy-hari-2026',
  'Parvathy',
  'Hari',
  '2026-01-04',
  'January 2026',
  'Royal Gardens',
  '456 Garden Rd, Town',
  'premium',
  'upcoming',
  '#9c27b0',
  'parvathy@example.com',
  '+91 0987654321',
  true,
  true,
  true,
  false,
  1000
)
ON CONFLICT (wedding_code) DO NOTHING;

-- =====================================================
-- DONE! ✅
-- =====================================================

SELECT 'Weddings table created successfully!' as message;
SELECT * FROM weddings;

