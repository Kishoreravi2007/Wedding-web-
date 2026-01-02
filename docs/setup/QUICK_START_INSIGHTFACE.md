# Quick Start: InsightFace Face Detection

## ✅ Installation Complete!

All dependencies have been installed in the virtual environment.

## Using the Script

### Activate the Virtual Environment

```bash
cd backend
source venv_insightface/bin/activate
```

### Test with an Image

```bash
# Using the test script
python test_insightface.py path/to/your/group_photo.jpg

# Or using the main processor script
python insightface_processor.py path/to/your/group_photo.jpg --output annotated.jpg
```

### Example Usage in Python

```python
from insightface_processor import InsightFaceProcessor

# Initialize processor
processor = InsightFaceProcessor(model_name='buffalo_l')

# Detect faces and extract embeddings
face_data = processor.detect_faces('group_photo.jpg')

# Each face has:
# - 'embedding': 512-dimension list
# - 'bbox': [x1, y1, x2, y2] bounding box
# - 'det_score': confidence score
# - 'landmark', 'age', 'gender': optional

print(f"Detected {len(face_data)} faces")
for i, face in enumerate(face_data):
    print(f"Face {i+1}: {len(face['embedding'])}-dim embedding")
```

## Important Notes

- **First run**: The `buffalo_l` model (~300MB) will be automatically downloaded
- **Virtual environment**: Always activate `venv_insightface` before using
- **Python version**: Uses Python 3.12 (required for onnxruntime support)

## Next Steps

1. Test with a sample image to verify everything works
2. Integrate into your FastAPI backend (see `INSIGHTFACE_README.md`)
3. Replace face-api.js calls with InsightFace backend endpoints

