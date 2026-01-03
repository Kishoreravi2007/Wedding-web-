-- Add couple user to the database
INSERT INTO users (username, password, role, is_active)
VALUES ('phsv', '$2b$12$A0CbE4RfT2h.0xCyi1Oqn.KvD9xRgM/rM3BkgTYuKQcxi8zny5sW.', 'couple', true)
ON CONFLICT (username) DO UPDATE 
SET password = EXCLUDED.password,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
