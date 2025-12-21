# Face Recognition Processor - Wedding Web

A high-performance face recognition system using `face_recognition` (dlib) library with CNN model for optimal accuracy, especially for detecting faces in background areas of Kerala wedding halls.

## Features

- ✅ **High Accuracy**: Uses CNN model for superior face detection
- ✅ **Gallery Indexing**: Scans folders and indexes all faces
- ✅ **Face Search**: Finds guest photos using selfie
- ✅ **Persistent Storage**: Saves index as JSON or Pickle
- ✅ **Error Handling**: Robust handling of edge cases
- ✅ **Modular Design**: Easy-to-use Processor class

## Installation

### Prerequisites

- Python 3.7+
- CMake (required for dlib)
- Visual Studio Build Tools (Windows) or build-essential (Linux/Mac)

### Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: Installing `dlib` and `face_recognition` can be tricky. If you encounter issues:

**macOS:**
```bash
brew install cmake
pip install dlib face_recognition
```

**Linux:**
```bash
sudo apt-get install cmake libopenblas-dev liblapack-dev
pip install dlib face_recognition
```

**Windows:**
```bash
# Install Visual Studio Build Tools first
# Then install CMake from https://cmake.org/download/
pip install dlib face_recognition
```

## Quick Start

### 1. Index a Gallery

```python
from face_processor import FaceProcessor

# Initialize processor with CNN model
processor = FaceProcessor(
    index_file='face_index.json',
    model='cnn',  # Use CNN for better accuracy
    tolerance=0.6
)

# Index all photos in a folder
stats = processor.index_gallery('uploads/wedding_gallery/sister_a')
print(f"Indexed {stats['faces_found']} faces from {stats['processed']} photos")
```

### 2. Search for a Guest

```python
# Search for guest using their selfie
matches = processor.search_face('guest_selfie.jpg')

# Returns list of filenames where guest was found
for filename in matches:
    print(f"Found guest in: {filename}")
```

### 3. Command Line Usage

```bash
# Index a gallery
python face_processor.py --index uploads/wedding_gallery/sister_a --index-file face_index.json --model cnn

# Search for a face
python face_processor.py --search guest_selfie.jpg --index-file face_index.json

# Show statistics
python face_processor.py --stats --index-file face_index.json
```

## API Reference

### FaceProcessor Class

#### Initialization

```python
FaceProcessor(
    index_file: str = 'face_index.json',
    model: str = 'cnn',  # 'cnn' or 'hog'
    tolerance: float = 0.6  # Match tolerance (lower = stricter)
)
```

**Parameters:**
- `index_file`: Path to JSON/Pickle file for storing face encodings
- `model`: Detection model - `'cnn'` (accurate, slower) or `'hog'` (faster, less accurate)
- `tolerance`: Face matching tolerance (0.0-1.0). Lower values = stricter matches

#### Methods

##### `index_gallery(gallery_folder, recursive=True, update_existing=False)`

Scans a folder of photos and indexes all detected faces.

**Parameters:**
- `gallery_folder`: Path to folder containing wedding photos
- `recursive`: Whether to scan subdirectories (default: True)
- `update_existing`: Whether to re-index already indexed photos (default: False)

**Returns:**
```python
{
    'processed': int,    # Number of photos processed
    'faces_found': int,  # Total faces detected
    'errors': int,       # Number of errors
    'skipped': int       # Number of photos skipped (already indexed)
}
```

**Example:**
```python
stats = processor.index_gallery('uploads/wedding_gallery/sister_a')
```

##### `search_face(guest_selfie_path, return_scores=False)`

Searches for a guest's face in the indexed gallery.

**Parameters:**
- `guest_selfie_path`: Path to guest's selfie image
- `return_scores`: If True, returns tuples (filename, distance) instead of just filenames

**Returns:**
- If `return_scores=False`: `List[str]` - List of matching filenames
- If `return_scores=True`: `List[Tuple[str, float]]` - List of (filename, match_distance)

**Example:**
```python
# Get just filenames
matches = processor.search_face('guest_selfie.jpg')
# ['photo1.jpg', 'photo2.jpg', ...]

# Get filenames with match scores
matches = processor.search_face('guest_selfie.jpg', return_scores=True)
# [('photo1.jpg', 0.45), ('photo2.jpg', 0.52), ...]
```

##### `get_index_stats()`

Returns statistics about the indexed gallery.

**Returns:**
```python
{
    'total_photos': int,
    'total_faces': int,
    'average_faces_per_photo': float,
    'index_file': str,
    'model': str,
    'tolerance': float
}
```

##### `remove_from_index(filename)`

Removes a photo from the index.

**Parameters:**
- `filename`: Path to photo to remove

**Returns:** `bool` - True if removed, False if not found

##### `clear_index()`

