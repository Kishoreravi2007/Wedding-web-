-- =====================================================
-- WISHES TABLE
-- Table for storing wedding wishes from guests
-- =====================================================

CREATE TABLE IF NOT EXISTS wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  wish TEXT,
  audio_url TEXT,
  recipient TEXT NOT NULL DEFAULT 'both' CHECK (recipient IN ('sister-a', 'sister-b', 'parvathy', 'sreedevi', 'both')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE wishes IS 'Stores wedding wishes from guests';
COMMENT ON COLUMN wishes.name IS 'Name of the person submitting the wish';
COMMENT ON COLUMN wishes.wish IS 'Text wish message (optional if audio_url is provided)';
COMMENT ON COLUMN wishes.audio_url IS 'URL to audio wish recording (optional if wish text is provided)';
COMMENT ON COLUMN wishes.recipient IS 'Which bride the wish is for';

-- Enable RLS
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;

-- Policy for reading wishes (public can read)
CREATE POLICY "Public can read wishes" ON wishes
FOR SELECT USING (true);

-- Policy for creating wishes (anyone can submit)
CREATE POLICY "Anyone can submit wishes" ON wishes
FOR INSERT WITH CHECK (true);

-- Policy for updating wishes (service role only)
CREATE POLICY "Service role can update wishes" ON wishes
FOR UPDATE TO service_role USING (true) WITH CHECK (true);

-- Policy for deleting wishes (service role only)
CREATE POLICY "Service role can delete wishes" ON wishes
FOR DELETE TO service_role USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishes_recipient ON wishes(recipient);
CREATE INDEX IF NOT EXISTS idx_wishes_timestamp ON wishes(timestamp DESC);

-- Insert some sample wishes (optional)
-- INSERT INTO wishes (name, wish, recipient) VALUES
--   ('John Doe', 'Wishing you both a lifetime of happiness!', 'both'),
--   ('Jane Smith', 'Congratulations on your special day!', 'both')
-- ON CONFLICT DO NOTHING;

