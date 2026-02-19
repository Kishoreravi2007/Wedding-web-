-- Migration: Add is_public column to photos table
-- Default to true for existing photos, but default to false for new photographer uploads in the app logic.
ALTER TABLE photos ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE;

-- Create an index for performance on visibility filtering
CREATE INDEX IF NOT EXISTS idx_photos_is_public ON photos(is_public);
