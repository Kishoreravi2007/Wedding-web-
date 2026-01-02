# InsightFace API Guide

## Overview

The InsightFace API provides server-side face detection and embedding extraction using the `buffalo_l` model. This replaces face-api.js with more accurate 512-dimension embeddings.

## Starting the Server

### Option 1: Using the startup script (Recommended)

```bash
cd backend
./start_insightface_api.sh
```

### Option 2: Manual startup

```bash
cd backend
source venv_insightface/bin/activate
python -m uvicorn insightface_api:app --host 0.0.0.0 --port 8001 --reload
```

The API will be available at:
- **API**: http://localhost:8001
- **Documentation**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/health

## API Endpoints

### 1. Health Check

**GET** `/health`

Check if the API is running and processor is initialized.

**Response:**
```json
{
  "status": "healthy",
  "processor_initialized": true,
  "model": "buffalo_l",
  "embedding_dimension": 512
}
```

### 2. Detect Faces

**POST** `/api/faces/detect`

Detect all faces in an uploaded image and extract 512-dimension embeddings.

**Request:**
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (required): Image file (JPEG, PNG, etc.)
  - `return_landmarks` (optional, default: false): Return facial landmarks
  - `return_age_gender` (optional, default: true): Return age and gender estimates
  - `min_confidence` (optional): Minimum detection confidence (0-1)

**Example using curl:**
```bash
curl -X POST "http://localhost:8001/api/faces/detect" \
  -F "file=@group_photo.jpg" \
  -F "return_landmarks=true" \
  -F "return_age_gender=true"
```

**Response:**
```json
{
  "faces": [
    {
      "bbox": [239, 431, 444, 676],
      "embedding": [0.024, -0.007, ...],  // 512 dimensions
      "det_score": 0.8676,
      "age": 24,
      "gender": "male",
      "landmark": [[x1, y1], [x2, y2], ...]  // if requested
    }
  ],
  "count": 1,
  "embedding_dimension": 512,
  "model": "buffalo_l"
}
```

### 3. Batch Detection

**POST** `/api/faces/detect-batch`

Process multiple images at once.

**Request:**
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `files` (required): Multiple image files
  - `return_landmarks` (optional): Return facial landmarks
  - `return_age_gender` (optional): Return age and gender
  - `min_confidence` (optional): Minimum confidence threshold

**Example using curl:**
```bash
curl -X POST "http://localhost:8001/api/faces/detect-batch" \
  -F "files=@photo1.jpg" \
  -F "files=@photo2.jpg" \
  -F "files=@photo3.jpg"
```

**Response:**
```json
{
  "results": [
    {
      "filename": "photo1.jpg",
      "success": true,
      "faces": [...],
      "count": 5
    },
    {
      "filename": "photo2.jpg",
      "success": true,
      "faces": [...],
      "count": 3
    }
  ],
  "total_images": 2,
  "embedding_dimension": 512,
  "model": "buffalo_l"
}
```

### 4. Compare Faces

**POST** `/api/faces/compare`

Compare two images to see if they contain the same person.

**Request:**
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file1` (required): First image
  - `file2` (required): Second image
  - `threshold` (optional, default: 0.6): Similarity threshold

**Example using curl:**
```bash
curl -X POST "http://localhost:8001/api/faces/compare" \
  -F "file1=@person1.jpg" \
  -F "file2=@person2.jpg" \
  -F "threshold=0.6"
```

**Response:**
```json
{
  "match": true,
  "similarity": 0.85,
  "threshold": 0.6,
  "faces_in_image1": 1,
  "faces_in_image2": 1,
  "best_match_face1_index": 0,
  "best_match_face2_index": 0
}
```

## Frontend Integration

### Replace face-api.js with InsightFace API

**Before (face-api.js):**
```javascript
const detections = await faceapi
  .detectAllFaces(image)
  .withFaceLandmarks()
  .withFaceDescriptors();

const descriptor = detections[0].descriptor; // 128 dimensions
```

**After (InsightFace API):**
```javascript
const formData = new FormData();
formData.append('file', imageFile);
formData.append('return_landmarks', 'true');
formData.append('return_age_gender', 'true');

const response = await fetch('http://localhost:8001/api/faces/detect', {
  method: 'POST',
  body: formData
});

const data = await response.json();
const embedding = data.faces[0].embedding; // 512 dimensions
const age = data.faces[0].age;
const gender = data.faces[0].gender;
```

### Example: React Component

```javascript
import React, { useState } from 'react';

function FaceDetection() {
  const [faces, setFaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('return_age_gender', 'true');

    try {
      const response = await fetch('http://localhost:8001/api/faces/detect', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setFaces(data.faces);
    } catch (error) {
      console.error('Error detecting faces:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      {loading && <p>Detecting faces...</p>}
      {faces.length > 0 && (
        <div>
          <p>Detected {faces.length} face(s)</p>
          {faces.map((face, i) => (
            <div key={i}>
              <p>Face {i + 1}: {face.age} years old, {face.gender}</p>
              <p>Confidence: {(face.det_score * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Integration with Existing Backend

### Option 1: Run as Separate Service

Run InsightFace API on port 8001 alongside your existing backend:

```bash
# Terminal 1: Existing backend
cd backend
node server.js

# Terminal 2: InsightFace API
cd backend
./start_insightface_api.sh
```

### Option 2: Integrate into Existing FastAPI

You can add the InsightFace endpoints to your existing `main.py`:

```python
from insightface_processor import InsightFaceProcessor

# Initialize processor
processor = InsightFaceProcessor()

# Add endpoints to existing app
@app.post("/api/faces/detect")
async def detect_faces(file: UploadFile = File(...)):
    # ... use processor here
    pass
```

## Performance Tips

1. **Batch Processing**: Use `/api/faces/detect-batch` for multiple images
2. **Confidence Filtering**: Set `min_confidence` to filter low-quality detections
3. **GPU Acceleration**: The API automatically uses GPU if available
4. **Caching**: Consider caching embeddings for frequently accessed images

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid image, missing parameters)
- `500`: Server error
- `503`: Service unavailable (processor not initialized)

## Next Steps

1. **Test the API**: Use the interactive docs at http://localhost:8001/docs
2. **Update Frontend**: Replace face-api.js calls with API calls
3. **Store Embeddings**: Save 512-dim embeddings to your database
4. **Face Matching**: Use embeddings for face recognition/search

## Troubleshooting

### Processor Not Initialized

If you see `503 Service Unavailable`:
- Check that the virtual environment is activated
- Verify InsightFace is installed: `pip list | grep insightface`
- Check logs for initialization errors

### Slow Performance

- First run downloads the model (~300MB) - this is one-time
- Use GPU if available (automatically detected)
- Consider increasing `det_size` for better accuracy (slower) or decreasing for speed

### Import Errors

Make sure `insightface_processor.py` is in the same directory as `insightface_api.py`.

