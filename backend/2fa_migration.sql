-- Migration to add Two-Factor Authentication (2FA) columns
-- Run this on your Production Cloud SQL instance to fix the login error

-- 1. Add 2FA columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_2fa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- 2. Verify columns
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';
