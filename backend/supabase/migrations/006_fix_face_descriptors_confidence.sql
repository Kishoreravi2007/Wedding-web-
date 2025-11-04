-- Fix missing confidence column in face_descriptors table
-- This migration adds the confidence column if it doesn't exist

-- Check if confidence column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'face_descriptors' 
        AND column_name = 'confidence'
    ) THEN
        ALTER TABLE face_descriptors 
        ADD COLUMN confidence REAL CHECK (confidence >= 0 AND confidence <= 1);
        
        COMMENT ON COLUMN face_descriptors.confidence IS 'Confidence score of the face detection (0-1)';
        
        RAISE NOTICE 'Added confidence column to face_descriptors table';
    ELSE
        RAISE NOTICE 'Confidence column already exists in face_descriptors table';
    END IF;
END $$;

-- Also ensure photo_faces has confidence column
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'photo_faces' 
        AND column_name = 'confidence'
    ) THEN
        ALTER TABLE photo_faces 
        ADD COLUMN confidence REAL CHECK (confidence >= 0 AND confidence <= 1);
        
        COMMENT ON COLUMN photo_faces.confidence IS 'Confidence score of the face detection (0-1)';
        
        RAISE NOTICE 'Added confidence column to photo_faces table';
    ELSE
        RAISE NOTICE 'Confidence column already exists in photo_faces table';
    END IF;
END $$;

-- Verify the changes
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('face_descriptors', 'photo_faces')
AND column_name = 'confidence'
ORDER BY table_name;

