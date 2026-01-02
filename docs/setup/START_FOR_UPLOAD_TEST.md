# Quick Start Guide - Upload Testing

## Start the Servers

Open **TWO** terminal windows:

### Terminal 1: Backend Server
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/backend
node server.js
```

**Expected output:**
```
📁 Serving static files from: .../uploads
📁 Serving backend files from: .../backend
Server running on port 5000
```

### Terminal 2: Frontend Server  
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/frontend
npm run dev
```

**Expected output:**
```
VITE v6.3.6  ready in 128 ms
➜  Local:   http://localhost:3002/
```

## Test the Upload Feature

### 1. Login
- Open browser: http://localhost:3002/photographer-login
- Login with photographer credentials

### 2. Upload Photos
- Go to "Upload Photos" tab
- Select wedding (Sister A or Sister B)
- Drag & drop photos OR click to browse
- Click "Upload Photos"
- Wait for ✅ success message

### 3. Verify Upload
- Check "Recent Uploads" tab - should see new photos
- Check "Photo Gallery" tab - should see all photos
- Photos saved to: `uploads/wedding_gallery/sister_a/` or `sister_b/`

### 4. Process for Face Detection (Optional)
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1

# Process Sister A
python3 backend/cluster_faces.py \
  --gallery uploads/wedding_gallery/sister_a \
  --output backend/reference_images/sister_a \
  --mapping backend/guest_mapping_sister_a.json

# Process Sister B  
python3 backend/cluster_faces.py \
  --gallery uploads/wedding_gallery/sister_b \
  --output backend/reference_images/sister_b \
  --mapping backend/guest_mapping_sister_b.json
```

### 5. View in Face Detection Admin
- http://localhost:3002/face-admin
- See newly detected guests from uploaded photos

## Quick Verification

Run this to check everything is ready:

```bash
# Check backend
curl -s http://localhost:5000/api/photos-local?sister=sister-a | head -10

# Check directories
ls uploads/wedding_gallery/sister_a/
ls uploads/wedding_gallery/sister_b/

# Check servers
lsof -i :5000  # Should show backend
lsof -i :3002  # Should show frontend
```

## Troubleshooting

### Port already in use
```bash
# Kill existing processes
pkill -f "node.*server.js"
pkill -f "node.*vite"
# Then restart servers
```

### Backend not accessible
```bash
# Check if running
lsof -i :5000
# Check logs
tail -50 /tmp/backend.log
```

### Frontend not loading
```bash
# Check if running  
lsof -i :3002
# Check logs
tail -50 /tmp/frontend.log
```

---

**Once both servers are running, test uploads at:**
http://localhost:3002/photographer-login

