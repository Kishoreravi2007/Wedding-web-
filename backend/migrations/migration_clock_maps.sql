-- Migration: Add Clock, Countdown, and Map Link fields
-- Add columns to weddings table
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS wedding_time TEXT;
ALTER TABLE weddings ADD COLUMN IF NOT EXISTS show_countdown BOOLEAN DEFAULT TRUE;

-- Add columns to event_timeline table
ALTER TABLE event_timeline ADD COLUMN IF NOT EXISTS location_map_url TEXT;
