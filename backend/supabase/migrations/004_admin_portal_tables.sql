-- =====================================================
-- ADMIN PORTAL DATA TABLES
-- Tables for storing website settings, analytics, and logs
-- =====================================================

-- =====================================================
-- 1. WEBSITE SETTINGS TABLE
-- =====================================================
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

-- Policy for reading settings (public can read)
CREATE POLICY "Public can read settings" ON website_settings
FOR SELECT USING (true);

-- Policy for updating settings (admin only)
CREATE POLICY "Admin can manage settings" ON website_settings
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Insert default settings
INSERT INTO website_settings (key, value, category, description) VALUES
  ('site_name', 'Parvathy & Sreedevi Wedding', 'general', 'Website title'),
  ('enable_photo_booth', 'true', 'features', 'Enable photo booth feature'),
  ('enable_face_recognition', 'true', 'features', 'Enable AI face recognition'),
  ('enable_guest_wishes', 'true', 'features', 'Allow guest wishes'),
  ('maintenance_mode', 'false', 'system', 'Website maintenance mode'),
  ('max_photo_size', '10485760', 'uploads', 'Maximum photo size in bytes'),
  ('allowed_file_types', 'jpg,jpeg,png,webp,gif', 'uploads', 'Allowed image file types')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 2. ANALYTICS TABLE
-- =====================================================
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

-- Policy for inserting events (anyone can track)
CREATE POLICY "Anyone can insert analytics" ON analytics_events
FOR INSERT WITH CHECK (true);

-- Policy for reading events (admin only)
CREATE POLICY "Admin can read analytics" ON analytics_events
FOR SELECT TO service_role USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events(event_category);

-- =====================================================
-- 3. ADMIN ACTIVITY LOG TABLE
-- =====================================================
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

-- Policy for inserting logs (authenticated users)
CREATE POLICY "Authenticated can insert logs" ON admin_activity_log
FOR INSERT TO authenticated WITH CHECK (true);

-- Policy for reading logs (admin only)
CREATE POLICY "Admin can read logs" ON admin_activity_log
FOR SELECT TO service_role USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_admin_activity_admin_id ON admin_activity_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_created_at ON admin_activity_log(created_at DESC);

-- =====================================================
-- 4. WEBSITE STATISTICS TABLE (Aggregated)
-- =====================================================
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

-- Policy for reading stats (public)
CREATE POLICY "Public can read stats" ON website_statistics
FOR SELECT USING (true);

-- Policy for updating stats (service role only)
CREATE POLICY "Service role can manage stats" ON website_statistics
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_stats_date ON website_statistics(stat_date DESC);

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Function to increment a statistic
CREATE OR REPLACE FUNCTION increment_stat(
  p_stat_name TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
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
$$;

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
AS $$
  SELECT 
    COALESCE(SUM(total_visits), 0)::BIGINT as total_visits,
    COALESCE(SUM(photo_booth_visits), 0)::BIGINT as photo_booth_visits,
    COALESCE(SUM(gallery_views), 0)::BIGINT as gallery_views,
    COALESCE(SUM(photo_downloads), 0)::BIGINT as photo_downloads,
    COALESCE(SUM(face_searches), 0)::BIGINT as face_searches,
    COALESCE(SUM(wishes_submitted), 0)::BIGINT as wishes_submitted
  FROM website_statistics
  WHERE stat_date >= CURRENT_DATE - INTERVAL '30 days';
$$;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Created Tables:
-- ✅ website_settings - Store all configuration
-- ✅ analytics_events - Track user actions
-- ✅ admin_activity_log - Log admin actions
-- ✅ website_statistics - Aggregate metrics
--
-- Created Functions:
-- ✅ increment_stat() - Easily update counters
-- ✅ get_current_stats() - Get aggregated stats
--
-- Security:
-- ✅ Row Level Security enabled on all tables
-- ✅ Admin-only access for sensitive data
-- ✅ Public read access for public data
-- =====================================================

