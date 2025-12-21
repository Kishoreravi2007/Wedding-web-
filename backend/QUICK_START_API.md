# Quick Start: InsightFace API

## 🚀 Start the API Server

```bash
cd backend
./start_insightface_api.sh
```

The API will start on **http://localhost:8001**

## 📖 Interactive Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🧪 Test the API

### Option 1: Using the test script

```bash
cd backend
source venv_insightface/bin/activate
python test_insightface_api.py "/path/to/your/image.jpg"
```

### Option 2: Using curl

```bash
# Health check
curl http://localhost:8001/health

# Detect faces
curl -X POST "http://localhost:8001/api/faces/detect" \
  -F "file=@/path/to/your/image.jpg" \
  -F "return_age_gender=true"
```

### Option 3: Using the interactive docs

1. Open http://localhost:8001/docs
2. Click on `/api/faces/detect`
3. Click "Try it out"
4. Upload an image file
5. Click "Execute"

## 📝 Example Response

```json
{
  "faces": [
    {
      "bbox": [239, 431, 444, 676],
      "embedding": [0.024, -0.007, ...],  // 512 dimensions
      "det_score": 0.8676,
      "age": 24,
      "gender": "male"
    }
  ],
  "count": 1,
  "embedding_dimension": 512,
  "model": "buffalo_l"
}
```

## 🔗 Frontend Integration

Replace face-api.js calls with API calls:

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8001/api/faces/detect', {
  method: 'POST',
  body: formData
});

const data = await response.json();
const embedding = data.faces[0].embedding; // 512 dimensions
```

## 📚 Full Documentation

See `INSIGHTFACE_API_GUIDE.md` for complete API documentation.

