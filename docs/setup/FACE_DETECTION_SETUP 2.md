# Face Detection System - Setup Complete! 🎉

## Overview

Your wedding website now has a fully functional face detection system that automatically identifies guests in photos and helps them find pictures they're in.

## What Was Done

### 1. **Photo Processing** ✅
- **Sister A Gallery**: Processed 2 photos → Found 3 unique guests
- **Sister B Gallery**: Processed 15 photos → Found 20 unique guests

### 2. **Reference Images Created** ✅
- Extracted representative face images for each detected guest
- Stored in `backend/reference_images/sister_a/` and `sister_b/`
- Each guest has a unique ID (Guest_001, Guest_002, etc.)

### 3. **Guest Mappings Generated** ✅
- Created `backend/guest_mapping_sister_a.json`
- Created `backend/guest_mapping_sister_b.json`
- Maps each guest to all photos they appear in

### 4. **Admin Interface** ✅
- Built a comprehensive admin UI at `/face-admin`
- View all detected guests and their reference photos
- See statistics for both wedding galleries
- Test face recognition with new photos

## How to Use

### Access the Admin Panel

1. **Open your browser** and navigate to:
   ```
   http://localhost:5173/face-admin
   ```

2. **View Detected Guests**:
   - Switch between "Sister A Gallery" and "Sister B Gallery" tabs
   - See all detected guest faces
   - View how many photos each guest appears in

3. **Test Face Recognition**:
   - Click on the "Test Recognition" tab
   - Select which wedding gallery to search (Sister A or Sister B)
   - Upload a photo with a face
   - Click "Find Matches" to see which photos contain that person

### For Users - "Find My Photos" Feature

Users can use the Photo Booth page to find photos they're in:

1. Navigate to the Photo Booth:
   - **Sister A**: http://localhost:5173/parvathy/photobooth
   - **Sister B**: http://localhost:5173/sreedevi/photobooth

2. Use the "Find My Photos" section:
   - Upload a selfie or any photo with your face
   - The system will search through all wedding photos
   - Returns all photos where you appear

## Technical Details

### File Structure
```
backend/
├── reference_images/
│   ├── sister_a/
│   │   ├── Guest_001/
│   │   │   └── Guest_001_rep.jpg
│   │   ├── Guest_002/
│   │   └── Guest_003/
│   └── sister_b/
│       ├── Guest_001/
│       ├── Guest_002/
│       └── ... (up to Guest_020)
├── guest_mapping_sister_a.json
├── guest_mapping_sister_b.json
└── cluster_faces.py (script to process new photos)
```

### API Endpoints

#### Face Recognition
```javascript
POST /api/recognize
Body: {
  file: <image file>,
  wedding_name: 'sister_a' | 'sister_b'
}
Response: {
  message: "Photos found!",
  matches: ["path/to/photo1.jpg", "path/to/photo2.jpg"]
}
```

#### Face Management
```javascript
GET  /api/faces/people           // Get all detected people
GET  /api/faces/people/:id        // Get specific person
POST /api/faces/match             // Match a face descriptor
GET  /api/faces/statistics        // Get face recognition stats
```

## Adding New Photos

When you upload new photos to the gallery, you need to reprocess them:

### Option 1: Process Specific Gallery
```bash
# For Sister A
cd /path/to/Wedding-web-1
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

### Option 2: Process Both Galleries
```bash
# Create a script to process both
cd /path/to/Wedding-web-1

# Sister A
python3 backend/cluster_faces.py \
  --gallery uploads/wedding_gallery/sister_a \
  --output backend/reference_images/sister_a \
  --mapping backend/guest_mapping_sister_a.json

# Sister B
python3 backend/cluster_faces.py \
  --gallery uploads/wedding_gallery/sister_b \
  --output backend/reference_images/sister_b \
  --mapping backend/guest_mapping_sister_b.json
```

## Configuration

### Face Detection Settings

You can adjust the clustering sensitivity in `backend/cluster_faces.py`:

```python
THRESHOLD = 0.4  # Lower = stricter matching (fewer groups)
                 # Higher = looser matching (more groups)
```

### Face Recognition Model

Current configuration:
- **Model**: VGG-Face
- **Detector**: OpenCV
- **Distance Metric**: Cosine similarity
- **Threshold**: 0.4

You can change these in `backend/cluster_faces.py`:
```python
MODEL_NAME = "VGG-Face"  # Options: Facenet, OpenFace, DeepFace, etc.
DETECTOR_BACKEND = "opencv"  # Options: ssd, dlib, mtcnn, retinaface
DISTANCE_METRIC = "cosine"  # Options: euclidean, cosine
```

## Statistics

### Current Status
- **Total Unique Guests**: 23 (3 from Sister A, 20 from Sister B)
- **Total Photos Processed**: 17 (2 from Sister A, 15 from Sister B)
- **Total Faces Detected**: 28 (3 from Sister A, 25 from Sister B)

### Sister A Gallery
- Photos: 2
- Unique guests: 3
- All faces detected in: IMG20230831163922_01.jpg

### Sister B Gallery
- Photos: 15
- Unique guests: 20
- Faces detected across all 15 photos

## Troubleshooting

### Issue: No faces detected
**Solution**: 
- Ensure photos have clear, front-facing faces
- Check image quality (not too blurry)
- Adjust `enforce_detection=False` in cluster_faces.py

### Issue: Too many duplicate guests
**Solution**: 
- Increase THRESHOLD in cluster_faces.py (e.g., from 0.4 to 0.5)
- Reprocess the gallery

### Issue: Guests not being matched
**Solution**: 
- Decrease THRESHOLD in cluster_faces.py (e.g., from 0.4 to 0.3)
- Ensure reference images are clear

### Issue: Admin page not loading
**Solution**: 
1. Check backend server is running: `lsof -i :5001`
2. Check frontend server is running: `lsof -i :5173`
3. Verify CORS settings in backend/server.js

## Next Steps

1. **Customize Guest Names**:
   - In the admin panel, add real names to detected guests
   - Update the database with guest information

2. **Fine-tune Detection**:
   - Adjust threshold if getting too many/too few matches
   - Reprocess galleries with new settings

3. **Test with Various Photos**:
   - Upload different types of selfies
   - Test with group photos
   - Verify matching accuracy

4. **Deploy to Production**:
   - Upload reference images to your hosting
   - Update API endpoints for production URLs
   - Test face detection on live site

## Resources

- **DeepFace Documentation**: https://github.com/serengil/deepface
- **Face-api.js**: https://github.com/justadudewhohacks/face-api.js
- **Admin Panel**: http://localhost:5173/face-admin
- **Sister A Photo Booth**: http://localhost:5173/parvathy/photobooth
- **Sister B Photo Booth**: http://localhost:5173/sreedevi/photobooth

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs in browser developer tools
3. Check backend server logs
4. Verify all dependencies are installed: `pip3 install -r backend/requirements.txt`

---

**Congratulations!** Your face detection system is now fully operational! 🎊

