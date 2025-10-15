# Face Recognition System - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Node.js 16+ installed
- Supabase account and project
- Wedding photo gallery project set up

### Step 1: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies  
cd ../frontend
npm install
```

### Step 2: Database Setup

Run the face recognition migration:

```bash
cd backend
node supabase/run-migration.js
```

This creates:
- `people` table
- `face_descriptors` table
- `photo_faces` table
- Necessary indexes and views

### Step 3: Environment Variables

Ensure your `.env` files have:

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SUPABASE_URL=your_supabase_url
```

### Step 4: Download Face Detection Models

The face detection models are already in `frontend/public/models/`. If missing, download from:
- [face-api.js models](https://github.com/justadudewhohacks/face-api.js-models)

Required models:
- `tiny_face_detector_model`
- `face_landmark_68_model`
- `face_recognition_model`
- `face_expression_model`

### Step 5: Start Servers

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 6: Add People to Database

1. Navigate to photographer dashboard
2. Go to "People Management"
3. Add wedding attendees:
   - Name
   - Role (bride, groom, family, friend)
   - Wedding association

### Step 7: Upload Photos

1. Go to "Upload Photos" tab
2. Select event type
3. Choose photos (max 20 at once)
4. System automatically detects faces
5. Upload and wait for processing

### Step 8: Verify Results

1. Check "Analytics" to see processing stats
2. Go to "Face Verification" for unidentified faces
3. Manually verify any low-confidence matches
4. View person-specific galleries

## 🎯 Usage Examples

### For Photographers

#### Upload and Process Photos
```
1. Login to photographer portal
2. Select event type (engagement, ceremony, etc.)
3. Drag and drop photos or click to select
4. Wait for automatic face detection
5. Click "Upload" - faces are automatically matched
6. Review unidentified faces and verify manually
```

#### Manage People Database
```
1. Go to "People Management" tab
2. Click "Add Person"
3. Enter: Name, Role, Wedding
4. Optionally add reference photos
5. System uses these for future recognition
```

#### Verify Faces
```
1. Open "Face Verification" panel
2. Review "Unidentified" faces
3. Click on a face
4. Search and select the correct person
5. Click "Verify Identity"
6. System learns from verification
```

### For Guests

#### Find Your Photos
```
1. Visit gallery page
2. Search your name in search bar
3. View all photos you appear in
4. Download or share photos
5. Filter by event or confidence
```

### For Developers

#### Use Enhanced Photo Upload API

```javascript
const formData = new FormData();
formData.append('photo', file);
formData.append('sister', 'sister-a');
formData.append('eventType', 'ceremony');
formData.append('faceDescriptors', JSON.stringify(descriptors));

const response = await fetch('/api/photos-enhanced/upload', {
  method: 'POST',
  headers: getAuthHeaders(false),
  body: formData
});

const result = await response.json();
console.log('Uploaded:', result.photo);
console.log('Faces detected:', result.faceProcessing.detectedFaces);
console.log('Faces identified:', result.faceProcessing.identifiedFaces);
```

#### Get Person's Photos

```javascript
const personId = 'uuid-here';
const minConfidence = 0.6;

const response = await fetch(
  `/api/photos-enhanced/by-person/${personId}?minConfidence=${minConfidence}`,
  { headers: getAuthHeaders() }
);

const data = await response.json();
console.log(`Found ${data.photos.length} photos of ${personId}`);
```

#### Process Faces in Existing Photos

```javascript
// Detect faces client-side
const detections = await faceapi
  .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptors();

// Extract descriptors
const faceDescriptors = detections.map(d => ({
  descriptor: Array.from(d.descriptor),
  boundingBox: {
    x: (d.detection.box.x / image.width) * 100,
    y: (d.detection.box.y / image.height) * 100,
    width: (d.detection.box.width / image.width) * 100,
    height: (d.detection.box.height / image.height) * 100
  }
}));

// Send to backend
await fetch(`/api/photos-enhanced/${photoId}/process-faces`, {
  method: 'POST',
  headers: getAuthHeaders(),
  body: JSON.stringify({ faceDescriptors })
});
```

## 🔧 Configuration Tips

### Adjust Detection Sensitivity

Lower threshold = more matches but less accurate:
```javascript
// In face-api.js detection
new faceapi.TinyFaceDetectorOptions({ 
  scoreThreshold: 0.2  // Lower = more sensitive (default: 0.3)
})
```

### Adjust Recognition Threshold

Lower threshold = match more faces but risk false positives:
```javascript
// In backend processing
processSinglePhoto(photoId, descriptors, {
  confidenceThreshold: 0.5  // Lower = more matches (default: 0.6)
})
```

### Optimize Performance

For large photo libraries:
```javascript
// Reduce concurrent processing
processBatch(photos, {
  concurrency: 2  // Lower = less load (default: 3)
})

// Reduce face detection size
new faceapi.TinyFaceDetectorOptions({
  inputSize: 320  // Smaller = faster (default: 416)
})
```

## 📊 Monitoring & Troubleshooting

### Check System Health

1. **Analytics Dashboard**: View processing statistics
   - Success rate should be > 85%
   - Unidentified faces < 15%
   - Average processing time < 2000ms

2. **Database Queries**:
```sql
-- Check face detection coverage
SELECT 
  COUNT(DISTINCT photo_id) as photos_with_faces,
  COUNT(*) as total_faces
FROM photo_faces;

-- Check identification rate
SELECT 
  COUNT(CASE WHEN person_id IS NOT NULL THEN 1 END) as identified,
  COUNT(*) as total
FROM photo_faces;

-- Check per-person coverage
SELECT 
  p.name,
  COUNT(DISTINCT pf.photo_id) as photo_count
FROM people p
LEFT JOIN photo_faces pf ON p.id = pf.person_id
GROUP BY p.id, p.name
ORDER BY photo_count DESC;
```

### Common Issues

**Issue: No faces detected**
- Check if models are loaded
- Verify photo quality
- Try lowering scoreThreshold

**Issue: Wrong person identified**
- Add more reference photos
- Manually verify and retrain
- Check for similar-looking people

**Issue: Slow processing**
- Reduce batch size
- Lower concurrency
- Optimize image sizes

**Issue: High memory usage**
- Process smaller batches
- Clean up canvases/images
- Restart service periodically

## 🎓 Learning Path

### Beginner
1. Upload a few test photos
2. Add 3-5 people to database
3. Verify automatic identifications
4. Explore person galleries

### Intermediate
1. Upload batch of 20+ photos
2. Adjust confidence thresholds
3. Manually verify unidentified faces
4. Export analytics reports

### Advanced
1. Integrate API into custom workflows
2. Set up automated batch processing
3. Customize matching algorithms
4. Implement custom quality checks

## 📚 Next Steps

- Read full documentation: `FACE_RECOGNITION_SYSTEM.md`
- Explore API endpoints
- Customize UI components
- Set up automated backups
- Configure monitoring alerts

## 💡 Pro Tips

1. **Always upload reference photos first** - Add clear photos of key people before batch uploading event photos

2. **Use consistent naming** - Keep person names consistent across the database

3. **Verify regularly** - Review and verify identifications weekly for best accuracy

4. **Quality over quantity** - Better to have 3 clear reference photos than 10 poor ones

5. **Monitor analytics** - Check the analytics dashboard to identify issues early

6. **Backup descriptors** - Export face descriptors periodically as backup

7. **Test with samples** - Always test with a few photos before bulk upload

8. **Set realistic thresholds** - Start with default thresholds and adjust based on results

## 🆘 Getting Help

1. Check the error message in browser console
2. Review backend logs
3. Consult full documentation
4. Test with sample photos
5. Verify database migrations
6. Check API endpoints with Postman

## 📝 Checklist

Before going live:

- [ ] Database migrations run successfully
- [ ] Face detection models downloaded
- [ ] Environment variables configured
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Can add people to database
- [ ] Can upload photos with face detection
- [ ] Faces are being identified correctly
- [ ] Analytics dashboard shows data
- [ ] Can verify unidentified faces
- [ ] Person galleries display correctly
- [ ] Download/share features work
- [ ] Performance is acceptable

---

**Ready to go!** Start by adding a few people and uploading test photos. The system learns and improves as you verify more identifications.

