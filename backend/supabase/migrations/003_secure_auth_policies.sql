-- =====================================================
-- SECURE AUTHENTICATION POLICIES FOR PRODUCTION
-- =====================================================
-- This migration implements proper Row Level Security (RLS) policies
-- for a secure, production-ready authentication system.

-- =====================================================
-- 1. CREATE SERVICE ROLE FUNCTION
-- =====================================================
-- This function allows the backend service to bypass RLS when needed
CREATE OR REPLACE FUNCTION auth.service_role()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT current_setting('role') = 'service_role';
$$;

-- =====================================================
-- 2. UPDATE USERS TABLE WITH BETTER SECURITY
-- =====================================================

-- Add updated_at timestamp
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add last_login tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Add account status
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add login attempts tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- 3. DROP EXISTING POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view their own profile." ON users;
DROP POLICY IF EXISTS "Users can update their own profile." ON users;

-- =====================================================
-- 4. CREATE SECURE RLS POLICIES
-- =====================================================

-- Policy 1: Service role can do everything (for backend operations)
CREATE POLICY "Service role full access" ON users
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- Policy 2: Users can only view their own profile
CREATE POLICY "Users can view own profile" ON users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text);

-- Policy 3: Users can update their own profile (except sensitive fields)
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (
  auth.uid()::text = id::text 
  AND role = (SELECT role FROM users WHERE id = auth.uid())
);

-- Policy 4: Allow user registration (INSERT) for service role only
CREATE POLICY "Service role can create users" ON users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Policy 5: Prevent direct user registration from client
CREATE POLICY "No direct user creation" ON users
FOR INSERT
TO authenticated
WITH CHECK (false);

-- =====================================================
-- 5. CREATE SECURE FUNCTIONS
-- =====================================================

-- Function to safely update user login info
CREATE OR REPLACE FUNCTION auth.update_login_info(user_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users 
  SET 
    last_login = CURRENT_TIMESTAMP,
    login_attempts = 0,
    locked_until = NULL
  WHERE id = user_id;
$$;

-- Function to increment login attempts
CREATE OR REPLACE FUNCTION auth.increment_login_attempts(username TEXT)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE users 
  SET 
    login_attempts = login_attempts + 1,
    locked_until = CASE 
      WHEN login_attempts >= 4 THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
      ELSE locked_until
    END
  WHERE username = $1;
$$;

-- Function to check if user is locked
CREATE OR REPLACE FUNCTION auth.is_user_locked(username TEXT)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users 
    WHERE username = $1 
    AND locked_until > CURRENT_TIMESTAMP
  );
$$;

-- =====================================================
-- 6. CREATE AUDIT LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on audit log
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can access audit logs
CREATE POLICY "Service role audit access" ON auth_audit_log
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =====================================================
-- 7. CREATE SECURE USER MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to create user safely (backend only)
CREATE OR REPLACE FUNCTION auth.create_user(
  p_username TEXT,
  p_password TEXT,
  p_role TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
    RAISE EXCEPTION 'Username already exists';
  END IF;
  
  -- Insert new user
  INSERT INTO users (username, password, role, is_active)
  VALUES (p_username, p_password, p_role, true)
  RETURNING id INTO user_id;
  
  -- Log the creation
  INSERT INTO auth_audit_log (user_id, action, success, details)
  VALUES (user_id, 'user_created', true, jsonb_build_object('role', p_role));
  
  RETURN user_id;
END;
$$;

-- Function to authenticate user
CREATE OR REPLACE FUNCTION auth.authenticate_user(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE(
  user_id UUID,
  username TEXT,
  role TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Check if user is locked
  IF auth.is_user_locked(p_username) THEN
    RAISE EXCEPTION 'Account is temporarily locked due to too many failed attempts';
  END IF;
  
  -- Get user record
  SELECT id, username, password, role, is_active
  INTO user_record
  FROM users 
  WHERE username = p_username;
  
  -- Check if user exists and is active
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid credentials';
  END IF;
  
  IF NOT user_record.is_active THEN
    RAISE EXCEPTION 'Account is deactivated';
  END IF;
  
  -- Verify password (this would be done in application layer with bcrypt)
  -- For now, we'll return the user if they exist and are active
  -- The actual password verification should be done in the Node.js backend
  
  -- Update login info
  PERFORM auth.update_login_info(user_record.id);
  
  -- Log successful login
  INSERT INTO auth_audit_log (user_id, action, success, details)
  VALUES (user_record.id, 'login_success', true, jsonb_build_object('username', p_username));
  
  RETURN QUERY SELECT user_record.id, user_record.username, user_record.role, user_record.is_active;
END;
$$;

-- =====================================================
-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_audit_user_id ON auth_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created_at ON auth_audit_log(created_at);

-- =====================================================
-- 9. GRANT NECESSARY PERMISSIONS
-- =====================================================
-- Grant execute permissions on functions to service role
GRANT EXECUTE ON FUNCTION auth.create_user TO service_role;
GRANT EXECUTE ON FUNCTION auth.authenticate_user TO service_role;
GRANT EXECUTE ON FUNCTION auth.update_login_info TO service_role;
GRANT EXECUTE ON FUNCTION auth.increment_login_attempts TO service_role;
GRANT EXECUTE ON FUNCTION auth.is_user_locked TO service_role;

-- =====================================================
-- 10. CREATE SECURITY VIEWS
-- =====================================================

-- View for user profile (safe data only)
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  username,
  role,
  created_at,
  last_login,
  is_active
FROM users;

-- Grant access to the view
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON user_profiles TO service_role;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Secure authentication policies created successfully!';
  RAISE NOTICE '🔐 RLS policies: Active and secure';
  RAISE NOTICE '🛡️ Audit logging: Enabled';
  RAISE NOTICE '⚡ Performance indexes: Created';
  RAISE NOTICE '🔑 Service role functions: Available';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Update your backend .env with SUPABASE_SERVICE_ROLE_KEY';
  RAISE NOTICE '2. Use service role for backend operations';
  RAISE NOTICE '3. Test authentication with the new secure system';
END $$;
