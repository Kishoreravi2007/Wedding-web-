# ⚡ QUICK SETUP - You Have All Credentials!

## ✅ Step 1: Create Backend Environment File (1 min)

Create file: **`backend/.env`**

**Easy way:**
1. Copy `SETUP_CREDENTIALS.txt` backend section
2. Paste into new file `backend/.env`

**Or manually create with:**
```env
PORT=5002
NODE_ENV=development
BACKEND_URL=http://localhost:5002
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NTUwOCwiZXhwIjoyMDc3MDUxNTA4fQ.0n0kzNlCjLMcVT-80sESkbusY84QWGdgbaaX3zxttok

FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-key.json
```

---

## ✅ Step 2: Create Frontend Environment File (1 min)

Create file: **`frontend/.env`**

```env
VITE_SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw

VITE_API_URL=http://localhost:5002
```

---

## ✅ Step 3: Set Up Database (2 min)

1. Go to: **https://dmsghmogmwmpxjaipbod.supabase.co**
2. Click **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy and paste this SQL:

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

-- Create indexes
CREATE INDEX idx_photos_sister ON photos(sister);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX idx_photos_file_path ON photos(file_path);

-- People/Guests table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  role TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  guest_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Face descriptors table
CREATE TABLE face_descriptors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor FLOAT8[] NOT NULL,
  source_photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Photo faces table
CREATE TABLE photo_faces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE SET NULL,
  bounding_box JSONB,
  confidence FLOAT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_photo_faces_photo_id ON photo_faces(photo_id);
CREATE INDEX idx_photo_faces_person_id ON photo_faces(person_id);
CREATE INDEX idx_face_descriptors_person_id ON face_descriptors(person_id);

-- Guest mapping table
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

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_faces ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_mappings ENABLE ROW LEVEL SECURITY;

-- Create public read policies
CREATE POLICY "Public photos are viewable by everyone"
  ON photos FOR SELECT USING (true);

CREATE POLICY "Public people are viewable by everyone"
  ON people FOR SELECT USING (true);

CREATE POLICY "Public face_descriptors are viewable by everyone"
  ON face_descriptors FOR SELECT USING (true);

CREATE POLICY "Public photo_faces are viewable by everyone"
  ON photo_faces FOR SELECT USING (true);

CREATE POLICY "Public guest_mappings are viewable by everyone"
  ON guest_mappings FOR SELECT USING (true);

-- Authenticated users can manage data
CREATE POLICY "Authenticated users can insert photos"
  ON photos FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update photos"
  ON photos FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete photos"
  ON photos FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage guest_mappings"
  ON guest_mappings FOR ALL USING (auth.role() = 'authenticated');
```

5. Click **"RUN"** button
6. Wait for "Success" message

---

## ✅ Step 4: Create Storage Bucket (1 min)

1. Go to: **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Fill in:
   - **Name**: `wedding-photos`
   - **Public bucket**: ✅ **CHECK THIS BOX** (important!)
4. Click **"Create bucket"**

---

## ✅ Step 5: Test Connection (30 seconds)

```powershell
cd backend
node test-supabase-connection.js
```

**Expected output:**
```
✅ Storage accessible
✅ Database accessible  
✅ wedding-photos bucket exists
✅ Table 'photos' exists
```

---

## ✅ Step 6: Migrate Your Photos! (5 min)

```powershell
# Go back to project root
cd ..

# Run migration script
.\migrate-to-supabase.ps1
```

**What will happen:**
1. Tests connection ✅
2. Uploads 15 photos to Supabase cloud
3. Creates database records
4. Shows progress for each photo
5. Displays summary

**Expected output:**
```
🚀 Starting migration to Supabase...
📸 Found 15 photos to migrate

  Uploading 1.jpeg (sister-b)... ✅ Uploaded
  Uploading 2.jpeg (sister-b)... ✅ Uploaded
  ...
  Uploading 15.jpeg (sister-b)... ✅ Uploaded

📊 Migration Summary
✅ Successfully migrated: 15 photos
📁 Sister B: 15 photos

✅ Migration complete!
```

---

## ✅ Step 7: Test Your Website! (1 min)

```powershell
# Start servers
.\start-all.sh

# Or manually:
# cd backend && node server.js
# cd frontend && npm run dev
```

Visit: **http://localhost:3000/sreedevi/gallery**

**You should now see all 15 photos!** 🎉

---

## 🎯 VERIFICATION CHECKLIST

- [ ] Created `backend/.env` file with all 3 Supabase keys
- [ ] Created `frontend/.env` file with Supabase URL and anon key
- [ ] Ran SQL schema in Supabase SQL Editor (success message shown)
- [ ] Created `wedding-photos` storage bucket (made it PUBLIC)
- [ ] Ran `node backend/test-supabase-connection.js` (all ✅)
- [ ] Ran `.\migrate-to-supabase.ps1` (15 photos uploaded)
- [ ] Started website and saw photos in gallery

---

## 🎊 AFTER MIGRATION

### Your Photos Are Now:
✅ In Supabase cloud storage  
✅ Accessible via CDN worldwide  
✅ Persistent (survive server restarts)  
✅ Backed up automatically  
✅ Visible in your gallery  

### Next: Deploy to Production

Once you verify locally, update your deployed site:

**Add to Render backend environment:**
```
SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Add to Netlify/Vercel frontend:**
```
VITE_SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Then redeploy, and **weddingweb.co.in/sreedevi/gallery** will show your photos! 🚀

---

**Ready? Start with Step 1!** ⬆️


