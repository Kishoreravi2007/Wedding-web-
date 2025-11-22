-- =====================================================
-- LIVE EVENT PHOTO SYNC SYSTEM
-- Migration: 010_live_photo_sync.sql
-- =====================================================

-- =====================================================
-- 1. CREATE PHOTOGRAPHER API KEYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS photographer_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  api_key TEXT UNIQUE NOT NULL,
  key_name TEXT, -- Optional name for the key (e.g., "Canon Camera", "Laptop App")
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Optional expiration
  
  CONSTRAINT api_key_format CHECK (api_key ~ '^[a-zA-Z0-9_-]{32,}$')
);

CREATE INDEX IF NOT EXISTS idx_api_keys_photographer ON photographer_api_keys(photographer_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON photographer_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON photographer_api_keys(is_active) WHERE is_active = true;

COMMENT ON TABLE photographer_api_keys IS 'API keys for photographers to authenticate desktop app uploads';
COMMENT ON COLUMN photographer_api_keys.api_key IS 'Unique API key (Bearer token) for authentication';

-- =====================================================
-- 2. EXTEND PHOTOS TABLE FOR LIVE SYNC
-- =====================================================
-- Add columns to existing photos table if they don't exist
DO $$ 
BEGIN
  -- Add event_id column (references weddings table)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'photos' AND column_name = 'event_id') THEN
    ALTER TABLE photos ADD COLUMN event_id UUID REFERENCES weddings(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_photos_event_id ON photos(event_id);
  END IF;
  
  -- Add is_live_sync column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'photos' AND column_name = 'is_live_sync') THEN
    ALTER TABLE photos ADD COLUMN is_live_sync BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_photos_live_sync ON photos(is_live_sync) WHERE is_live_sync = true;
  END IF;
  
  -- Add sync_timestamp column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'photos' AND column_name = 'sync_timestamp') THEN
    ALTER TABLE photos ADD COLUMN sync_timestamp TIMESTAMPTZ;
    CREATE INDEX IF NOT EXISTS idx_photos_sync_timestamp ON photos(sync_timestamp DESC);
  END IF;
  
  -- Add upload_source column (e.g., 'desktop_app', 'web_portal', 'mobile')
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'photos' AND column_name = 'upload_source') THEN
    ALTER TABLE photos ADD COLUMN upload_source TEXT DEFAULT 'web_portal';
  END IF;
END $$;

COMMENT ON COLUMN photos.event_id IS 'References the wedding/event this photo belongs to';
COMMENT ON COLUMN photos.is_live_sync IS 'True if photo was uploaded via live sync';
COMMENT ON COLUMN photos.sync_timestamp IS 'Timestamp when photo was synced via live upload';
COMMENT ON COLUMN photos.upload_source IS 'Source of upload: desktop_app, web_portal, mobile';

-- =====================================================
-- 3. CREATE LIVE SYNC UPLOAD QUEUE (for offline retry)
-- =====================================================
CREATE TABLE IF NOT EXISTS live_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photographer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES weddings(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL, -- Local file path on desktop app
  file_name TEXT NOT NULL,
  file_size BIGINT,
  file_hash TEXT, -- MD5/SHA256 hash for deduplication
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'completed', 'failed', 'cancelled')),
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB, -- Store additional metadata (title, description, etc.)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_photographer ON live_sync_queue(photographer_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_event ON live_sync_queue(event_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON live_sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_pending ON live_sync_queue(photographer_id, status) WHERE status = 'pending';

COMMENT ON TABLE live_sync_queue IS 'Queue for offline photo uploads that need retry';
COMMENT ON COLUMN live_sync_queue.file_hash IS 'File hash for deduplication';

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE photographer_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for API Keys
DROP POLICY IF EXISTS "Photographers can view their own API keys" ON photographer_api_keys;
CREATE POLICY "Photographers can view their own API keys"
  ON photographer_api_keys FOR SELECT
  USING (auth.uid() = photographer_id OR EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

DROP POLICY IF EXISTS "Photographers can create their own API keys" ON photographer_api_keys;
CREATE POLICY "Photographers can create their own API keys"
  ON photographer_api_keys FOR INSERT
  WITH CHECK (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Photographers can update their own API keys" ON photographer_api_keys;
CREATE POLICY "Photographers can update their own API keys"
  ON photographer_api_keys FOR UPDATE
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Photographers can delete their own API keys" ON photographer_api_keys;
CREATE POLICY "Photographers can delete their own API keys"
  ON photographer_api_keys FOR DELETE
  USING (auth.uid() = photographer_id);

-- RLS Policies for Sync Queue
DROP POLICY IF EXISTS "Photographers can view their own queue items" ON live_sync_queue;
CREATE POLICY "Photographers can view their own queue items"
  ON live_sync_queue FOR SELECT
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Photographers can create their own queue items" ON live_sync_queue;
CREATE POLICY "Photographers can create their own queue items"
  ON live_sync_queue FOR INSERT
  WITH CHECK (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Photographers can update their own queue items" ON live_sync_queue;
CREATE POLICY "Photographers can update their own queue items"
  ON live_sync_queue FOR UPDATE
  USING (auth.uid() = photographer_id);

DROP POLICY IF EXISTS "Photographers can delete their own queue items" ON live_sync_queue;
CREATE POLICY "Photographers can delete their own queue items"
  ON live_sync_queue FOR DELETE
  USING (auth.uid() = photographer_id);

