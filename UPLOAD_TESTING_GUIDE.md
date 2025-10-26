# Photo Upload Testing Guide

## Overview
This guide will help you test the photo upload feature to ensure it's working perfectly.

## Prerequisites

### 1. Servers Running
Make sure both servers are running:

**Backend** (Port 5000):
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/backend
node server.js
```

**Frontend** (Port 3002):
```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/frontend
npm run dev
```

### 2. Authentication
You need to be logged in as a photographer to upload photos.

## Step-by-Step Testing

### Step 1: Login as Photographer

1. Open browser: http://localhost:3002/photographer-login
2. Login credentials should work (check with admin)
3. You'll be redirected to the photographer dashboard

### Step 2: Upload Photos

1. Navigate to the **Upload Photos** tab
2. Select wedding: 
   - **Parvathy Wedding** (Sister A)
   - **Sreedevi Wedding** (Sister B)
3. Drag and drop photos OR click to browse
4. Click **Upload Photos**
5. Wait for success message

### Step 3: Verify Upload

#### Check Upload Location
Photos should be saved in:
```
uploads/wedding_gallery/sister_a/  (for Sister A)
uploads/wedding_gallery/sister_b/  (for Sister B)
```

Run this command to check:
```bash
ls -la /Users/kishoreravi/Desktop/projects/Wedding-web-1/uploads/wedding_gallery/sister_a/
ls -la /Users/kishoreravi/Desktop/projects/Wedding-web-1/uploads/wedding_gallery/sister_b/
```

#### Check in Recent Uploads Tab
1. Go to **Recent Uploads** tab
2. You should see the photos you just uploaded
3. Check that the stats are updated (Total Photos, Uploaded Today)

#### Check in Gallery Tab
1. Go to **Photo Gallery** tab
2. You should see all uploaded photos
3. Photos should be viewable

### Step 4: Test Face Detection

After uploading photos, process them for face detection:

```bash
# For Sister A
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1
python3 backend/cluster_faces.py \
  --gallery uploads/wedding_gallery/sister_a \
  --output backend/reference_images/sister_a \
  --mapping backend/guest_mapping_sister_a.json

# For Sister B
python3 backend/cluster_faces.py \
  --gallery uploads/wedding_gallery/sister_b \
  --output backend/reference_images/sister_b \
  --mapping backend/guest_mapping_sister_b.json
```

Then verify in the Face Detection Admin:
- Go to http://localhost:3002/face-admin
- Check that new guests are detected
- Test face recognition with the uploaded photos

## Common Issues & Solutions

### Issue 1: "Authentication required" error
**Solution**: 
- Make sure you're logged in
- Check browser console for token
- Try logging out and logging back in

### Issue 2: Photos not appearing after upload
**Solution**:
- Refresh the page
- Check browser console for errors
- Verify backend is running: `lsof -i :5000`

### Issue 3: Upload fails with 500 error
**Solution**:
- Check backend logs: `tail -50 /tmp/backend.log`
- Ensure uploads directory exists and has write permissions
- Check file size (max 10MB)

### Issue 4: Face detection not finding new photos
**Solution**:
- Rerun the clustering script
- Check that photos are in the correct directory
- Verify photos have faces in them

## Testing Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 3002
- [ ] Logged in as photographer
- [ ] Can select wedding (Sister A or Sister B)
- [ ] Can select photos to upload
- [ ] Upload button works and shows progress
- [ ] Success message appears after upload
- [ ] Photos appear in Recent Uploads tab
- [ ] Photos appear in Gallery tab
- [ ] Photos are saved to correct directory
- [ ] Stats are updated (Total Photos, Uploaded Today)
- [ ] Can reprocess for face detection
- [ ] New guests appear in Face Detection Admin

## API Endpoints

### Upload Single Photo
```
POST /api/photos-local
Headers: Authorization: Bearer <token>
Body (FormData):
  - photo: <file>
  - sister: 'sister-a' | 'sister-b'
```

### Upload Multiple Photos
```
POST /api/photos-local/batch
Headers: Authorization: Bearer <token>
Body (FormData):
  - photos: <files[]>
  - sister: 'sister-a' | 'sister-b'
```

### Get All Photos
```
GET /api/photos-local?sister=sister-a
Headers: Authorization: Bearer <token>
```

### Delete Photo
```
DELETE /api/photos-local/:id
Headers: Authorization: Bearer <token>
```

## Browser Console Commands

Test API directly in browser console:

```javascript
// Get authentication token
const token = localStorage.getItem('token');
console.log('Token:', token);

// Test upload endpoint
const formData = new FormData();
formData.append('photo', fileInput.files[0]);
formData.append('sister', 'sister-a');

fetch('http://localhost:5000/api/photos-local', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(res => res.json())
.then(data => console.log('Upload result:', data))
.catch(err => console.error('Upload error:', err));
```

## Expected Results

### Successful Upload
```json
{
  "id": "sister_a_photo_1234567890.jpg",
  "filename": "originalname.jpg",
  "file_path": "sister_a/photo_1234567890.jpg",
  "public_url": "http://localhost:5000/uploads/wedding_gallery/sister_a/photo_1234567890.jpg",
  "size": 2048576,
  "mimetype": "image/jpeg",
  "sister": "sister-a",
  "uploadedAt": "2025-10-26T...",
  "storage_provider": "local"
}
```

### File Structure After Upload
```
uploads/
  wedding_gallery/
    sister_a/
      originalname_1234567890_abc123.jpg
      photo2_1234567891_def456.jpg
    sister_b/
      photo1_1234567892_ghi789.jpg
```

## Next Steps After Successful Upload

1. **Process photos for face detection**
2. **View detected guests in Face Detection Admin**
3. **Test "Find My Photos" feature with a selfie**
4. **Verify gallery display on main wedding pages**

---

✨ **Ready to Test!** Start by logging in and uploading a test photo to verify everything works.

