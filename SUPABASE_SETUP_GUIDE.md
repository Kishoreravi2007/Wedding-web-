# 🗄️ Supabase Backend Migration Guide

## Overview

This guide will help you migrate your wedding website backend from local filesystem storage to Supabase, including:
- Photo storage in Supabase Storage
- Photo metadata in Supabase Database
- Face detection data
- Guest mappings

> **New (Call Scheduling):** Run `SUPABASE_CALL_SCHEDULES_SETUP.sql` in the Supabase SQL Editor to create the `call_schedules` table used by the “Schedule a Call” form on the pricing page.

## Prerequisites

✅ Supabase account (free tier works fine)  
✅ Node.js and npm installed  
✅ Your existing wedding photos in `uploads/wedding_gallery/`

---

## Step 1: Set Up Supabase Project

### 1.1 Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `wedding-website`
   - **Database Password**: (choose a strong password - save it!)
   - **Region**: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 1.2 Get Your API Credentials

1. In your project dashboard, click "Settings" (gear icon)
2. Go to "API" section
3. Copy and save:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this SECRET!)

---

## Step 2: Create Supabase Database Schema

### 2.1 Create Tables

Go to **SQL Editor** in your Supabase dashboard and run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Photos table
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  size BIGINT,
  mimetype TEXT,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b')),
  title TEXT,
  description TEXT,
  event_type TEXT,
  tags TEXT[] DEFAULT '{}',
  storage_provider TEXT DEFAULT 'supabase',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_photos_sister ON photos(sister);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX idx_photos_file_path ON photos(file_path);

-- People/Guests table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  role TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  guest_id TEXT UNIQUE, -- e.g., "Guest_001"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Face descriptors table (stores face embeddings)
CREATE TABLE face_descriptors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor FLOAT8[] NOT NULL, -- 128D or 512D face embedding
  source_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo faces table (links faces to photos)
CREATE TABLE photo_faces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE SET NULL,
  bounding_box JSONB, -- {x, y, width, height}
  confidence FLOAT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_photo_faces_photo_id ON photo_faces(photo_id);
CREATE INDEX idx_photo_faces_person_id ON photo_faces(person_id);
CREATE INDEX idx_face_descriptors_person_id ON face_descriptors(person_id);

-- Enable Row Level Security (RLS)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_faces ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public photos are viewable by everyone"
  ON photos FOR SELECT
  USING (true);

CREATE POLICY "Public people are viewable by everyone"
  ON people FOR SELECT
  USING (true);

CREATE POLICY "Public face_descriptors are viewable by everyone"
  ON face_descriptors FOR SELECT
  USING (true);

CREATE POLICY "Public photo_faces are viewable by everyone"
  ON photo_faces FOR SELECT
  USING (true);

-- Create policies for authenticated users (photographers)
CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE
  USING (auth.role() = 'authenticated');

-- Guest mapping table (for face recognition)
CREATE TABLE guest_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id TEXT NOT NULL,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b')),
  photo_paths TEXT[] DEFAULT '{}',
  reference_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(guest_id, sister)
);

CREATE INDEX idx_guest_mappings_sister ON guest_mappings(sister);
CREATE INDEX idx_guest_mappings_guest_id ON guest_mappings(guest_id);

ALTER TABLE guest_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public guest_mappings are viewable by everyone"
  ON guest_mappings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage guest_mappings"
  ON guest_mappings FOR ALL
  USING (auth.role() = 'authenticated');
```

### 2.2 Verify Tables Created

1. Go to **Table Editor** in Supabase dashboard
2. You should see: `photos`, `people`, `face_descriptors`, `photo_faces`, `guest_mappings`

---

## Step 3: Create Supabase Storage Bucket

### 3.1 Create Wedding Photos Bucket

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Fill in:
   - **Name**: `wedding-photos`
   - **Public bucket**: ✅ **Enable** (so guests can view photos)
4. Click "Create bucket"

### 3.2 Set Storage Policies

In the **Policies** tab for `wedding-photos` bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wedding-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wedding-photos' 
  AND auth.role() = 'authenticated'
);
```

---

## Step 4: Configure Your Backend

### 4.1 Create Environment Variables

Create `backend/.env` file:

```bash
# Copy from .env.example
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your Supabase credentials:

```env
PORT=5002
NODE_ENV=development

BACKEND_URL=http://localhost:5002
FRONTEND_URL=http://localhost:3000

# Supabase Configuration (REPLACE WITH YOUR VALUES)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key

# Firebase (if using)
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json
```

### 4.2 Update Frontend Environment

Create/update `frontend/.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key

# API Configuration
VITE_API_URL=http://localhost:5002

# Firebase (if using)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Step 5: Migrate Existing Photos to Supabase

### 5.1 Run Migration Script

We'll create a script to migrate your existing 15 photos from local storage to Supabase:

```bash
cd backend
node migrate-to-supabase.js
```

This will:
1. ✅ Read all photos from `uploads/wedding_gallery/`
2. ✅ Upload each photo to Supabase Storage
3. ✅ Create metadata records in Supabase Database
4. ✅ Preserve sister associations (sister-a, sister-b)
5. ✅ Generate public URLs for each photo