Clears all indexed faces from memory and saves empty index.

### Convenience Functions

#### `index_gallery(gallery_folder, index_file='face_index.json', model='cnn', recursive=True)`

Quick function to index a gallery without creating a processor instance.

#### `search_face(guest_selfie_path, index_file='face_index.json', model='cnn', tolerance=0.6, return_scores=False)`

Quick function to search for a face without creating a processor instance.

## Usage Examples

### Example 1: Basic Workflow

```python
from face_processor import FaceProcessor

# Initialize
processor = FaceProcessor(index_file='my_index.json', model='cnn')

# Index gallery
processor.index_gallery('wedding_photos/')

# Search for guest
matches = processor.search_face('guest_selfie.jpg')
print(f"Found in {len(matches)} photos")
```

### Example 2: Custom Tolerance

```python
# Stricter matching (lower tolerance)
processor = FaceProcessor(tolerance=0.5)  # Only very close matches

# More lenient matching (higher tolerance)
processor = FaceProcessor(tolerance=0.7)  # More matches, less accurate
```

### Example 3: Using HOG Model (Faster)

```python
# HOG is faster but less accurate than CNN
processor = FaceProcessor(model='hog')
processor.index_gallery('wedding_photos/')
```

### Example 4: Get Match Scores

```python
matches = processor.search_face('guest_selfie.jpg', return_scores=True)

for filename, distance in matches:
    similarity = (1 - distance) * 100
    print(f"{filename}: {similarity:.1f}% similar")
```

### Example 5: Update Existing Index

```python
# Re-index photos (useful if photos were updated)
processor.index_gallery('wedding_photos/', update_existing=True)
```

## Model Comparison

### CNN Model (Recommended)
- ✅ **Accuracy**: Excellent, especially for background faces
- ✅ **Small faces**: Detects faces even in crowded backgrounds
- ⚠️ **Speed**: Slower processing (~10-30s per photo)
- ⚠️ **GPU**: Benefits from GPU acceleration
- **Best for**: Production use, high-resolution photos, Kerala wedding halls

### HOG Model
- ✅ **Speed**: Fast processing (~1-3s per photo)
- ⚠️ **Accuracy**: Good for frontal faces, struggles with small/background faces
- ✅ **CPU**: Works well on CPU
- **Best for**: Quick testing, frontal portraits, lower resolution

## Tolerance Tuning

The `tolerance` parameter controls how strict face matching is:

- **0.4-0.5**: Very strict - only very similar faces match
- **0.6** (default): Balanced - good accuracy with reasonable matches
- **0.7-0.8**: Lenient - more matches, may include false positives

**Recommendation**: Start with 0.6 and adjust based on results.

## Error Handling

The processor handles various edge cases:

- ✅ Photos with no faces detected
- ✅ Invalid image files
- ✅ Corrupted images
- ✅ Missing files
- ✅ Multiple faces in selfie (uses first face)
- ✅ Empty galleries

All errors are logged and don't crash the indexing process.

## Performance Tips

1. **Use CNN for production**: Better accuracy for background faces
2. **Index in batches**: Process galleries in smaller chunks
3. **Use Pickle format**: Faster loading than JSON (especially for large indexes)
4. **GPU acceleration**: dlib supports GPU for CNN model (requires CUDA setup)
5. **Cache results**: Don't re-index unchanged photos (default behavior)

## Integration with Wedding Web

### FastAPI Endpoint Example

```python
from fastapi import FastAPI, File, UploadFile
from face_processor import FaceProcessor

app = FastAPI()
processor = FaceProcessor(index_file='face_index.json', model='cnn')

@app.post("/api/search-face")
async def search_face_endpoint(
    selfie: UploadFile = File(...),
    wedding_id: str = None
):
    # Save uploaded selfie
    selfie_path = f"temp/{selfie.filename}"
    with open(selfie_path, "wb") as f:
        f.write(await selfie.read())
    
    # Search for face
    matches = processor.search_face(selfie_path)
    
    return {"matches": matches, "count": len(matches)}
```

## Troubleshooting

### "No module named 'face_recognition'"
```bash
pip install face_recognition
```

### "CMake not found" (dlib installation)
Install CMake: https://cmake.org/download/

### "No faces detected"
- Check image quality and lighting
- Ensure faces are clearly visible
- Try using CNN model instead of HOG
- Adjust image resolution (too high/low can cause issues)

### "Low accuracy / Too many false positives"
- Lower the tolerance value (e.g., 0.5)
- Ensure good quality selfie
- Use CNN model for better accuracy

### Slow processing
- Use HOG model for faster processing (less accurate)
- Process images in smaller batches
- Consider GPU acceleration for CNN

## License

Part of Wedding Web platform.

## Support

For issues or questions, refer to the main Wedding Web documentation.
