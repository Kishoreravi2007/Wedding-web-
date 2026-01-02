# Quick Fix: Frontend Not Working

## ✅ What Was Done

1. **Frontend rebuilt** with latest DeepFace migration changes
2. **Build output:** `backend/build/` (served by backend on port 5001)
3. **Environment variables:** Configured with `VITE_DEEPFACE_API_URL`

## 🔍 Troubleshooting Steps

### Step 1: Hard Refresh Browser
```bash
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R
```
This clears cached JavaScript files.

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for red errors

**Common errors:**
- `Failed to fetch` → DeepFace API not running
- `CORS error` → API CORS configuration
- `Cannot read property` → JavaScript error in code

### Step 3: Verify All Services Running

```bash
# Check backend
curl http://localhost:5001/

# Check DeepFace API
curl http://localhost:8002/

# Both should return JSON responses
```

### Step 4: Restart Services

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: DeepFace API
cd backend
./start_deepface.sh

# Terminal 3: Frontend (if running separately)
cd frontend
npm run dev
```

## 🐛 Common Issues

### Issue: Blank/White Screen

**Cause:** JavaScript error preventing React from rendering

**Fix:**
1. Check browser console (F12)
2. Look for import errors or undefined variables
3. Rebuild frontend: `cd frontend && npm run build`

### Issue: "Failed to fetch" Errors

**Cause:** DeepFace API not accessible

**Fix:**
```bash
# Start DeepFace API
cd backend
./start_deepface.sh

# Verify it's running
curl http://localhost:8002/
```

### Issue: CORS Errors

**Cause:** API blocking requests from frontend

**Fix:** DeepFace API already has CORS enabled. If still seeing errors, check:
- `VITE_DEEPFACE_API_URL` in `frontend/.env`
- DeepFace API is running on port 8002

### Issue: Old Code Still Running

**Cause:** Browser cache or old build

**Fix:**
1. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Clear browser cache
3. Try incognito/private window
4. Rebuild: `cd frontend && npm run build`

## 📋 Quick Checklist

- [ ] Backend running on port 5001
- [ ] DeepFace API running on port 8002
- [ ] Frontend rebuilt (`npm run build`)
- [ ] Browser hard refreshed
- [ ] Checked browser console for errors
- [ ] `VITE_DEEPFACE_API_URL=http://localhost:8002` in `frontend/.env`

## 🚀 Still Not Working?

1. **Check browser console** - Most issues show errors there
2. **Check network tab** - See which requests are failing
3. **Try incognito mode** - Rules out cache issues
4. **Check server logs** - Backend terminal for errors

## 📝 Current Setup

- **Frontend:** Served by backend from `backend/build/`
- **URL:** `http://localhost:5001`
- **Backend API:** `http://localhost:5001/api/*`
- **DeepFace API:** `http://localhost:8002`

