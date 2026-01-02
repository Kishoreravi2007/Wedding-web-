# Supabase Environment Variables Setup

## Required Environment Variables

### Backend Environment Variables
Create or update `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Server Configuration
PORT=5001
NODE_ENV=development

# JWT Secret for Authentication
JWT_SECRET=your-secret-key-here

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### Frontend Environment Variables
Create or update `frontend/.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Backend API URL
VITE_API_BASE_URL=http://localhost:5001
VITE_BACKEND_URL=http://localhost:5001
```

## How to Get Supabase Credentials

1. **Go to Supabase Dashboard:**
   - Visit https://app.supabase.com
   - Select your project

2. **Get Project URL:**
   - Go to Settings → API
   - Copy "Project URL"
   - This is your `SUPABASE_URL`

3. **Get Anon Key:**
   - Go to Settings → API
   - Copy "anon public" key
   - This is your `SUPABASE_ANON_KEY`

## Supabase Storage Bucket Setup

### Create Storage Bucket

1. **Go to Storage in Supabase Dashboard**
2. **Click "New Bucket"**
3. **Name it:** `wedding-photos`
4. **Set to Public** (or configure RLS policies)

### Configure Public Access (Option 1 - Simple)

1. Click on `wedding-photos` bucket
2. Click "Policies"
3. Create new policy:
   - **Policy Name:** Public Access
   - **Operation:** SELECT, INSERT, UPDATE, DELETE
   - **Policy Definition:** `true` (allows all)

### Configure RLS Policies (Option 2 - Secure)

For authenticated uploads and public reads:

```sql
-- Allow public reads
CREATE POLICY "Public photos are viewable by everyone"
ON storage.objects FOR SELECT
USING ( bucket_id = 'wedding-photos' );

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'wedding-photos' 
  AND auth.role() = 'authenticated'
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'wedding-photos' 
  AND auth.role() = 'authenticated'
);
```

## Database Schema

Make sure your Supabase database has the required tables. Run these migrations if needed:

```sql
-- Photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  size INTEGER NOT NULL,
  mimetype TEXT NOT NULL,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b')),
  title TEXT,
  description TEXT,
  event_type TEXT,
  tags TEXT[] DEFAULT '{}',
  storage_provider TEXT DEFAULT 'supabase',
  photographer_id UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- People table (for face recognition)
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('bride', 'groom', 'family', 'friend', 'vendor', 'other')),
  avatar_url TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Face descriptors table
CREATE TABLE IF NOT EXISTS face_descriptors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  descriptor FLOAT8[],
  confidence FLOAT8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo faces table (junction table with bounding boxes)
CREATE TABLE IF NOT EXISTS photo_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE,
  bounding_box JSONB NOT NULL,
  confidence FLOAT8,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_photos_sister ON photos(sister);
CREATE INDEX IF NOT EXISTS idx_photos_event_type ON photos(event_type);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo_id ON photo_faces(photo_id);
CREATE INDEX IF NOT EXISTS idx_photo_faces_person_id ON photo_faces(person_id);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_person_id ON face_descriptors(person_id);
CREATE INDEX IF NOT EXISTS idx_face_descriptors_photo_id ON face_descriptors(photo_id);
```

## Verification Steps

### 1. Test Backend Connection
```bash
cd backend
node -e "const {supabase} = require('./lib/supabase'); console.log('Supabase client:', supabase ? 'OK' : 'FAILED')"
```

### 2. Test Frontend Connection
```bash
cd frontend
npm run dev
# Open browser console and check for Supabase initialization logs
```

### 3. Test Storage Upload
1. Login to photographer portal
2. Upload a test photo
3. Check Supabase Dashboard → Storage → wedding-photos
4. Verify file appears in bucket

### 4. Test Database Write
1. After uploading a photo
2. Check Supabase Dashboard → Table Editor → photos
3. Verify new row appears with photo metadata

## Troubleshooting

### Backend says "Supabase credentials not found"
- Check `backend/.env` file exists
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Restart backend server after adding env variables

### Frontend upload fails with 401
- Check authentication token is present
- Verify backend is running on correct port
- Check CORS settings in backend

### Photos not appearing in gallery
- Verify storage bucket is public or has correct RLS policies
- Check photo URLs in database match storage bucket URLs
- Verify `public_url` column in photos table is populated

### Storage upload fails with 403
- Check storage bucket RLS policies
- Verify user is authenticated when uploading
- Check bucket name is exactly `wedding-photos`

## Firebase Environment Variables (For Future Migration)

Keep these handy for when you switch back to Firebase:

```env
# Backend
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
# Service account JSON file should be in backend folder

# Frontend
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

**Quick Setup Checklist:**
- [ ] Create Supabase project
- [ ] Get project URL and anon key
- [ ] Create `wedding-photos` storage bucket
- [ ] Configure bucket policies (public or RLS)
- [ ] Run database migrations
- [ ] Set environment variables in backend/.env
- [ ] Set environment variables in frontend/.env
- [ ] Restart backend and frontend servers
- [ ] Test photo upload
- [ ] Verify photos appear in gallery

**Status:** Ready to use with Supabase! 🚀

