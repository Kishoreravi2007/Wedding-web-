-- Diagnostic and Fix Script
-- Let's check what data actually exists and fix associations

-- =====================================================
-- STEP 1: Check what photos exist
-- =====================================================
SELECT 
    COUNT(*) as total_photos,
    sister,
    wedding_id
FROM photos
GROUP BY sister, wedding_id;

-- Show sample photos
SELECT id, filename, sister, wedding_id, size
FROM photos
LIMIT 5;

-- =====================================================
-- STEP 2: Check what wishes exist
-- =====================================================
SELECT 
    COUNT(*) as total_wishes,
    recipient,
    wedding_id
FROM wishes
GROUP BY recipient, wedding_id;

-- Show sample wishes
SELECT id, name, recipient, wedding_id
FROM wishes
LIMIT 5;

-- =====================================================
-- STEP 3: Get the wedding IDs we need to link to
-- =====================================================
SELECT 
    id,
    wedding_code,
    bride_name
FROM weddings
ORDER BY wedding_date;

-- =====================================================
-- STEP 4: Now let's fix the associations
-- =====================================================

-- First, let's see if photos have the sister column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'photos' 
  AND column_name IN ('sister', 'wedding_id');

-- Check wishes columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'wishes' 
  AND column_name IN ('recipient', 'wedding_id');

-- =====================================================
-- STEP 5: Update photos to link to weddings
-- =====================================================

-- Link sister-a photos to Parvathy & Hari
UPDATE photos 
SET wedding_id = (
    SELECT id FROM weddings 
    WHERE wedding_code = 'parvathy-hari-2026'
)
WHERE sister = 'sister-a';

-- Link sister-b photos to Sreedevi & Vaishag
UPDATE photos 
SET wedding_id = (
    SELECT id FROM weddings 
    WHERE wedding_code = 'sreedevi-vaishag-2026'
)
WHERE sister = 'sister-b';

-- =====================================================
-- STEP 6: Update wishes to link to weddings
-- =====================================================

-- Link wishes for Parvathy (sister-a, parvathy, both)
UPDATE wishes 
SET wedding_id = (
    SELECT id FROM weddings 
    WHERE wedding_code = 'parvathy-hari-2026'
)
WHERE recipient IN ('sister-a', 'parvathy', 'both');

-- Link wishes for Sreedevi (sister-b, sreedevi, both)
UPDATE wishes 
SET wedding_id = (
    SELECT id FROM weddings 
    WHERE wedding_code = 'sreedevi-vaishag-2026'
)
WHERE recipient IN ('sister-b', 'sreedevi', 'both');

-- =====================================================
-- STEP 7: Verify the final results
-- =====================================================

-- Photo counts and storage per wedding
SELECT 
    w.wedding_code,
    w.bride_name,
    COUNT(DISTINCT p.id) as photo_count,
    ROUND(COALESCE(SUM(p.size), 0)::numeric / 1048576.0, 2) as storage_mb
FROM weddings w
LEFT JOIN photos p ON p.wedding_id = w.id
GROUP BY w.id, w.wedding_code, w.bride_name
ORDER BY w.wedding_date;

-- Wish counts per wedding
SELECT 
    w.wedding_code,
    w.bride_name,
    COUNT(wi.id) as wish_count
FROM weddings w
LEFT JOIN wishes wi ON wi.wedding_id = w.id
GROUP BY w.id, w.wedding_code, w.bride_name
ORDER BY w.wedding_date;

-- People counts per wedding (if people table has wedding_id)
SELECT 
    w.wedding_code,
    w.bride_name,
    COUNT(pe.id) as people_count
FROM weddings w
LEFT JOIN people pe ON pe.wedding_id = w.id
GROUP BY w.id, w.wedding_code, w.bride_name
ORDER BY w.wedding_date;

-- =====================================================
-- DONE! ✅
-- You should now see the actual counts
-- =====================================================

