# InsightFace Face Detection and Embedding Extraction

This module provides a Python implementation using InsightFace with the `buffalo_l` model to detect faces in group photos and extract 512-dimension embeddings. It uses `onnxruntime` for fast inference.

## Features

- ✅ Detects all faces in group photos
- ✅ Extracts 512-dimension normalized embeddings for each face
- ✅ Uses `buffalo_l` model (state-of-the-art accuracy)
- ✅ Fast inference with `onnxruntime` (supports GPU acceleration)
- ✅ Additional features: age estimation, gender detection, facial landmarks
- ✅ Batch processing support
- ✅ Visualization tools

## Installation

**Important**: InsightFace requires `onnxruntime`, which currently supports Python 3.8-3.13. If you're using Python 3.14 or newer, you'll need to use Python 3.11 or 3.12.

1. Install required dependencies:

```bash
# For macOS/Linux
pip3 install insightface onnxruntime opencv-python numpy

# Or if using Python 3.11/3.12 specifically
python3.12 -m pip install insightface onnxruntime opencv-python numpy
```

For GPU acceleration (optional, requires CUDA):

```bash
pip3 install onnxruntime-gpu
```

2. The `buffalo_l` model will be automatically downloaded on first use (~300MB).

## Quick Start

### Basic Usage

```python
from insightface_processor import InsightFaceProcessor

# Initialize processor
processor = InsightFaceProcessor(
    model_name='buffalo_l',
    det_size=(640, 640),  # Detection size (larger = more accurate but slower)
    ctx_id=0  # GPU device ID (-1 for CPU, 0+ for GPU)
)

# Detect faces in an image
face_data = processor.detect_faces('group_photo.jpg')

# Each face_data entry contains:
# - 'bbox': [x1, y1, x2, y2] bounding box
# - 'embedding': 512-dimension normalized embedding (list)
# - 'det_score': Detection confidence score
# - 'landmark': 5-point facial landmarks (optional)
# - 'age': Estimated age (optional)
# - 'gender': Estimated gender (optional)

print(f"Detected {len(face_data)} faces")
for i, face in enumerate(face_data):
    print(f"Face {i+1}: {len(face['embedding'])}-dim embedding")
```

### Command Line Usage

```bash
# Basic detection
python insightface_processor.py group_photo.jpg

# With visualization
python insightface_processor.py group_photo.jpg --output annotated.jpg --show

# Save results as JSON
python insightface_processor.py group_photo.jpg --json results.json

# Use CPU instead of GPU
python insightface_processor.py group_photo.jpg --ctx-id -1
```

### Test Script

```bash
python test_insightface.py group_photo.jpg
```

## API Reference

### `InsightFaceProcessor`

Main class for face detection and embedding extraction.

#### Initialization

```python
processor = InsightFaceProcessor(
    model_name='buffalo_l',           # Model name
    det_size=(640, 640),              # Detection size (width, height)
    ctx_id=0,                         # GPU device ID (-1 for CPU)
    providers=None                     # ONNX providers (auto-detected if None)
)
```

#### Methods

##### `detect_faces(image_path, return_image=False)`

Detect all faces in an image and extract embeddings.

**Parameters:**
- `image_path` (str): Path to image file
- `return_image` (bool): If True, also returns the loaded image array

**Returns:**
- List of dictionaries, each containing face information:
  - `bbox`: [x1, y1, x2, y2] bounding box coordinates
  - `embedding`: 512-dimension normalized embedding (list)
  - `det_score`: Detection confidence score (0-1)
  - `landmark`: 5-point facial landmarks (list of [x, y] pairs)
  - `age`: Estimated age (int, optional)
  - `gender`: Estimated gender (0=female, 1=male, optional)

##### `detect_faces_from_array(image_array)`

Detect faces from a numpy image array (BGR format).

**Parameters:**
- `image_array` (np.ndarray): Image array in BGR format

**Returns:**
- Same format as `detect_faces()`

##### `visualize_faces(image_path, output_path=None, show_image=False)`

Detect faces and draw bounding boxes on the image.

**Parameters:**
- `image_path` (str): Path to input image
- `output_path` (str, optional): Path to save annotated image
- `show_image` (bool): If True, display the image

**Returns:**
- Annotated image as numpy array

##### `process_batch(image_paths, output_json=None)`

Process multiple images in batch.

**Parameters:**
- `image_paths` (List[str]): List of image file paths
- `output_json` (str, optional): Path to save results as JSON

**Returns:**
- Dictionary mapping image paths to their face data lists

## Example: Integration with FastAPI

```python
from fastapi import FastAPI, File, UploadFile
from insightface_processor import InsightFaceProcessor
import numpy as np
import cv2

app = FastAPI()
processor = InsightFaceProcessor()

@app.post("/api/detect-faces")
async def detect_faces_endpoint(file: UploadFile = File(...)):
    # Read uploaded image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Detect faces
    face_data = processor.detect_faces_from_array(img)
    
    return {
        "faces_detected": len(face_data),
        "faces": face_data
    }
```

## Performance Tips

1. **GPU Acceleration**: Use `onnxruntime-gpu` for faster inference on GPU-enabled systems.

2. **Detection Size**: 
   - `(640, 640)`: Balanced (default)
   - `(1280, 1280)`: More accurate, slower
   - `(320, 320)`: Faster, less accurate

3. **Batch Processing**: Use `process_batch()` for processing multiple images efficiently.

4. **CPU Usage**: Set `ctx_id=-1` to force CPU usage (useful for deployment without GPU).

## Model Information

- **Model**: `buffalo_l` (buffalo_l.zip)
- **Face Detection**: RetinaFace-10GF
- **Face Recognition**: ResNet50@WebFace600K
- **Embedding Dimension**: 512
- **License**: Non-commercial research use only

## Comparison with face-api.js

| Feature | face-api.js | InsightFace |
|---------|-------------|------------|
| Detection Accuracy | Good | Excellent |
| Embedding Dimension | 128 | 512 |
| Speed | Fast (browser) | Very Fast (GPU) |
| Group Photos | Good | Excellent |
| Age/Gender | No | Yes |
| Landmarks | Yes | Yes |

## Troubleshooting

### Model Download Issues

If the model fails to download automatically:

1. The model will be downloaded to `~/.insightface/models/` on first use
2. Ensure you have internet connection on first run
3. Model size: ~300MB

### GPU Not Detected

If GPU is not being used:

1. Install `onnxruntime-gpu` instead of `onnxruntime`
2. Ensure CUDA is properly installed
3. Check with: `python -c "import onnxruntime; print(onnxruntime.get_device())"`

### Memory Issues

For large images or many faces:

1. Reduce `det_size` parameter
2. Process images in smaller batches
3. Use CPU if GPU memory is limited

## License

The `buffalo_l` model is for non-commercial research use only. Please check InsightFace license for commercial use.

