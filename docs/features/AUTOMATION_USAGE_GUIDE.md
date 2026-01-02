# 🚀 Automation Usage Guide

## Quick Start (Automated)

### Start Everything with One Command

```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1
./start-all.sh
```

This single command:
- ✅ Stops any old servers
- ✅ Starts backend on port 5002
- ✅ Starts frontend (usually port 3000)
- ✅ Shows system status
- ✅ Displays statistics
- ✅ Tails both server logs

### Stop Everything with One Command

```bash
./stop-all.sh
```

Cleanly stops both servers.

## Automated Features

### 1. 🤖 Auto Face Detection

**Trigger:** Every time you upload a photo  
**Action:** Automatically runs face clustering  
**Result:** New guests detected without manual intervention

**How to see it:**
1. Upload a photo via photographer portal
2. Check backend logs - you'll see:
   ```
   ✅ Photo uploaded successfully...
   🔍 Starting automatic face detection for sister-a...
   Detected 5 faces. Starting clustering...
   Created new guest: Guest_004
   ✅ Face detection completed for sister-a
   ```
3. Wait 30-60 seconds
4. Visit http://localhost:3000/face-admin
5. New guests appear!

**Status:** NO MANUAL STEPS NEEDED!

### 2. 🔄 Auto Gallery Refresh

**Trigger:** Runs automatically every 30 seconds  
**Action:** Checks for new photos  
**Result:** Gallery updates without page refresh

**How it works:**
1. Open gallery: http://localhost:3000/parvathy/gallery
2. Leave it open
3. Upload photos in another tab
4. Within 30 seconds, new photos appear in gallery!

**Status:** NO REFRESH BUTTON NEEDED!

### 3. 📊 Auto Statistics Update

**Trigger:** Every time photos are loaded  
**Action:** Updates photo counts and stats  
**Result:** Real-time statistics

**Where to see:**
- Photographer dashboard: Total Photos, Uploaded Today
- Face admin: Guest counts, face counts
- Recent uploads: Latest 5 uploads

**Status:** ALWAYS UP TO DATE!

## Manual Controls (If Needed)

### Manually Trigger Face Detection

If you want to reprocess a gallery:

```bash
# Trigger Sister A
curl -X POST http://localhost:5002/api/face-detection/trigger \
  -H "Content-Type: application/json" \
  -d '{"sister": "sister-a"}'

# Trigger Sister B
curl -X POST http://localhost:5002/api/face-detection/trigger \
  -H "Content-Type: application/json" \
  -d '{"sister": "sister-b"}'

# Trigger both
curl -X POST http://localhost:5002/api/face-detection/trigger-all
```

### Check Processing Status

```bash
curl http://localhost:5002/api/face-detection/status/sister-a
```

Returns:
```json
{
  "sister": "sister-a",
  "hasBeenClustered": true,
  "isProcessing": false,
  "isQueued": false,
  "stats": {
    "guestCount": 3,
    "photoCount": 3,
    "lastProcessed": "2025-10-26T..."
  }
}
```

### Manually Refresh Gallery

If you don't want to wait 30 seconds:
- Press `F5` to manually refresh

## Typical Workflow (Fully Automated)

### Morning: Start Servers

```bash
./start-all.sh
```

Leave this running all day!

### During the Day: Upload Photos

1. Login: http://localhost:3000/photographer-login
2. Upload photos
3. **That's it!** Everything else is automatic:
   - ✅ Photos saved
   - ✅ Face detection runs
   - ✅ Guests detected
   - ✅ Gallery updates
   - ✅ Statistics update

### Evening: Stop Servers

```bash
./stop-all.sh
```

Or just `Ctrl+C` in the terminal running `start-all.sh`

## Monitoring

### Watch What's Happening

The `start-all.sh` script shows combined logs, so you can see:

- Photo uploads
- Face detection starting
- Faces being detected
- Guests being created
- API requests
- Errors (if any)

### Log Files

Individual logs are saved to:
- Backend: `/tmp/wedding-backend.log`
- Frontend: `/tmp/wedding-frontend.log`

View anytime:
```bash
tail -f /tmp/wedding-backend.log
tail -f /tmp/wedding-frontend.log
```

## Configuration

### Auto-Refresh Interval

Default: 30 seconds

To change, edit `frontend/src/components/PhotoGallery-simple.tsx`:
```typescript
const intervalId = setInterval(fetchPhotos, 30000); // Change 30000 to desired ms
```

### Face Detection Threshold

Edit `backend/cluster_faces.py`:
```python
THRESHOLD = 0.4  # Lower = stricter matching
```

## Troubleshooting Automation

### Face Detection Not Running

**Check logs:**
```bash
tail -50 /tmp/wedding-backend.log | grep "face detection"
```

**Manually trigger:**
```bash
curl -X POST http://localhost:5002/api/face-detection/trigger-all
```

### Gallery Not Auto-Refreshing

**Check browser console** (F12):
- Should see API calls every 30 seconds
- Look for fetch errors

**Manual refresh:**
- Press F5

### Startup Script Not Working

**Check permissions:**
```bash
chmod +x start-all.sh stop-all.sh
```

**Run manually:**
```bash
cd backend && PORT=5002 node server.js &
cd frontend && npm run dev &
```

## Benefits of Automation

### Time Saved
- **Before:** ~2-3 minutes per upload (manual clustering, refresh, check)
- **After:** 0 seconds - everything automatic!

### Accuracy
- No forgotten steps
- Consistent processing
- Always up to date

### User Experience
- Guests see new photos immediately (within 30 sec)
- Face detection always current
- Statistics always accurate

## Advanced Usage

### Background Mode

Run servers in background:
```bash
nohup ./start-all.sh > /tmp/wedding-startup.log 2>&1 &
```

### Custom Port

Start backend on different port:
```bash
cd backend
PORT=5003 node server.js &
```

Then update `frontend/src/lib/api.ts` accordingly.

### Disable Auto Face Detection

Comment out in `backend/photos-local.js`:
```javascript
// autoFaceDetection.triggerFaceDetection(sister).catch(...);
```

### Change Auto-Refresh Rate

In `PhotoGallery-simple.tsx`:
```typescript
const intervalId = setInterval(fetchPhotos, 60000); // 60 seconds instead of 30
```

## Summary

🎉 **Complete Automation Achieved!**

### What You Did Before:
1. Upload photo
2. Run clustering script
3. Refresh gallery
4. Check face admin
5. Verify results

### What You Do Now:
1. Upload photo
2. ✨ *Everything else happens automatically!*

### Commands You Need:
```bash
./start-all.sh  # Start everything
./stop-all.sh   # Stop everything
```

That's it! No manual processing, no refreshing, no scripts to remember!

---

**Try it now:**

1. Run `./start-all.sh`
2. Upload a photo
3. Watch the automation work!
4. Visit http://localhost:3000/face-admin in ~1 minute
5. See newly detected guests!

**Welcome to the fully automated wedding website!** 🤖✨

