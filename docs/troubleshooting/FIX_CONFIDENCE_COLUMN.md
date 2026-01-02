# 🔧 Fix Missing Confidence Column

## Problem
Face descriptors are failing to store with error:
```
Could not find the 'confidence' column of 'face_descriptors' in the schema cache
```

This means your Supabase `face_descriptors` table is missing the `confidence` column.

## ✅ Quick Fix - Run SQL Migration

### Option 1: Run Migration in Supabase (Recommended)

1. **Go to your Supabase Dashboard**
   - Open https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "+ New Query"

3. **Copy and paste this SQL:**

```sql
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
```

4. **Click "Run" (or press Ctrl+Enter)**

5. **Verify Success**
   You should see output like:
   ```
   Added confidence column to face_descriptors table
   Added confidence column to photo_faces table
   
   table_name        | column_name | data_type | is_nullable
   ------------------|-------------|-----------|------------
   face_descriptors  | confidence  | real      | YES
   photo_faces       | confidence  | real      | YES
   ```

### Option 2: Check Current Schema First

If you want to see what columns currently exist:

```sql
-- Check face_descriptors table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'face_descriptors'
ORDER BY ordinal_position;

-- Check photo_faces table schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'photo_faces'
ORDER BY ordinal_position;
```

## 🔄 After Running the Migration

1. **Refresh Schema Cache** (if needed)
   - In Supabase dashboard, go to "Database" → "Tables"
   - Your changes should appear automatically
   - If not, wait 30 seconds and refresh the page

2. **Restart Backend** (optional)
   - Render should automatically pick up the database changes
   - Or manually restart from Render dashboard

3. **Reprocess Photos**
   - Go back to photographer portal
   - Click "Process Faces" tab
   - Click "Process 18 Photos" again
   - Should work now! ✅

## 🧪 Test the Fix

After running the migration, test with curl:

```bash
# Get a token first (from browser localStorage or login)
TOKEN="your_token_here"

# Test storing a face descriptor
curl -X POST https://backend-bf2g.onrender.com/api/process-faces/store-descriptors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "photo_id": "your_photo_id",
    "faces": [{
      "descriptor": [0.1, 0.2, 0.3, ...],
      "confidence": 0.95,
      "boundingBox": {"x": 100, "y": 100, "width": 200, "height": 200}
    }]
  }'
```

Expected response:
```json
{
  "message": "Successfully stored 1 face descriptor(s)",
  "photo_id": "...",
  "faces_stored": 1,
  "faces": [...]
}
```

## 🔍 Why Did This Happen?

The schema migration files exist in your codebase (`backend/supabase/migrations/001_initial_schema.sql`), but they weren't applied to your actual Supabase database. This can happen if:

1. The table was created manually before running migrations
2. The migrations were never executed in Supabase
3. An older version of the schema was used

## 📋 Complete Database Schema

For reference, here's what the complete schema should look like:

### face_descriptors table
```sql
CREATE TABLE face_descriptors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor REAL[] NOT NULL,           -- 128-dimensional face vector
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),  -- ✅ This was missing!
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### photo_faces table
```sql
CREATE TABLE photo_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE,
  bounding_box JSONB NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 1),  -- ✅ Should also exist
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 Expected Outcome

After running the SQL migration:
- ✅ `face_descriptors.confidence` column exists
- ✅ `photo_faces.confidence` column exists
- ✅ Face processing stores descriptors successfully
- ✅ Photo booth can match faces
- ✅ No more PGRST204 errors

---

**Run the SQL in Supabase now, then reprocess your photos!** 🚀

