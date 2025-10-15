# Setup Guide: Supabase Migration with Face Recognition

This guide walks you through setting up the refactored wedding web application with Supabase for photo storage and face recognition.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Testing](#testing)
6. [Migration from Firebase](#migration-from-firebase)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- Node.js >= 16.x
- npm or pnpm
- Git
- A Supabase account (free tier is sufficient)
- A Firebase project (for wishes only)

### Required Skills

- Basic understanding of REST APIs
- Familiarity with React and Node.js
- Basic SQL knowledge (helpful but not required)

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **New Project**
4. Fill in project details:
   - Name: `wedding-web` (or your choice)
   - Database Password: Generate a strong password and save it
   - Region: Choose closest to your users
5. Wait for project to be created (~2 minutes)

### Step 2: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Note down:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (safe to use in frontend)
   - **service_role key** (keep secret, backend only)

### Step 3: Run Database Migrations

**Option A: Using Supabase Dashboard (Recommended)**

1. Go to **SQL Editor** in Supabase dashboard
2. Open `backend/supabase/migrations/001_initial_schema.sql`
3. Copy the entire content
4. Paste into SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify tables created in **Table Editor**:
   - ✓ photos
   - ✓ people
   - ✓ face_descriptors
   - ✓ photo_faces

**Option B: Using Migration Script**

```bash
cd backend
node supabase/run-migration.js
# Follow instructions printed by the script
```

### Step 4: Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **New bucket**
3. Configure:
   - **Name**: `wedding-photos`
   - **Public bucket**: Yes ✓
   - **File size limit**: 10485760 (10MB)
4. Click **Create bucket**

### Step 5: Set Storage Policies

Go to SQL Editor and run:

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
USING (bucket_id = 'wedding-photos');
```

### Step 6: Verify Setup

In SQL Editor, run:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check storage bucket
SELECT * FROM storage.buckets 
WHERE name = 'wedding-photos';

-- Sample data
SELECT * FROM people;
```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
# or
pnpm install
```

### Step 2: Configure Environment

1. Copy environment template:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` file:
   ```env
   # Firebase (wishes only)
   FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./your-firebase-key.json
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com

   # Supabase (photos & faces)
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Server
   PORT=5000
   JWT_SECRET=your-secret-key-change-this
   ```

### Step 3: Replace Server Files

**⚠️ IMPORTANT: Backup your current files first!**

```bash
# Backup current files
cp server.js server.js.backup
cp photos.js photos.js.backup

# Replace with new versions
mv server-new.js server.js
mv photos-new.js photos.js

# The faces.js is new, no replacement needed
```

### Step 4: Start Backend

```bash
npm start
# or for development with auto-reload
npm run dev
```

You should see:

```
✅ Firebase initialized successfully (for wishes)
✅ Supabase initialized successfully
🎉 Wedding Web Application Server Started
📍 Server running on port 5000
```

### Step 5: Test Backend

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {
#   "status": "healthy",
#   "services": {
#     "firebase": { "status": "connected" },
#     "supabase": { "status": "connected" }
#   }
# }
```

---

## Frontend Setup

### Step 1: Install Dependencies

```bash
cd frontend
npm install @supabase/supabase-js
# or
pnpm add @supabase/supabase-js
```

### Step 2: Configure Environment

1. Copy environment template:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local`:
   ```env
   # Firebase (wishes only)
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

   # Supabase (photos & faces)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key

   # API
   VITE_API_BASE_URL=http://localhost:5000

   # Features
   VITE_ENABLE_FACE_RECOGNITION=true
   ```

### Step 3: Replace Component Files

**⚠️ Backup first!**

```bash
# Backup
cp src/components/PhotoUpload.tsx src/components/PhotoUpload.tsx.backup

# Replace
mv src/components/PhotoUpload-refactored.tsx src/components/PhotoUpload.tsx
```

### Step 4: Start Frontend

```bash
npm run dev
```

Access at: http://localhost:5173

---

## Testing

### Test 1: Backend Health Check

```bash
curl http://localhost:5000/health
```

Expected: Status 200 with both Firebase and Supabase connected.

### Test 2: People Management

```bash
# Create a person
curl -X POST http://localhost:5000/api/faces/people \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Person",
    "role": "family",
    "sister": "both"
  }'

# List people
curl http://localhost:5000/api/faces/people \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Photo Upload (Frontend)

1. Navigate to photographer dashboard
2. Login with credentials
3. Go to upload page
4. Select a photo with faces
5. Verify:
   - ✓ Face detection runs automatically
   - ✓ Detected faces show in UI
   - ✓ Can assign faces to people
   - ✓ Upload succeeds
   - ✓ Photo appears in gallery

### Test 4: Photo Gallery (Frontend)

1. Navigate to photo gallery
2. Verify:
   - ✓ Photos load from Supabase
   - ✓ Face tags visible on photos
   - ✓ Can filter by person
   - ✓ Can search photos

### Test 5: Face Recognition

1. Upload a photo with a known person
2. Upload another photo with the same person
3. Verify:
   - ✓ Same person detected automatically
   - ✓ Face matches show in UI
   - ✓ Can view all photos of a person

---

## Migration from Firebase

If you have existing photos in Firebase:

### Step 1: Export Firebase Photos

```javascript
// Run this script in Node.js with Firebase Admin SDK
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp(/* your config */);
const db = admin.firestore();
const bucket = admin.storage().bucket();

async function exportPhotos() {
  const photos = [];
  const snapshot = await db.collection('photos').get();
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Download photo
    const file = bucket.file(data.filePath);
    const [buffer] = await file.download();
    
    photos.push({
      metadata: data,
      buffer: buffer
    });
  }
  
  // Save to file
  fs.writeFileSync('firebase-export.json', JSON.stringify(
    photos.map(p => p.metadata), null, 2
  ));
  
  console.log(`Exported ${photos.length} photos`);
}

exportPhotos();
```

### Step 2: Import to Supabase

```javascript
// Import script
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function importPhotos() {
  const photos = JSON.parse(fs.readFileSync('firebase-export.json'));
  
  for (const photo of photos) {
    // Upload to Supabase Storage
    const { data: uploadData, error } = await supabase.storage
      .from('wedding-photos')
      .upload(photo.filePath, photo.buffer);
    
    if (error) {
      console.error('Upload error:', error);
      continue;
    }
    
    // Insert metadata
    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        filename: photo.filename,
        file_path: photo.filePath,
        public_url: uploadData.publicUrl,
        size: photo.size,
        mimetype: photo.mimetype,
        sister: photo.sister,
        title: photo.title,
        description: photo.description,
        event_type: photo.eventType,
        tags: photo.tags || []
      });
    
    if (dbError) {
      console.error('DB error:', dbError);
    }
  }
  
  console.log('Import complete');
}