### 5.2 Migration Progress

You'll see output like:
```
🚀 Starting migration to Supabase...
📂 Found 15 photos to migrate

Sister B:
  ✅ 1.jpeg uploaded
  ✅ 2.jpeg uploaded
  ...
  ✅ 15.jpeg uploaded

✅ Migration complete!
  - Migrated: 15 photos
  - Failed: 0 photos
  - Sister A: 0 photos
  - Sister B: 15 photos
```

### 5.3 Verify Migration

1. Go to **Storage** > **wedding-photos** in Supabase
2. You should see folders: `sister-a/`, `sister-b/`
3. Go to **Table Editor** > **photos**
4. You should see 15 photo records

---

## Step 6: Update Your Code to Use Supabase

### 6.1 Switch Upload Endpoint

The system will automatically use Supabase in production:

```typescript
// frontend/src/services/fileUploadService.ts
const uploadEndpoint = import.meta.env.PROD 
  ? `${API_BASE_URL}/api/photos`        // Supabase (production)
  : `${API_BASE_URL}/api/photos-local`; // Local (development)
```

### 6.2 For Production, Force Supabase

Update `frontend/src/services/fileUploadService.ts`:

```typescript
// Force Supabase for all environments
const uploadEndpoint = `${API_BASE_URL}/api/photos`; // Always use Supabase
```

---

## Step 7: Migrate Face Detection Data

### 7.1 Run Face Detection Migration

```bash
cd backend
node migrate-face-data.js
```

This will:
1. ✅ Read `guest_mapping_sister_a.json` and `guest_mapping_sister_b.json`
2. ✅ Create guest records in `people` table
3. ✅ Upload reference images to Supabase Storage
4. ✅ Create `guest_mappings` records

### 7.2 Verify Face Data

1. Go to **Table Editor** > **people** in Supabase
2. You should see guest records (Guest_001, Guest_002, etc.)
3. Go to **Table Editor** > **guest_mappings**
4. You should see mappings for each guest

---

## Step 8: Test the System

### 8.1 Start Servers

```bash
./start-all.sh
```

### 8.2 Test Photo Upload

1. Login: http://localhost:3000/photographer-login
2. Upload a test photo
3. Verify it appears in:
   - Supabase Storage (dashboard)
   - Supabase Database (photos table)
   - Frontend gallery

### 8.3 Test Photo Gallery

1. Visit: http://localhost:3000/sreedevi/gallery
2. You should see all 15 photos from Supabase
3. Test download functionality
4. Test delete functionality (if logged in)

### 8.4 Test Face Detection

1. Visit: http://localhost:3000/face-admin
2. You should see all detected guests
3. Upload a photo and verify auto face detection works

---

## Step 9: Deploy to Production

### 9.1 Update Production Environment Variables

On your hosting platform (Render, Vercel, Netlify):

**Backend Environment Variables:**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.netlify.app
```

**Frontend Environment Variables:**
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-backend.onrender.com
```

### 9.2 Deploy

```bash
git add .
git commit -m "Migrate to Supabase storage"
git push
```

---

## Benefits of Supabase Storage

✅ **Persistent Storage**: Photos survive server restarts  
✅ **CDN**: Fast photo delivery worldwide  
✅ **Scalable**: Handle thousands of photos  
✅ **Backup**: Automatic backups  
✅ **Security**: Row-level security policies  
✅ **Free Tier**: 1GB storage + 2GB bandwidth/month  

---

## Troubleshooting

### Photos Not Uploading

**Check:**
1. Environment variables are set correctly
2. Supabase bucket exists and is public
3. Storage policies are configured
4. Check browser console for errors

**Fix:**
```bash
# Verify Supabase connection
node backend/test-supabase-connection.js
```

### Photos Not Displaying

**Check:**
1. Public URLs are correct format
2. Storage bucket is public
3. CORS is configured

**Fix:**
Add CORS policy in Supabase dashboard under Storage settings.

### Migration Script Fails

**Check:**
1. `.env` file has correct Supabase credentials
2. Tables are created in database
3. Storage bucket exists

**Fix:**
```bash
# Run migration with verbose logging
DEBUG=* node migrate-to-supabase.js
```

---

## Cost Estimate

**Supabase Free Tier:**
- Storage: 1GB
- Bandwidth: 2GB/month
- Database: 500MB
- API requests: Unlimited

**For your wedding (estimated):**
- 500 photos × 2MB average = 1GB storage ✅ **FREE**
- 100 guests × 10 views each = 20GB bandwidth ❌ **$0.09/GB ≈ $1.80/month**

**Recommendation**: Free tier is perfect for testing. Upgrade to Pro ($25/month) if needed for the wedding.

---

## Next Steps

1. ✅ Create Supabase project
2. ✅ Run database schema SQL
3. ✅ Create storage bucket
4. ✅ Configure environment variables
5. ✅ Run migration scripts
6. ✅ Test the system
7. ✅ Deploy to production

**You're now using professional cloud storage for your wedding website!** 🎉


