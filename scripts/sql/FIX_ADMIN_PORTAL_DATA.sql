-- =====================================================
-- FIX ALL ADMIN PORTAL DATA
-- Run this in Supabase to ensure all data is correct
-- =====================================================

-- =====================================================
-- 1. ENSURE USERS TABLE EXISTS AND IS CORRECT
-- =====================================================

-- Recreate users table with correct structure
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'photographer', 'couple', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Service role can manage users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create policies
CREATE POLICY "Service role can manage users" ON users
FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON users
FOR SELECT TO authenticated USING (auth.uid()::text = id::text);

-- =====================================================
-- 2. CREATE/UPDATE ADMIN USER WITH CORRECT PASSWORD
-- =====================================================

-- Delete existing kishore user if exists (to start fresh)
DELETE FROM users WHERE username = 'kishore';

-- Insert admin user with password: qwerty123
-- This hash is pre-generated for qwerty123
INSERT INTO users (username, password, role, is_active)
VALUES (
  'kishore',
  '$2b$12$ZtmqYrkLYWi/pGvygWbgO.DSUhkNbtM8GRtahXDggc9d8YzMG8.B2',
  'admin',
  true
);

-- =====================================================
-- 3. ENSURE PHOTOS TABLE EXISTS
-- =====================================================

CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  public_url TEXT NOT NULL,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b', 'sister_a', 'sister_b')),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  file_size BIGINT,
  mime_type TEXT,
  faces_detected INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Public can view photos" ON photos;
DROP POLICY IF EXISTS "Authenticated can upload photos" ON photos;
DROP POLICY IF EXISTS "Admin can delete photos" ON photos;

-- Create policies
CREATE POLICY "Public can view photos" ON photos
FOR SELECT USING (true);

CREATE POLICY "Authenticated can upload photos" ON photos
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can manage photos" ON photos
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- 4. ENSURE WEBSITE SETTINGS ARE CORRECT
-- =====================================================

-- Make sure website_settings table exists
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Public can read settings" ON website_settings;
DROP POLICY IF EXISTS "Admin can manage settings" ON website_settings;

-- Create policies
CREATE POLICY "Public can read settings" ON website_settings
FOR SELECT USING (true);

CREATE POLICY "Admin can manage settings" ON website_settings
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Delete all existing settings to start fresh
DELETE FROM website_settings;

-- Insert correct default settings
INSERT INTO website_settings (key, value, category, description) VALUES
  ('site_name', 'Parvathy & Sreedevi Wedding', 'general', 'Website title'),
  ('enable_photo_booth', 'true', 'features', 'Enable photo booth feature'),
  ('enable_face_recognition', 'true', 'features', 'Enable AI face recognition'),
  ('enable_guest_wishes', 'true', 'features', 'Allow guest wishes'),
  ('maintenance_mode', 'false', 'system', 'Website maintenance mode'),
  ('max_photo_size', '10485760', 'uploads', 'Maximum photo size in bytes (10MB)'),
  ('allowed_file_types', 'jpg,jpeg,png,webp,gif', 'uploads', 'Allowed image file types')
ON CONFLICT (key) DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- 5. RESET ANALYTICS AND STATISTICS
-- =====================================================

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  event_data JSONB,
  user_id UUID REFERENCES users(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admin can read analytics" ON analytics_events;

-- Create policies
CREATE POLICY "Anyone can insert analytics" ON analytics_events
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can read analytics" ON analytics_events
FOR SELECT TO service_role USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events(event_category);

-- Create website_statistics table
CREATE TABLE IF NOT EXISTS website_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_visits INTEGER DEFAULT 0,
  photo_booth_visits INTEGER DEFAULT 0,
  gallery_views INTEGER DEFAULT 0,
  photo_downloads INTEGER DEFAULT 0,
  face_searches INTEGER DEFAULT 0,
  wishes_submitted INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(stat_date)
);

-- Enable RLS
ALTER TABLE website_statistics ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Public can read stats" ON website_statistics;
DROP POLICY IF EXISTS "Service role can manage stats" ON website_statistics;

-- Create policies
CREATE POLICY "Public can read stats" ON website_statistics
FOR SELECT USING (true);

CREATE POLICY "Service role can manage stats" ON website_statistics
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_stats_date ON website_statistics(stat_date DESC);

