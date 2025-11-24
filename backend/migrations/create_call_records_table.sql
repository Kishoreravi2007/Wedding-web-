-- Create call_records table for storing n8n call records
CREATE TABLE IF NOT EXISTS call_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  message_id UUID REFERENCES contact_messages(id) ON DELETE SET NULL,
  feedback_id UUID REFERENCES feedback(id) ON DELETE SET NULL,
  reason VARCHAR(255) DEFAULT 'General inquiry',
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'calling', 'in_progress', 'completed', 'failed', 'no_answer')),
  summary TEXT,
  transcript TEXT,
  duration INTEGER, -- Duration in seconds
  resolution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_call_records_call_id ON call_records(call_id);
CREATE INDEX IF NOT EXISTS idx_call_records_phone_number ON call_records(phone_number);
CREATE INDEX IF NOT EXISTS idx_call_records_status ON call_records(status);
CREATE INDEX IF NOT EXISTS idx_call_records_created_at ON call_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_records_message_id ON call_records(message_id);
CREATE INDEX IF NOT EXISTS idx_call_records_feedback_id ON call_records(feedback_id);

-- Enable Row Level Security
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;

-- Create policy to allow admin access
CREATE POLICY "Allow admin access" ON call_records
  FOR ALL
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_call_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_call_records_updated_at
  BEFORE UPDATE ON call_records
  FOR EACH ROW
  EXECUTE FUNCTION update_call_records_updated_at();

