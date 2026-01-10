-- Unlock photographer account
-- Reset login attempts and clear lock timestamp
UPDATE users 
SET 
  login_attempts = 0,
  locked_until = NULL,
  password = '$2a$10$rZ5zCxHvEQ7qKX8yF9F5/.vYmxK7xEQGX8QGmQzH2nJ8Yn5kK/jXO'
WHERE username = 'photographer';

-- Verify the update
SELECT id, username, role, is_active, login_attempts, locked_until 
FROM users 
WHERE username = 'photographer';