-- Initialize today's statistics
INSERT INTO website_statistics (stat_date)
VALUES (CURRENT_DATE)
ON CONFLICT (stat_date) DO NOTHING;

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Authenticated can insert logs" ON admin_activity_log;
DROP POLICY IF EXISTS "Admin can read logs" ON admin_activity_log;

-- Create policies
CREATE POLICY "Authenticated can insert logs" ON admin_activity_log
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admin can read logs" ON admin_activity_log
FOR SELECT TO service_role USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- =====================================================
-- 6. RECREATE HELPER FUNCTIONS
-- =====================================================

-- Drop existing functions
DROP FUNCTION IF EXISTS increment_stat(TEXT, INTEGER);
DROP FUNCTION IF EXISTS get_current_stats();

-- Function to increment a statistic
CREATE OR REPLACE FUNCTION increment_stat(
  p_stat_name TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Update today's statistics
  INSERT INTO website_statistics (stat_date)
  VALUES (CURRENT_DATE)
  ON CONFLICT (stat_date) DO NOTHING;
  
  -- Increment the specific stat
  CASE p_stat_name
    WHEN 'visits' THEN
      UPDATE website_statistics 
      SET total_visits = total_visits + p_increment, updated_at = CURRENT_TIMESTAMP
      WHERE stat_date = CURRENT_DATE;
    WHEN 'photo_booth' THEN
      UPDATE website_statistics 
      SET photo_booth_visits = photo_booth_visits + p_increment, updated_at = CURRENT_TIMESTAMP
      WHERE stat_date = CURRENT_DATE;
    WHEN 'gallery' THEN
      UPDATE website_statistics 
      SET gallery_views = gallery_views + p_increment, updated_at = CURRENT_TIMESTAMP
      WHERE stat_date = CURRENT_DATE;
    WHEN 'downloads' THEN
      UPDATE website_statistics 
      SET photo_downloads = photo_downloads + p_increment, updated_at = CURRENT_TIMESTAMP
      WHERE stat_date = CURRENT_DATE;
    WHEN 'searches' THEN
      UPDATE website_statistics 
      SET face_searches = face_searches + p_increment, updated_at = CURRENT_TIMESTAMP
      WHERE stat_date = CURRENT_DATE;
    WHEN 'wishes' THEN
      UPDATE website_statistics 
      SET wishes_submitted = wishes_submitted + p_increment, updated_at = CURRENT_TIMESTAMP
      WHERE stat_date = CURRENT_DATE;
  END CASE;
END;
$function$;

-- Function to get current statistics
CREATE OR REPLACE FUNCTION get_current_stats()
RETURNS TABLE(
  total_visits BIGINT,
  photo_booth_visits BIGINT,
  gallery_views BIGINT,
  photo_downloads BIGINT,
  face_searches BIGINT,
  wishes_submitted BIGINT
)
LANGUAGE sql
AS $function$
  SELECT 
    COALESCE(SUM(total_visits), 0)::BIGINT as total_visits,
    COALESCE(SUM(photo_booth_visits), 0)::BIGINT as photo_booth_visits,
    COALESCE(SUM(gallery_views), 0)::BIGINT as gallery_views,
    COALESCE(SUM(photo_downloads), 0)::BIGINT as photo_downloads,
    COALESCE(SUM(face_searches), 0)::BIGINT as face_searches,
    COALESCE(SUM(wishes_submitted), 0)::BIGINT as wishes_submitted
  FROM website_statistics
  WHERE stat_date >= CURRENT_DATE - INTERVAL '30 days';
$function$;

-- =====================================================
-- 7. VERIFY ALL DATA
-- =====================================================

-- Show admin user
SELECT 
  'ADMIN USER' as item,
  username,
  role,
  is_active,
  created_at
FROM users 
WHERE username = 'kishore';

-- Show settings count
SELECT 
  'WEBSITE SETTINGS' as item,
  COUNT(*) as count,
  STRING_AGG(key, ', ' ORDER BY key) as settings
FROM website_settings;

-- Show statistics
SELECT 
  'CURRENT STATISTICS' as item,
  * 
FROM get_current_stats();

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- ✅ Users table: Created/Updated
-- ✅ Admin user (kishore/qwerty123): Created
-- ✅ Photos table: Ready
-- ✅ Website settings: 7 default settings
-- ✅ Analytics tables: Created
-- ✅ Helper functions: Created
-- ✅ All RLS policies: Active
-- 
-- LOGIN CREDENTIALS:
-- Username: kishore
-- Password: qwerty123
-- 
-- =====================================================

