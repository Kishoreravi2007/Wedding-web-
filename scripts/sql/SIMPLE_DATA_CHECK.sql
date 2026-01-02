-- Simple check to see what data actually exists
-- Run this to see if you have any photos, wishes, or people

-- Check photos
SELECT 
    'PHOTOS' as table_name,
    COUNT(*) as total_count
FROM photos;

-- Check wishes
SELECT 
    'WISHES' as table_name,
    COUNT(*) as total_count
FROM wishes;

-- Check people
SELECT 
    'PEOPLE' as table_name,
    COUNT(*) as total_count
FROM people;

-- Check weddings
SELECT 
    'WEDDINGS' as table_name,
    COUNT(*) as total_count
FROM weddings;

-- If photos exist, show sample data
SELECT 'Sample Photos:' as info;
SELECT id, filename, sister, wedding_id 
FROM photos 
LIMIT 3;

-- If wishes exist, show sample data
SELECT 'Sample Wishes:' as info;
SELECT id, name, recipient, wedding_id 
FROM wishes 
LIMIT 3;

-- Show current wedding data
SELECT 'Current Weddings:' as info;
SELECT id, wedding_code, bride_name 
FROM weddings;

