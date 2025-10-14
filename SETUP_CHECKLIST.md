# Setup Checklist for Supabase Migration

## ✅ Your Supabase Project Details
- **Project URL:** https://rkqtglurixkdlewqqhqv.supabase.co
- **Dashboard:** https://app.supabase.com/project/rkqtglurixkdlewqqhqv
- **Anon Key:** ✅ Already configured

---

## 📋 Setup Steps

### 1. Backend Environment Configuration
- [ ] Create `backend/.env` file
- [ ] Add Supabase URL (✅ already have)
- [ ] Add Supabase Anon Key (✅ already have)
- [ ] Get and add **Service Role Key** from: https://app.supabase.com/project/rkqtglurixkdlewqqhqv/settings/api
- [ ] Verify Firebase credentials are correct

**Test:** Run `cd backend` then `node supabase/run-migration.js` - should not show error about missing keys

---

### 2. Database Migration
- [ ] Go to SQL Editor: https://app.supabase.com/project/rkqtglurixkdlewqqhqv/sql/new
- [ ] Open file: `backend/supabase/migrations/001_initial_schema.sql`
- [ ] Copy ALL content (284 lines)
- [ ] Paste into SQL Editor
- [ ] Click "Run" or press Ctrl+Enter
- [ ] Wait for "Success" message

**Test:** Check Table Editor: https://app.supabase.com/project/rkqtglurixkdlewqqhqv/editor
- Should see: photos, people, face_descriptors, photo_faces tables

---

### 3. Storage Bucket Setup
- [ ] Go to Storage: https://app.supabase.com/project/rkqtglurixkdlewqqhqv/storage/buckets
- [ ] Click "New bucket"
- [ ] Name: `wedding-photos`
- [ ] Make it Public: ✅
- [ ] Click "Create bucket"

**Test:** Bucket should appear in the list

---

### 4. Storage Policies
- [ ] Go to SQL Editor again
- [ ] Run this SQL:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'wedding-photos');

-- Allow authenticated uploads
CREATE POLICY "Authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'wedding-photos');

-- Allow authenticated deletes
CREATE POLICY "Authenticated deletes"
ON storage.objects FOR DELETE
USING (bucket_id = 'wedding-photos');
```

**Test:** No errors when running the SQL

---

### 5. Replace Backend Files
- [ ] Backup current files:
  ```
  cd backend
  copy server.js server.js.backup
  copy photos.js photos.js.backup
  ```
- [ ] Replace files:
  ```
  copy server-new.js server.js
  copy photos-new.js photos.js
  ```
- [ ] Verify `faces.js` exists (it's new, no need to replace)

**Test:** Check that files were replaced successfully

---

### 6. Test Backend
- [ ] Start backend:
  ```
  cd backend
  npm start
  ```
- [ ] Should see:
  ```
  ✅ Firebase initialized successfully (for wishes)
  ✅ Supabase initialized successfully
  🎉 Wedding Web Application Server Started
  📍 Server running on port 5000
  ```

**Test:** Open browser to http://localhost:5000/health
- Should return JSON with both Firebase and Supabase connected

---

### 7. Frontend Environment Configuration
- [ ] Create `frontend/.env.local` file
- [ ] Add content:

```env
VITE_SUPABASE_URL=https://rkqtglurixkdlewqqhqv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrcXRnbHVyaXhrZGxld3FxaHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwMjQ2MzEsImV4cCI6MjA3NTYwMDYzMX0.rZaPMTVfjrhwKo0zUwKJ3GxW5E1vQFAPMeGgghXOAQ4
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_FACE_RECOGNITION=true
```

- [ ] Add Firebase config if needed (for wishes)

**Test:** File should be created and readable

---

### 8. Install Frontend Dependencies
- [ ] Run in frontend folder:
  ```
  cd frontend
  npm install @supabase/supabase-js
  ```

**Test:** Package should install without errors

---

### 9. Replace Frontend Files
- [ ] Backup current file:
  ```
  copy src\components\PhotoUpload.tsx src\components\PhotoUpload.tsx.backup
  ```
- [ ] Replace file:
  ```
  copy src\components\PhotoUpload-refactored.tsx src\components\PhotoUpload.tsx
  ```

**Test:** File should be replaced successfully

---

### 10. Test Frontend
- [ ] Make sure backend is running (from step 6)
- [ ] Start frontend:
  ```
  cd frontend
  npm run dev
  ```
- [ ] Open browser: http://localhost:5173
- [ ] Should load without errors

**Test:** Check browser console - no errors about missing environment variables

---

### 11. Integration Test - Upload Photo
- [ ] Navigate to photographer portal
- [ ] Login with your credentials
- [ ] Go to photo upload page
- [ ] Select a photo with faces
- [ ] Verify:
  - [ ] Face detection runs (spinner shows)
  - [ ] Faces are detected and shown
  - [ ] Can upload successfully
  - [ ] Photo appears in gallery

**Test:** Complete upload flow works end-to-end

---

## 🐛 Troubleshooting

### Issue: "SUPABASE_SERVICE_ROLE_KEY not set"
**Solution:** Make sure you copied the service_role key (not anon key) from:
https://app.supabase.com/project/rkqtglurixkdlewqqhqv/settings/api

### Issue: "Table does not exist"
**Solution:** Run the migration SQL in SQL Editor (Step 2)

### Issue: "Bucket does not exist"
**Solution:** Create the wedding-photos bucket (Step 3)

### Issue: Backend won't start
**Solution:** 
1. Check .env file exists in backend folder
2. Verify all required variables are set
3. Check for typos in environment variables

### Issue: Face detection not working
**Solution:**
1. Check VITE_ENABLE_FACE_RECOGNITION=true in frontend/.env.local
2. Ensure face-api.js models are in frontend/public/models/
3. Check browser console for errors

---

## 📊 Quick Test Commands

```bash
# Test backend health
curl http://localhost:5000/health

# Test photo upload (after login)
curl -X POST http://localhost:5000/api/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@test.jpg" \
  -F "sister=sister-a" \
  -F "title=Test Photo"

# Get people list
curl http://localhost:5000/api/faces/people \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Completion Checklist

Once all steps are complete:
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:5000/health
- [ ] Can access http://localhost:5173
- [ ] Can upload photos with face detection
- [ ] Photos appear in gallery
- [ ] Wishes still work (Firebase)

---

## 🎉 You're Done!

When all checkboxes are checked, your setup is complete!

**Next Steps:**
1. Test all features thoroughly
2. Add sample people to the database
3. Upload test photos
4. Review face recognition results
5. Deploy to production when ready

---

## 📚 Documentation References

- **Setup Guide:** SETUP_GUIDE.md
- **Implementation Summary:** IMPLEMENTATION_SUMMARY.md
- **Quick Reference:** QUICK_REFERENCE.md
- **Supabase Dashboard:** https://app.supabase.com/project/rkqtglurixkdlewqqhqv

---

**Created:** October 14, 2025
**Status:** Ready to Begin

