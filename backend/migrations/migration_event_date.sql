-- Add event_date column to event_timeline table
ALTER TABLE event_timeline ADD COLUMN IF NOT EXISTS event_date DATE;

-- Update existing rows to have a default date (optional, but good for consistency)
-- If we don't have a specific date, we could leave it null, but let's assume current date for now
-- or better, let the user fill it.
