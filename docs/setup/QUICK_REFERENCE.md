# Quick Reference Card: Supabase Migration

## 🚀 Quick Start (5 Minutes)

### 1. Supabase Setup
```bash
# Create project at supabase.com
# Run migration: backend/supabase/migrations/001_initial_schema.sql
# Create bucket: 'wedding-photos' (public)
```

### 2. Backend Setup
```bash
cd backend
npm install @supabase/supabase-js
cp env.example .env
# Edit .env with your keys
mv server-new.js server.js
mv photos-new.js photos.js
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install @supabase/supabase-js
cp env.example .env.local
# Edit .env.local with your keys
mv src/components/PhotoUpload-refactored.tsx src/components/PhotoUpload.tsx
npm run dev
```

---

## 📁 Important Files

### New Files (Created)
| File | Purpose |
|------|---------|
| `backend/lib/supabase-db.js` | Database operations |
| `backend/lib/face-recognition.js` | Face matching logic |
| `backend/faces.js` | Face API endpoints |
| `frontend/src/lib/supabase.ts` | Supabase client |
| `frontend/src/services/photoService.ts` | Photo operations |
| `frontend/src/services/faceRecognitionService.ts` | Face recognition |

### Files to Replace
| Original | Replace With |
|----------|--------------|
| `backend/server.js` | `backend/server-new.js` |
| `backend/photos.js` | `backend/photos-new.js` |
| `frontend/src/components/PhotoUpload.tsx` | `PhotoUpload-refactored.tsx` |

### Files Unchanged
- `backend/wishes.js` ✅ (still using Firebase)
- `backend/auth.js` ✅
- `frontend/src/lib/firebase.ts` ✅ (for wishes only)

---

## 🔑 Environment Variables

### Backend `.env`
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./key.json
FIREBASE_STORAGE_BUCKET=xxx.appspot.com
PORT=5000
JWT_SECRET=change-this
```

### Frontend `.env.local`
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_BASE_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_ENABLE_FACE_RECOGNITION=true
```

---

## 🧪 Testing Commands

```bash
# Backend health check
curl http://localhost:5000/health

# Test photo upload
curl -X POST http://localhost:5000/api/photos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "photo=@test.jpg" \
  -F "sister=sister-a" \
  -F "title=Test Photo"

# List photos
curl http://localhost:5000/api/photos \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get people
curl http://localhost:5000/api/faces/people \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Schema

### Main Tables
1. **photos** - Photo metadata
2. **people** - Recognized people
3. **face_descriptors** - Face embeddings (128D)
4. **photo_faces** - Face-photo associations

### Key Relationships
```
photos (1) ←→ (N) photo_faces
people (1) ←→ (N) photo_faces
people (1) ←→ (N) face_descriptors
```

---

## 🎯 API Endpoints

### Photos
- `GET /api/photos` - List photos
- `POST /api/photos` - Upload photo
- `DELETE /api/photos/:id` - Delete photo
- `PATCH /api/photos/:id` - Update metadata

### Faces
- `POST /api/faces/match` - Match face
- `GET /api/faces/people` - List people
- `POST /api/faces/people` - Create person
- `GET /api/faces/statistics` - Get stats

---

## 🐛 Common Issues

### "Supabase connection failed"
✅ Check URL and keys in `.env`

### "Table does not exist"
✅ Run migration in SQL Editor

### "Storage upload failed"
✅ Create bucket 'wedding-photos'

### "Face detection not working"
✅ Ensure models in `/public/models/`

### "Photos not loading"
✅ Verify backend is running on correct port

---

## 📈 Success Metrics

| Metric | Target |
|--------|--------|
| Upload success rate | >99% |
| Face detection rate | >95% |
| Face recognition accuracy | >85% |
| API response time (p95) | <500ms |
| Gallery load time | <2s |

---

## 🔐 Security Checklist

- [ ] Change JWT_SECRET
- [ ] Enable HTTPS in production
- [ ] RLS policies enabled
- [ ] File upload validation
- [ ] Rate limiting configured
- [ ] CORS restricted
- [ ] Service keys secured

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Complete overview |
| `SETUP_GUIDE.md` | Detailed setup steps |
| `SUPABASE_REFACTORING_PLAN.md` | Technical architecture |
| `backend/supabase/README.md` | Migration instructions |
| `QUICK_REFERENCE.md` | This file |

---

## 🛠️ Useful Commands

```bash
# Install dependencies
npm install @supabase/supabase-js

# Run migrations (manual)
# Copy backend/supabase/migrations/001_initial_schema.sql
# Paste in Supabase SQL Editor
# Click Run

# Start backend
cd backend && npm start

# Start frontend
cd frontend && npm run dev

# Check logs
# Backend: Console output
# Frontend: Browser DevTools

# Backup database
# Supabase Dashboard > Database > Backups
```

---

## 🎓 Key Concepts

### Face Recognition Flow
```
1. Upload photo
   ↓
2. Detect faces (frontend - face-api.js)
   ↓
3. Extract descriptors (128D vectors)
   ↓
4. Match against known people (backend)
   ↓
5. Store faces with confidence scores
   ↓
6. Display in gallery with tags
```

### Data Flow
```
Frontend → API → Backend → Supabase (storage + db)
Frontend → API → Backend → Firebase (wishes only)
```

---

## ⚡ Performance Tips

1. **Upload:** Compress images before upload
2. **Face Detection:** Run in web worker
3. **Gallery:** Lazy load images
4. **Search:** Use database indexes
5. **Caching:** Cache face descriptors

---

## 🔗 Links

- Supabase Dashboard: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs
- Face-API.js: https://github.com/justadudewhohacks/face-api.js
- Project: http://localhost:5173
- API: http://localhost:5000

---

## 📞 Support

- **Setup Issues:** See `SETUP_GUIDE.md`
- **Technical Details:** See `SUPABASE_REFACTORING_PLAN.md`
- **Bugs:** Create GitHub issue
- **Questions:** Stack Overflow with `supabase` tag

---

**Last Updated:** October 14, 2025
**Version:** 2.0.0
**Status:** ✅ Ready for Testing

