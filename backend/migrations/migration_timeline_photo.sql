-- Add photo_url column to event_timeline for event photos
ALTER TABLE event_timeline ADD COLUMN IF NOT EXISTS photo_url TEXT;
