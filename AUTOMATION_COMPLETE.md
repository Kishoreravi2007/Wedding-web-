# 🤖 Complete Automation Guide

## What's Automated Now

### 1. ✅ Automatic Face Detection After Upload

**What happens:**
- You upload a photo
- Backend automatically triggers face clustering
- Python script runs in background
- New faces detected and added to database
- No manual intervention needed!

**How it works:**
```
Upload Photo → Save to Filesystem → Trigger Auto Face Detection → Update Guest Mappings
```

**See it in action:**
- Upload a photo to Sister A or Sister B
- Check backend logs: You'll see face detection starting automatically
- Visit http://localhost:3000/face-admin after ~30-60 seconds
- New guests will appear!

### 2. ✅ Single Startup Script

**One command starts everything:**

```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1
./start-all.sh
```

**What it does:**
- Kills any existing servers
- Starts backend on port 5002
- Starts frontend (auto-selects port)
- Shows status for both servers
- Displays quick access URLs
- Tails logs from both servers

**Features:**
- Automatic port detection
- Health checks
- Photo count statistics
- Guest detection stats
- Color-coded output
- Combined log viewing

### 3. ✅ Auto-Refresh Gallery

**Gallery updates automatically:**
- Checks for new photos every 30 seconds
- No manual refresh needed
- New uploads appear automatically
- Works for both Sister A and Sister B galleries

**How it works:**
- Gallery polls `/api/photos-local` every 30 seconds
- Detects new photos
- Updates display automatically
- Users see new photos without refreshing!

### 4. ✅ Stop All Services Script

**One command stops everything:**

```bash
./stop-all.sh
```

Cleanly stops both backend and frontend servers.

## New API Endpoints

### Trigger Face Detection

```bash
# Trigger for specific gallery
curl -X POST http://localhost:5002/api/face-detection/trigger \
  -H "Content-Type: application/json" \
  -d '{"sister": "sister-a"}'

# Trigger for both galleries
curl -X POST http://localhost:5002/api/face-detection/trigger-all
```

### Check Face Detection Status

```bash
# Check status for Sister A
curl http://localhost:5002/api/face-detection/status/sister-a

# Check status for Sister B
curl http://localhost:5002/api/face-detection/status/sister-b
```

## Complete Automated Workflow

### Upload to Face Detection (Fully Automated)

```
1. Photographer uploads photo
   ↓
2. Photo saves to uploads/wedding_gallery/
   ↓
3. Backend automatically triggers face detection
   ↓
4. Python clustering script runs in background
   ↓
5. Faces detected and grouped
   ↓
6. Reference images created
   ↓
7. Guest mapping updated
   ↓
8. Gallery auto-refreshes (30 sec)
   ↓
9. Face admin shows new guests
   ↓
10. Guests can find their photos!
```

**Everything happens automatically - zero manual steps!**

## Usage Guide

### Starting the Website

**Old way (manual):**
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2  
cd frontend && npm run dev
```

**New way (automated):**
```bash
./start-all.sh
```

That's it! Both servers start automatically.

### Stopping the Website

**Old way:**
- Close Terminal 1
- Close Terminal 2
- Or Ctrl+C in each terminal

**New way:**
```bash
./stop-all.sh
```

### Uploading Photos

**Old way:**
1. Upload photo
2. Manually run: `python3 backend/cluster_faces.py ...`
3. Manually refresh gallery
4. Check face admin

**New way:**
1. Upload photo
2. Done! Everything else is automatic

### Viewing New Photos

**Old way:**
- Refresh gallery page manually

**New way:**
- Gallery auto-refreshes every 30 seconds
- New photos appear automatically

## Automation Features

### Auto Face Detection
- ✅ Triggers on every upload
- ✅ Runs in background (non-blocking)
- ✅ Handles multiple uploads
- ✅ Queues if already processing
- ✅ Logs progress to console

### Smart Startup
- ✅ Cleans up old processes
- ✅ Starts both servers
- ✅ Health checks
- ✅ Shows statistics
- ✅ Combined log viewing
- ✅ Color-coded output

### Gallery Auto-Refresh
- ✅ Polls every 30 seconds
- ✅ Detects new photos
- ✅ Updates UI automatically
- ✅ No page refresh needed
- ✅ Works for both galleries

### Error Handling
- ✅ Graceful failures
- ✅ Logging
- ✅ Queue system for concurrent uploads
- ✅ Background processing

## Monitoring

### Watch Backend Logs
```bash
tail -f /tmp/wedding-backend.log
```

### Watch Frontend Logs
```bash
tail -f /tmp/wedding-frontend.log
```

### Watch Both (after running start-all.sh)
Logs automatically tail when you run `./start-all.sh`

## Configuration Files Created

1. **backend/services/auto-face-detection.js**
   - Automatic face detection service
   - Background processing
   - Queue management

2. **backend/routes/face-detection-trigger.js**
   - API endpoints for face detection
   - Status checking
   - Manual triggers

3. **start-all.sh**
   - Complete startup automation
   - Health checks
   - Statistics display

4. **stop-all.sh**
   - Clean shutdown
   - Process cleanup

## Testing the Automation

### Test Auto Face Detection

1. Upload a new photo
2. Watch backend logs:
   ```bash
   tail -f /tmp/wedding-backend.log
   ```
3. You'll see:
   ```
   ✅ Photo uploaded successfully: ...
   🔍 Starting automatic face detection for sister-a...
   Detected X faces. Starting clustering...
   Created new guest: Guest_XXX
   ✅ Face detection completed for sister-a
   ```

### Test Auto-Refresh

1. Open gallery: http://localhost:3000/parvathy/gallery
2. In another tab, upload a photo to Sister A
3. Wait 30 seconds
4. Gallery automatically updates with new photo!

### Test Startup Script

```bash
./start-all.sh
```

Watch as it:
- Stops old servers
- Starts backend
- Starts frontend
- Shows statistics
- Tails logs

## Tips

### Fast Startup
```bash
# Quick start
./start-all.sh &

# Or run in background and detach
nohup ./start-all.sh &
```

### Manual Face Detection (if needed)
```bash
# Trigger manually for Sister A
curl -X POST http://localhost:5002/api/face-detection/trigger \
  -H "Content-Type: application/json" \
  -d '{"sister": "sister-a"}'
```

### Check Processing Status
```bash
# See if face detection is running
curl http://localhost:5002/api/face-detection/status/sister-a
```

---

## Summary

🎊 **Complete Automation Implemented!**

### What's Automated:
1. ✅ Face detection after uploads
2. ✅ Server startup (single command)
3. ✅ Gallery refresh (every 30 sec)
4. ✅ Background processing
5. ✅ Error handling
6. ✅ Queue management

### New Scripts:
- `./start-all.sh` - Start everything
- `./stop-all.sh` - Stop everything

### Workflow Now:
```
Upload Photo → Everything Happens Automatically! 🎉
```

**Test it now:**
1. Run `./start-all.sh` to start servers
2. Upload a photo
3. Watch the magic happen automatically!

**No more manual steps!** 🚀

