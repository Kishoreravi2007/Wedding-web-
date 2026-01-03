-- Migration to create wishes table in Cloud SQL
-- This replaces the Firebase-based wishes management

CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  wish TEXT,
  audio_url TEXT,
  recipient TEXT NOT NULL DEFAULT 'both' CHECK (recipient IN ('sister-a', 'sister-b', 'parvathy', 'sreedevi', 'both')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishes_recipient ON wishes(recipient);
CREATE INDEX IF NOT EXISTS idx_wishes_timestamp ON wishes(timestamp DESC);

-- Add updated_at trigger
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_wishes_updated_at') THEN
        CREATE TRIGGER update_wishes_updated_at 
        BEFORE UPDATE ON wishes 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
