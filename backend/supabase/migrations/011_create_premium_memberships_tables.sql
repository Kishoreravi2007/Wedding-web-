-- =====================================================
-- Premium Membership + Website Builder schema
-- Created: 2025-11-26
-- =====================================================

-- Add optional email column so we can send activation emails to customers
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 1. CREATE PAYMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (1,3,6,8,12)),
  features JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_gateway TEXT,
  payment_gateway_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payment_history IS 'Tracks premium checkout attempts and final payments for customers';
COMMENT ON COLUMN payment_history.features IS 'List of premium features selected when the user checked out';

-- 2. CREATE PREMIUM MEMBERSHIPS TABLE
CREATE TABLE IF NOT EXISTS premium_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  features JSONB NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (1,3,6,8,12)),
  start_date TIMESTAMPTZ NOT NULL,
  expiry_date TIMESTAMPTZ NOT NULL,
  payment_id UUID REFERENCES payment_history(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE premium_memberships IS 'Stores the membership window and status once a payment is confirmed';

-- 3. CREATE USER SITES TABLE
CREATE TABLE IF NOT EXISTS user_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT NOT NULL DEFAULT 'modern-classic',
  hero_title TEXT,
  hero_subtitle TEXT,
  published_url TEXT UNIQUE,
  is_published BOOLEAN DEFAULT FALSE,
  event_metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN user_sites.event_metadata IS 'Caching field for wedding details, timeline, maps, stories, etc.';

-- 4. CREATE SITE MEDIA TABLES
CREATE TABLE IF NOT EXISTS site_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  storage_provider TEXT DEFAULT 'cloudinary',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_music (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
  music_url TEXT NOT NULL,
  title TEXT,
  artist TEXT,
  autoplay BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_id UUID REFERENCES user_sites(id) ON DELETE CASCADE,
  section_key TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::JSONB,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  metadata JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE user_notifications IS 'Stores in-dashboard notifications for customers';

-- 6. INDEXES
CREATE INDEX IF NOT EXISTS idx_payment_history_user ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_memberships_user ON premium_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sites_user ON user_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_site_photos_site ON site_photos(site_id);
CREATE INDEX IF NOT EXISTS idx_site_music_site ON site_music(site_id);
CREATE INDEX IF NOT EXISTS idx_site_sections_site ON site_sections(site_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);

-- 7. TRIGGERS
CREATE TRIGGER update_payment_history_updated_at
  BEFORE UPDATE ON payment_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_memberships_updated_at
  BEFORE UPDATE ON premium_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sites_updated_at
  BEFORE UPDATE ON user_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_photos_updated_at
  BEFORE UPDATE ON site_photos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_music_updated_at
  BEFORE UPDATE ON site_music
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_sections_updated_at
  BEFORE UPDATE ON site_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_notifications_updated_at
  BEFORE UPDATE ON user_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Migration notes:
-- • payment_history captures soft checkout data that later becomes a premium membership
-- • user_notifications powers the in-dashboard success alerts
-- =====================================================

