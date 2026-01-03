-- Add 'couple' user to match user's apparent expectation
INSERT INTO users (username, password, role, is_active)
VALUES ('couple', '$2b$12$EVeLjGNW3Ye0WeAFyPmiEuPZgi73xej6hv7dhZinS4FyC8mHqHWju', 'couple', true)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
