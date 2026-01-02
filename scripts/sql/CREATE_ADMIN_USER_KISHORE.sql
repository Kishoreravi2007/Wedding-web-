-- =====================================================
-- CREATE ADMIN USER: kishore
-- Password: qwerty123
-- =====================================================

-- Step 1: Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'photographer', 'couple', 'user')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policy for service role to manage users
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users" ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 4: Create policy for authenticated users to read their own data
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

-- Step 5: Insert/Update admin user
-- Password 'qwerty123' is pre-hashed using bcrypt (12 rounds)
INSERT INTO users (username, password, role, is_active)
VALUES (
  'kishore',
  '$2b$12$ZtmqYrkLYWi/pGvygWbgO.DSUhkNbtM8GRtahXDggc9d8YzMG8.B2',
  'admin',
  true
)
ON CONFLICT (username) 
DO UPDATE SET 
  password = EXCLUDED.password,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Step 6: Verify the user was created
SELECT 
  id, 
  username, 
  role, 
  is_active, 
  created_at 
FROM users 
WHERE username = 'kishore';

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- ✅ Login Credentials:
--    Username: kishore
--    Password: qwerty123
--    Role: admin
--
-- 🌐 Login URLs:
--    Local: http://localhost:3000/admin-login
--    Production: https://weddingweb.co.in/admin-login
--
-- ⚠️  SECURITY NOTE:
--    - Keep this password secure
--    - Consider changing after first login
--    - Never commit this SQL file to public repositories
-- =====================================================

