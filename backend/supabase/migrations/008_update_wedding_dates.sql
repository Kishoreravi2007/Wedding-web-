-- =====================================================
-- UPDATE WEDDING DATES
-- Simple update script to correct the wedding dates
-- =====================================================

-- Update Sreedevi & Vaishag wedding date to January 11, 2026
UPDATE weddings 
SET wedding_date = '2026-01-11'
WHERE wedding_code = 'sreedevi-vaishag-2026';

-- Update Paravthy & Hari wedding date to January 04, 2026
UPDATE weddings 
SET wedding_date = '2026-01-04'
WHERE wedding_code = 'paravthy-hari-2026';

-- Verify the updates
SELECT 
  wedding_code,
  bride_name,
  groom_name,
  wedding_date,
  wedding_month,
  status
FROM weddings
WHERE wedding_code IN ('sreedevi-vaishag-2026', 'paravthy-hari-2026')
ORDER BY wedding_date;

