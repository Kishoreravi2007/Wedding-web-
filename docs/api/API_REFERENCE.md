# 📡 API Reference Guide

## Base URLs
- **Development:** `http://localhost:5001`
- **Production:** `https://your-backend.onrender.com`

---

## 🔐 Authentication

### Headers
```bash
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

---

## 🎯 Face Recognition Endpoints

### POST `/api/recognize`
Find photos containing a specific face using uploaded image.

**Parameters:**
- `file` (multipart) - Face image file (JPG, PNG, HEIC)
- `wedding_name` (form) - Wedding event ("sister_a" or "sister_b")

**Request Example:**
```bash
curl -X POST \
  http://localhost:5001/api/recognize \
  -F "file=@face-photo.jpg" \
  -F "wedding_name=sister_a"
```

**Response:**
```json
{
  "message": "Photos found!",
  "matches": [
    "https://backend.com/uploads/wedding_gallery/sister_a/IMG_001.jpg",
    "https://backend.com/uploads/wedding_gallery/sister_a/IMG_002.jpg"
  ],
  "wedding": "sister_a",
  "total": 2,
  "note": "Simulated face recognition - for production use DeepFace"
}
```

**Error Responses:**
```json
// Invalid wedding name
{
  "message": "Invalid wedding_name. Must be sister_a or sister_b",
  "status": 400
}

// No image provided
{
  "message": "No image file provided",
  "status": 400
}

