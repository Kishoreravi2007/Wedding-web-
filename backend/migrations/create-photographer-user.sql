-- SQL Migration: Create Photographer User
-- Run this in Cloud SQL Console or via gcloud sql connect

-- Create photographer user with bcrypt-hashed password for "photo123"
-- The hash below is for password "photo123" (bcrypt rounds=10)

INSERT INTO users (username, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'photographer',
  '$2a$10$rZ5zCxHvEQ7qKX8yF9F5/.vYmxK7xEQGX8QGmQzH2nJ8Yn5kK/jXO',
  'photographer',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (username) DO UPDATE 
SET 
  password_hash = EXCLUDED.password_hash,
  updated_at = NOW();

-- Verify the user was created
SELECT id, username, role, is_active, created_at 
FROM users 
WHERE username = 'photographer';
