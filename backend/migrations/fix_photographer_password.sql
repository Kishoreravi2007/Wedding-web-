-- Fix photographer password with correct bcrypt hash
UPDATE users 
SET 
  password = '$2b$10$wG0PhPqHWkRZlP0xspfb3eB1IaK11AuwZhm1DhHxorbY3zHx.z0hy',
  login_attempts = 0,
  locked_until = NULL
WHERE username = 'photographer';

-- Verify the update
SELECT id, username, role, is_active, login_attempts, locked_until 
FROM users 
WHERE username = 'photographer';