// Recognition failed
{
  "message": "Face recognition failed",
  "error": "Error details...",
  "status": 500
}
```

---

## 📸 Photo Management Endpoints

### GET `/api/photos`
Get all photos for a specific wedding.

**Query Parameters:**
- `wedding` (optional) - Filter by wedding ("sister_a", "sister_b")
- `limit` (optional) - Number of photos to return (default: 50)
- `offset` (optional) - Pagination offset (default: 0)

**Response:**
```json
{
  "photos": [
    {
      "id": "uuid-1",
      "filename": "IMG_001.jpg",
      "url": "https://backend.com/uploads/wedding_gallery/sister_a/IMG_001.jpg",
      "wedding": "sister_a",
      "uploaded_at": "2024-10-25T10:30:00Z",
      "size": 2048576,
      "face_count": 3
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

### POST `/api/photos/upload`
Upload new photos to wedding gallery.

**Headers:**
```bash
Authorization: Bearer <photographer-token>
Content-Type: multipart/form-data
```

**Parameters:**
- `files` (multipart) - Array of photo files
- `wedding_name` (form) - Wedding event
- `photographer_id` (form) - Photographer identifier

**Response:**
```json
{
  "message": "Photos uploaded successfully",
  "uploaded": [
    {
      "filename": "IMG_001.jpg",
      "url": "https://backend.com/uploads/wedding_gallery/sister_a/IMG_001.jpg",
      "id": "uuid-1"
    }
  ],
  "total": 5,
  "failed": []
}
```

### DELETE `/api/photos/:id`
Delete a photo from gallery.

**Response:**
```json
{
  "message": "Photo deleted successfully",
  "deleted_id": "uuid-1"
}
```

---

## 💌 Wishes Endpoints

### GET `/api/wishes`
Get all wedding wishes and messages.

**Query Parameters:**
- `wedding` (optional) - Filter by wedding
- `status` (optional) - Filter by status ("approved", "pending", "rejected")

**Response:**
```json
{
  "wishes": [
    {
      "id": "uuid-1",
      "name": "John Doe",
      "message": "Congratulations on your special day!",
      "wedding": "sister_a",
      "status": "approved",
      "created_at": "2024-10-25T10:30:00Z"
    }
  ],
  "total": 25
}
```

### POST `/api/wishes`
Submit a new wedding wish.

**Request:**
```json
{
  "name": "Guest Name",
  "message": "Your wedding message here...",
  "wedding": "sister_a",
  "email": "guest@example.com" // optional
}
```

**Response:**
```json
{
  "message": "Wish submitted successfully",
  "wish_id": "uuid-1",
  "status": "pending"
}
```

---

## 👤 Face Detection Endpoints

### POST `/api/faces/detect`
Detect faces in uploaded image.

**Parameters:**
- `file` (multipart) - Image file

**Response:**
```json
{
  "faces": [
    {
      "box": {
        "x": 150,
        "y": 200,
        "width": 120,
        "height": 140
      },
      "confidence": 0.95,
      "landmarks": {
        "leftEye": [165, 220],
        "rightEye": [195, 218],
        "nose": [180, 235],
        "mouth": [178, 255]
      },
      "descriptor": [0.1, 0.2, 0.3, ...] // 128D face embedding
    }
  ],
  "total_faces": 1
}
```

### POST `/api/faces/compare`
Compare two face descriptors for similarity.

**Request:**
```json
{
  "descriptor1": [0.1, 0.2, 0.3, ...],
  "descriptor2": [0.15, 0.18, 0.31, ...]
}
```

**Response:**
```json
{
  "distance": 0.45,
  "similarity": 0.55,
  "is_match": false,
  "threshold": 0.6
}
```

---

## 🔧 System Endpoints

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-25T10:30:00Z",
  "version": "2.0.0",
  "services": {
    "database": "connected",
    "storage": "available",
    "face_recognition": "ready"
  }
}
```

### GET `/api/stats`
Get system statistics.

**Response:**
```json
{
  "total_photos": 1250,
  "total_faces_detected": 3420,
  "total_wishes": 89,
  "weddings": {
    "sister_a": {
      "photos": 580,
      "faces": 1640,
      "wishes": 45
    },
    "sister_b": {
      "photos": 670,
      "faces": 1780,
      "wishes": 44
    }
  },
  "last_updated": "2024-10-25T10:30:00Z"
}
```

---

## 📁 Static File Endpoints

### GET `/uploads/wedding_gallery/{wedding}/{filename}`
Direct access to photo files.

**Example:**
```
GET /uploads/wedding_gallery/sister_a/IMG_001.jpg
```

**Response:** Image file with appropriate headers

---

## 🚫 Error Handling

### Error Response Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {}, // Additional error context
  "timestamp": "2024-10-25T10:30:00Z"
}
```

### Common Error Codes
- `INVALID_FILE_TYPE` - Unsupported file format
- `FILE_TOO_LARGE` - File exceeds size limit
- `FACE_NOT_DETECTED` - No face found in image
- `INVALID_WEDDING` - Invalid wedding name
- `UNAUTHORIZED` - Authentication required
- `RATE_LIMITED` - Too many requests
- `SERVER_ERROR` - Internal server error

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `413` - Payload Too Large
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## 📊 Rate Limiting

### Limits
- **Face Recognition:** 10 requests/minute per IP
- **Photo Upload:** 5 requests/minute per user
- **Wishes:** 3 requests/minute per IP
- **General API:** 100 requests/minute per IP

### Headers
```bash
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1635724800
```

---

## 🔒 CORS Configuration

### Allowed Origins
- `http://localhost:3000` (development)
- `https://weddingweb.co.in` (production)
- Additional configured domains

### Allowed Methods
- `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`

### Allowed Headers
- `Content-Type`, `Authorization`, `X-Requested-With`

---

## 📝 Request Examples

### JavaScript/TypeScript
```typescript
// Face recognition
const formData = new FormData();
formData.append('file', faceImageBlob);
formData.append('wedding_name', 'sister_a');

const response = await fetch('/api/recognize', {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

### Python
```python
import requests

# Upload photo for face recognition
files = {'file': open('face.jpg', 'rb')}
data = {'wedding_name': 'sister_a'}

response = requests.post(
    'http://localhost:5001/api/recognize',
    files=files,
    data=data
)

result = response.json()
```

### cURL
```bash
# Get photos
curl -X GET "http://localhost:5001/api/photos?wedding=sister_a&limit=10"

# Submit wish
curl -X POST "http://localhost:5001/api/wishes" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","message":"Congrats!","wedding":"sister_a"}'
```

---

## 🧪 Testing

### Test Environment
- **Base URL:** `http://localhost:5001`
- **Test Data:** Sample photos and faces available
- **Authentication:** Test tokens provided

### Sample Test Requests
```bash
# Test face recognition with sample image
curl -X POST http://localhost:5001/api/recognize \
  -F "file=@test-images/sample-face.jpg" \
  -F "wedding_name=sister_a"

# Test health check
curl http://localhost:5001/api/health
```

---

**API Version:** 2.0.0  
**Last Updated:** October 2024