importPhotos();
```

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution:**
1. Check SUPABASE_URL and SUPABASE_ANON_KEY in `.env`
2. Verify project is active in Supabase dashboard
3. Check network/firewall settings

### Issue: "Table does not exist"

**Solution:**
1. Re-run database migrations
2. Check SQL Editor for errors
3. Verify you ran the migration in the correct project

### Issue: "Storage upload failed"

**Solution:**
1. Verify `wedding-photos` bucket exists
2. Check storage policies are created
3. Ensure file size < 10MB
4. Check CORS settings if uploading from browser

### Issue: "Face detection not working"

**Solution:**
1. Ensure face-api.js models are in `/public/models/`
2. Check browser console for errors
3. Verify VITE_ENABLE_FACE_RECOGNITION=true
4. Try on a photo with clear faces

### Issue: "Photos not loading"

**Solution:**
1. Check backend is running
2. Verify VITE_API_BASE_URL is correct
3. Check browser network tab for errors
4. Verify auth token is valid

### Issue: "Face matching not accurate"

**Solution:**
1. Add more reference photos for each person
2. Adjust threshold (lower = more matches, less accurate)
3. Use clear, front-facing photos for training
4. Manually verify and correct matches

---

## Performance Optimization

### Backend

1. **Database Connection Pooling:**
   - Supabase handles this automatically
   - Monitor connection count in dashboard

2. **Caching:**
   - Consider Redis for frequently accessed data
   - Cache face descriptors in memory

3. **Batch Operations:**
   - Upload multiple photos in parallel
   - Use transaction for related database operations

### Frontend

1. **Lazy Loading:**
   - Load photos on scroll
   - Use intersection observer

2. **Image Optimization:**
   - Generate thumbnails on upload
   - Use WebP format where supported
   - Implement progressive loading

3. **Face Detection:**
   - Run detection in web worker
   - Cache results locally
   - Debounce detection requests

---

## Security Checklist

- [ ] Change JWT_SECRET to a strong random value
- [ ] Use HTTPS in production
- [ ] Enable Row Level Security (RLS) in Supabase
- [ ] Validate file uploads (size, type)
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Keep service role keys secret
- [ ] Enable CORS only for trusted origins
- [ ] Regular security audits
- [ ] Keep dependencies updated

---

## Next Steps

1. ✅ Complete setup following this guide
2. ✅ Test all functionality
3. ✅ Migrate existing data (if any)
4. ⏭️ Deploy to production
5. ⏭️ Set up monitoring and logging
6. ⏭️ Create user documentation
7. ⏭️ Train photographers on new features

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Face-API.js Docs:** https://github.com/justadudewhohacks/face-api.js
- **Project Issues:** Create an issue in your repository
- **Community:** Stack Overflow with tags `supabase`, `face-recognition`

---

## License

This setup guide is part of the wedding web application project.

