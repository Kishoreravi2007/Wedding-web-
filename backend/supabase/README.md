# Supabase Database Migrations

This directory contains SQL migration scripts for the wedding web application's Supabase database.

## Prerequisites

1. Create a Supabase project at https://supabase.com
2. Note your project URL and API keys
3. Install Supabase CLI (optional): `npm install -g supabase`

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for first-time setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `migrations/001_initial_schema.sql`
4. Copy and paste the entire content
5. Click **Run** to execute the migration
6. Verify tables created in **Table Editor**

### Option 2: Using Supabase CLI

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Using Node.js Script

```bash
# Set environment variables
export SUPABASE_URL=your-supabase-url
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run migration script
node supabase/run-migration.js
```

## Storage Setup

After running the database migrations, set up the storage bucket:

### 1. Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Name: `wedding-photos`
4. Public bucket: **Yes**
5. File size limit: `10485760` (10MB)
6. Allowed MIME types: `image/jpeg,image/png,image/webp,image/gif`

### 2. Set Bucket Policies

Run this SQL in the SQL Editor:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-photos');

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wedding-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wedding-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Database Schema Overview

### Tables

1. **photos** - Main photo metadata storage
2. **people** - People who can be recognized in photos
3. **face_descriptors** - Face recognition data (128-dimensional vectors)
4. **photo_faces** - Junction table linking faces to photos

### Views

1. **photos_with_faces** - Photos with face count and people names
2. **people_with_stats** - People with photo appearances and descriptor counts

### Indexes

All tables have appropriate indexes for:
- Fast lookups by sister, event type
- Efficient tag searches using GIN index
- Quick person and face queries

### Row Level Security (RLS)

- **Photos**: Public read, authenticated write, owner update/delete
- **People**: Public read, authenticated write
- **Face descriptors**: Authenticated access only
- **Photo faces**: Public read, authenticated write

## Environment Variables

Add these to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Verification

After running migrations, verify the setup:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';

-- Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Sample data check
SELECT * FROM people;
```

## Rollback

To rollback the migration:

```sql
-- Drop views
DROP VIEW IF EXISTS photos_with_faces CASCADE;
DROP VIEW IF EXISTS people_with_stats CASCADE;

-- Drop tables (careful - this will delete all data!)
DROP TABLE IF EXISTS photo_faces CASCADE;
DROP TABLE IF EXISTS face_descriptors CASCADE;
DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS photos CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
```

## Troubleshooting

### Issue: RLS policies not working

**Solution**: Ensure you're using the correct API key:
- Use `SUPABASE_ANON_KEY` for client-side requests
- Use `SUPABASE_SERVICE_ROLE_KEY` for server-side admin requests

### Issue: Foreign key constraint violations

**Solution**: Ensure tables are created in the correct order:
1. photos
2. people
3. face_descriptors
4. photo_faces

### Issue: Storage upload fails

**Solution**: 
- Check bucket name is exactly `wedding-photos`
- Verify storage policies are created
- Check file size doesn't exceed 10MB

## Next Steps

After successful migration:

1. Test photo upload via API
2. Verify face detection integration
3. Test face recognition queries
4. Set up database backups
5. Configure monitoring and alerts

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review the main refactoring plan: `SUPABASE_REFACTORING_PLAN.md`

