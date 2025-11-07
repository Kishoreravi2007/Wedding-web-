-- Remove legacy wedding entries
-- Keep only the 2 real January 2026 weddings

-- First, let's see what we have
SELECT wedding_code, bride_name, wedding_month, status 
FROM weddings 
ORDER BY wedding_date DESC;

-- Delete the legacy entries
DELETE FROM weddings
WHERE wedding_code IN ('sister-a-legacy', 'sister-b-legacy');

-- Verify - should now show only 2 weddings
SELECT wedding_code, bride_name, groom_name, wedding_month, status 
FROM weddings 
ORDER BY wedding_date;

-- You should now see only:
-- 1. parvathy-hari-2026 (January 04, 2026)
-- 2. sreedevi-vaishag-2026 (January 11, 2026)

