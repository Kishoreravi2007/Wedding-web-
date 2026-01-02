-- Remove duplicate wedding entry
-- Keep the one with venue "Royal Gardens", delete the other

-- First, let's see which ones we have
SELECT id, wedding_code, bride_name, venue, created_at 
FROM weddings 
WHERE wedding_code = 'paravthy-hari-2026'
ORDER BY created_at;

-- Delete the duplicate (keep the newer one with venue info)
-- This will delete the oldest entry with that wedding_code
DELETE FROM weddings
WHERE id IN (
  SELECT id 
  FROM weddings 
  WHERE wedding_code = 'paravthy-hari-2026'
  ORDER BY created_at ASC
  LIMIT 1
);

-- Verify - should now show only 1 entry
SELECT id, wedding_code, bride_name, groom_name, venue 
FROM weddings 
WHERE wedding_code = 'paravthy-hari-2026';

-- Check all weddings
SELECT wedding_code, bride_name, groom_name, wedding_month, status 
FROM weddings 
ORDER BY wedding_date DESC;

