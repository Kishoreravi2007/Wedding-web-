# ⚡ COPY & PASTE THESE COMMANDS

## 🎯 You Have All Credentials! Just Follow These Steps:

---

## 📝 Step 1: Create backend/.env File

**Create new file:** `backend/.env`

**Paste this content:**
```
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

## 📝 Step 2: Create frontend/.env File

**Create new file:** `frontend/.env`

**Paste this content:**
```
VITE_SUPABASE_URL=https://dmsghmogmwmpxjaipbod.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
VITE_API_URL=http://localhost:5002
```

---

## 🗄️ Step 3: Set Up Database

1. **Go to:** https://dmsghmogmwmpxjaipbod.supabase.co
2. **Click:** SQL Editor (left sidebar)
3. **Click:** "New Query"
4. **Paste the SQL from QUICK_SETUP_GUIDE.md** (the complete CREATE TABLE script)
5. **Click:** "RUN"
6. **Wait for:** "Success" message

---

## 📦 Step 4: Create Storage Bucket

1. **Go to:** https://dmsghmogmwmpxjaipbod.supabase.co
2. **Click:** Storage (left sidebar)
3. **Click:** "Create a new bucket"
4. **Name:** `wedding-photos`
5. **✅ CHECK:** "Public bucket" checkbox
6. **Click:** "Create bucket"

---

## ✅ Step 5: Test Connection

**Run in PowerShell:**
```powershell
cd backend
node test-supabase-connection.js
```

**You should see:**
```
✅ Storage accessible
✅ Database accessible
✅ wedding-photos bucket exists
✅ Table 'photos' exists
```

**If you see errors, check:**
- backend/.env file exists and has all 3 keys
- Database tables created (Step 3)
- Storage bucket created and is PUBLIC (Step 4)

---

## 🚀 Step 6: Migrate Photos

**Run in PowerShell:**
```powershell
cd ..
.\migrate-to-supabase.ps1
```

**This will:**
1. ✅ Test connection
2. ✅ Upload 15 photos to Supabase
3. ✅ Create database records
4. ✅ Show progress for each photo

**You should see:**
```
🚀 Starting migration to Supabase...
📸 Found 15 photos to migrate
  Uploading 1.jpeg... ✅ Uploaded
  Uploading 2.jpeg... ✅ Uploaded
  ...
✅ Migration complete!
```

---

## 🎉 Step 7: Test Your Website

**Run in PowerShell:**
```powershell
.\start-all.sh
```

**Or if that doesn't work:**
```powershell
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend (new PowerShell window)
cd frontend
npm run dev
```

**Then visit:**
- http://localhost:3000/sreedevi/gallery

**You should see all 15 photos!** 🎊

---

## 🌐 Step 8: Update Deployed Site (After Local Testing)

### Update Render Backend

1. Go to Render dashboard
2. Your backend service → Environment
3. Add these variables:
```
SUPABASE_URL = https://dmsghmogmwmpxjaipbod.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NTUwOCwiZXhwIjoyMDc3MDUxNTA4fQ.0n0kzNlCjLMcVT-80sESkbusY84QWGdgbaaX3zxttok
```
4. Save → Auto redeploys

### Update Frontend (Netlify/Vercel)

1. Go to your frontend dashboard
2. Site Settings → Environment Variables
3. Add these:
```
VITE_SUPABASE_URL = https://dmsghmogmwmpxjaipbod.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2dobW9nbXdtcHhqYWlwYm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NzU1MDgsImV4cCI6MjA3NzA1MTUwOH0.ql_cJb4YSxj2mhUMd79t2IyafG3CURxNf8rKgRf2Iyw
```
4. Trigger new deployment

**Then visit:** weddingweb.co.in/sreedevi/gallery

**Your deployed site will now show all 15 photos!** 🚀

---

## 🎯 QUICK TROUBLESHOOTING

### "SUPABASE_URL not set" error
→ Check backend/.env file exists and has correct content

### "Bucket does not exist"
→ Create wedding-photos bucket in Supabase Storage (make it PUBLIC)

### "Table 'photos' does not exist"
→ Run the SQL schema in Supabase SQL Editor

### Photos not uploading
→ Make sure wedding-photos bucket is PUBLIC (not private)

### Connection test fails
→ Verify all 3 keys in backend/.env are correct

---

## ✅ SUCCESS CHECKLIST

- [ ] Created backend/.env with 3 Supabase keys
- [ ] Created frontend/.env with Supabase URL and anon key  
- [ ] Ran SQL schema in Supabase (tables created)
- [ ] Created wedding-photos storage bucket (PUBLIC)
- [ ] Ran test: `node backend/test-supabase-connection.js` ✅
- [ ] Ran migration: `.\migrate-to-supabase.ps1` (15 photos uploaded)
- [ ] Tested locally: http://localhost:3000/sreedevi/gallery shows photos
- [ ] Updated deployed environment variables
- [ ] Redeployed site
- [ ] Verified: weddingweb.co.in/sreedevi/gallery shows photos

---

**You're ready! Start with Step 1!** 🚀

All your credentials are already in this file - just copy and paste!

