ALTER TABLE weddings 
ADD COLUMN IF NOT EXISTS photographer_username TEXT,
ADD COLUMN IF NOT EXISTS photographer_password TEXT;
