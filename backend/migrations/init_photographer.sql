-- Validated for gcp_schema.sql
-- Password: "photo123"
INSERT INTO users (username, password, role, is_active, created_at)
VALUES (
  'photographer',
  '$2a$10$rZ5zCxHvEQ7qKX8yF9F5/.vYmxK7xEQGX8QGmQzH2nJ8Yn5kK/jXO',
  'photographer',
  true,
  NOW()
)
ON CONFLICT (username) DO UPDATE 
SET 
  password = EXCLUDED.password;
