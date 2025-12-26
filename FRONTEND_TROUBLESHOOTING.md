# Frontend Troubleshooting Guide

## ✅ Frontend Rebuilt Successfully

The frontend has been rebuilt with the latest DeepFace migration changes. The build is now in `backend/build/`.

## 🔍 Common Issues & Solutions

### Issue 1: Blank Screen / White Page

**Check:**
1. Open browser DevTools (F12) → Console tab
2. Look for JavaScript errors
3. Check Network tab for failed requests

**Common Causes:**
- Missing environment variables
- API connection errors
- CORS issues
- Missing assets

**Solution:**
```bash
# Rebuild frontend
cd frontend
npm run build

# Restart backend
cd ../backend
npm start
```

### Issue 2: DeepFace API Not Working

**Check:**
```bash
# Verify DeepFace API is running
curl http://localhost:8002/

# Should return: {"status":"ok",...}
```

**Solution:**
```bash
# Start DeepFace API
cd backend
./start_deepface.sh
```

### Issue 3: Environment Variables Not Loading

**Check:**
- `frontend/.env` exists and has `VITE_DEEPFACE_API_URL=http://localhost:8002`
- Frontend was rebuilt after adding .env variables
- Vite requires restart after .env changes

**Solution:**
```bash
# Rebuild after .env changes
cd frontend
npm run build
```

### Issue 4: CORS Errors

**Symptoms:**
- Console shows: "Access to fetch at 'http://localhost:8002' from origin 'http://localhost:5001' has been blocked by CORS policy"

**Solution:**
- DeepFace API already has CORS enabled
- If still seeing errors, check `backend/deepface_api.py` CORS settings

## 🚀 Quick Fixes

### Rebuild Everything:
```bash
# 1. Rebuild frontend
cd frontend
npm run build

# 2. Restart backend
cd ../backend
npm start

# 3. Start DeepFace API (if not running)
./start_deepface.sh
```

### Check All Services:
```bash
# Backend (should be running)
curl http://localhost:5001/

# DeepFace API (should be running)
curl http://localhost:8002/

# Frontend (served by backend)
curl http://localhost:5001/ | grep -o "index-.*\.js"
```

## 📝 Current Setup

- **Backend:** `http://localhost:5001` (serves frontend + API)
- **DeepFace API:** `http://localhost:8002` (face detection)
- **Frontend Build:** `backend/build/` (served by backend)

## 🔧 If Still Not Working

1. **Check browser console** (F12 → Console)
2. **Check network requests** (F12 → Network)
3. **Verify all services running:**
   ```bash
   lsof -i :5001  # Backend
   lsof -i :8002  # DeepFace API
   ```
4. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
5. **Try incognito/private window**

