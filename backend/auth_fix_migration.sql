-- Migration to fix authentication and missing columns
-- Run this on the Cloud SQL instance

-- 1. Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_attempt TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- 2. Create auth_audit_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS auth_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Ensure the initial admin user is active
UPDATE users SET is_active = TRUE WHERE username = 'admin';

-- 4. Create the photographer user if it doesn't exist
-- password: photo123 (hashed with bcrypt)
INSERT INTO users (username, password, role, is_active)
VALUES ('photographer', '$2b$10$5v6mkE3u6diWgTW.a2CQluek.umodJfMGCw.pQF9FRM/7IF5fS2ba', 'photographer', TRUE)
ON CONFLICT (username) DO NOTHING;
