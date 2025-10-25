# 🎭 Face Detection Troubleshooting Guide

## Quick Start
1. Run: `./start-face-detection-test.sh`
2. Open the test page that appears
3. Check console output for errors

## Common Issues & Solutions

### 1. Models Not Loading
**Symptoms:** "Failed to load models" or blank detection
**Solutions:**
- ✅ Verify models exist: `ls frontend/public/models/`
- ✅ Check browser console for 404 errors
- ✅ Try accessing: `http://localhost:8080/models/tiny_face_detector_model-weights_manifest.json`
- ✅ Run: `cd backend && node setup-face-models.js` to download models

### 2. Camera Access Denied
**Symptoms:** "Failed to access webcam"
**Solutions:**
- ✅ Use HTTPS or localhost (required for camera access)
- ✅ Check browser permissions (camera icon in address bar)
- ✅ Try different browser (Chrome works best)
- ✅ Close other apps using camera

### 3. No Face Detection
**Symptoms:** Camera works but no faces detected
**Solutions:**
- ✅ Ensure good lighting on your face
- ✅ Position face in center of camera view
- ✅ Try different distances from camera
- ✅ Check scoreThreshold settings (lower = more sensitive)

### 4. Backend /api/recognize Errors
**Symptoms:** "Find My Photos" fails
**Solutions:**
- ✅ Ensure backend server is running on port 5000
- ✅ Check if multer is installed: `cd backend && npm list multer`
- ✅ Verify CORS settings allow frontend domain
- ✅ Check backend console for errors

### 5. CORS Errors
**Symptoms:** Network errors when calling API
**Solutions:**
- ✅ Update backend/server.js CORS settings
- ✅ Ensure frontend and backend URLs match
- ✅ Check browser developer tools Network tab

## Testing Steps

### Basic Test (Standalone HTML)
1. Open `test-face-detection.html` directly in browser
2. Click "Test Photo" - should detect simple drawn face
3. Click "Start Webcam" - should detect your face
4. Check console output for detailed logs

### Integration Test (Main App)
1. Start both servers: `./start-face-detection-test.sh`
2. Go to `http://localhost:8080`
3. Navigate to Photo Booth
4. Test face detection and "Find My Photos"

### Model Loading Test
```javascript
// Open browser console and run:
console.log('TinyFaceDetector loaded:', faceapi.nets.tinyFaceDetector.isLoaded);
console.log('FaceLandmark68Net loaded:', faceapi.nets.faceLandmark68Net.isLoaded);
console.log('FaceRecognitionNet loaded:', faceapi.nets.faceRecognitionNet.isLoaded);
```

## Configuration Settings

### Optimal Face Detection Settings
```javascript
// For webcam (real-time)
new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,
  scoreThreshold: 0.4
});

// For photos (high accuracy)
new faceapi.TinyFaceDetectorOptions({
  inputSize: 512,
  scoreThreshold: 0.3
});

// For difficult conditions (more sensitive)
new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.2
});
```

### Environment Variables
Ensure these are set in `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:5000
VITE_ENABLE_FACE_RECOGNITION=true
VITE_ENABLE_AUTO_FACE_DETECTION=true
```

## Performance Tips

### For Better Detection:
- 📸 Use good lighting (face well-lit, avoid backlighting)
- 📐 Keep face upright and centered
- 📏 Maintain reasonable distance (not too close/far)
- 🎯 Look directly at camera
- 📱 Use Chrome browser for best performance

### For Faster Processing:
- Lower inputSize (320 vs 512)
- Higher scoreThreshold (0.5 vs 0.2)
- Reduce detection frequency in video loop

## Debug Information

### Check Model Files
```bash
# Should show all these files:
ls frontend/public/models/
# - tiny_face_detector_model-weights_manifest.json
# - tiny_face_detector_model-shard1
# - face_landmark_68_model-weights_manifest.json
# - face_landmark_68_model-shard1
# - face_recognition_model-weights_manifest.json
# - face_recognition_model-shard1
# - face_recognition_model-shard2
# - face_expression_model-weights_manifest.json
# - face_expression_model-shard1
```

### Browser Console Commands
```javascript
// Test model loading
await faceapi.nets.tinyFaceDetector.loadFromUri('/models');

// Test detection on current video element
const video = document.querySelector('video');
const detections = await faceapi.detectAllFaces(video);
console.log('Detections:', detections);
```

## Getting Help

1. **Check Browser Console** (F12) for detailed error messages
2. **Check Server Logs** for backend errors
3. **Test with Standalone HTML** to isolate issues
4. **Verify Model Files** are accessible
5. **Test Camera Permissions** in browser settings

## Success Indicators

✅ Models load without 404 errors  
✅ Camera permission granted  
✅ Green bounding boxes appear around faces  
✅ "Find My Photos" returns sample results  
✅ Console shows successful detection logs  

If all tests pass, your face detection is working correctly! 🎉
