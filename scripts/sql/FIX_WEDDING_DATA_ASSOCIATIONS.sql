-- Fix wedding data associations
-- Connect existing photos and wishes to the correct weddings

-- =====================================================
-- STEP 1: Check what data we have
-- =====================================================

-- Check photos (should have 'sister' column)
SELECT id, filename, sister, wedding_id, size 
FROM photos 
LIMIT 10;

-- Check wishes (should have 'recipient' column)
SELECT id, name, recipient, wedding_id 
FROM wishes 
LIMIT 10;

-- Check current weddings
SELECT id, wedding_code, bride_name 
FROM weddings 
ORDER BY wedding_date;

-- =====================================================
-- STEP 2: Get wedding IDs for mapping
-- =====================================================

-- Get Sreedevi & Vaishag wedding ID
SELECT id, wedding_code FROM weddings WHERE wedding_code = 'sreedevi-vaishag-2026';

-- Get Parvathy & Hari wedding ID  
SELECT id, wedding_code FROM weddings WHERE wedding_code = 'parvathy-hari-2026';

-- =====================================================
-- STEP 3: Associate photos with correct weddings
-- =====================================================

-- Update photos for Sreedevi (sister-b)
UPDATE photos 
SET wedding_id = (SELECT id FROM weddings WHERE wedding_code = 'sreedevi-vaishag-2026')
WHERE sister = 'sister-b' AND (wedding_id IS NULL OR wedding_id NOT IN (SELECT id FROM weddings));

-- Update photos for Parvathy (sister-a)
UPDATE photos 
SET wedding_id = (SELECT id FROM weddings WHERE wedding_code = 'parvathy-hari-2026')
WHERE sister = 'sister-a' AND (wedding_id IS NULL OR wedding_id NOT IN (SELECT id FROM weddings));

-- =====================================================
-- STEP 4: Associate wishes with correct weddings
-- =====================================================

-- Update wishes for Sreedevi
UPDATE wishes 
SET wedding_id = (SELECT id FROM weddings WHERE wedding_code = 'sreedevi-vaishag-2026')
WHERE recipient IN ('sister-b', 'sreedevi') AND (wedding_id IS NULL OR wedding_id NOT IN (SELECT id FROM weddings));

-- Update wishes for Parvathy
UPDATE wishes 
SET wedding_id = (SELECT id FROM weddings WHERE wedding_code = 'parvathy-hari-2026')
WHERE recipient IN ('sister-a', 'parvathy') AND (wedding_id IS NULL OR wedding_id NOT IN (SELECT id FROM weddings));

-- =====================================================
-- STEP 5: Verify the updates
-- =====================================================

-- Check photo counts per wedding
SELECT 
  w.wedding_code,
  w.bride_name,
  COUNT(p.id) as photo_count,
  COALESCE(SUM(p.size), 0) / 1048576.0 as storage_mb
FROM weddings w
LEFT JOIN photos p ON p.wedding_id = w.id
GROUP BY w.id, w.wedding_code, w.bride_name
ORDER BY w.wedding_date;

-- Check wish counts per wedding
SELECT 
  w.wedding_code,
  w.bride_name,
  COUNT(wi.id) as wish_count
FROM weddings w
LEFT JOIN wishes wi ON wi.wedding_id = w.id
GROUP BY w.id, w.wedding_code, w.bride_name
ORDER BY w.wedding_date;

-- =====================================================
-- DONE! ✅
-- =====================================================

