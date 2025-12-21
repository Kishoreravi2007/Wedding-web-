# Quick Start Guide - Face Recognition Processor

## Installation

```bash
cd backend
pip install -r requirements.txt
```

**Important**: Installing `dlib` (dependency of `face_recognition`) may require:
- **macOS**: `brew install cmake`
- **Linux**: `sudo apt-get install cmake libopenblas-dev`
- **Windows**: Install CMake and Visual Studio Build Tools

## Verify Installation

```bash
python test_face_processor.py
```

This will test if all dependencies are correctly installed.

## Basic Usage

### 1. Index a Gallery (One-Time Setup)

```python
from face_processor import FaceProcessor

processor = FaceProcessor(
    index_file='face_index.json',
    model='cnn',  # High accuracy for background faces
    tolerance=0.6
)

# Index all photos in gallery
stats = processor.index_gallery('uploads/wedding_gallery/sister_a')
print(f"Indexed {stats['faces_found']} faces from {stats['processed']} photos")
```

**Or use command line:**
```bash
python face_processor.py --index uploads/wedding_gallery/sister_a --model cnn
```

### 2. Search for Guest Face

```python
# Search using guest selfie
matches = processor.search_face('guest_selfie.jpg')

# Returns list of filenames where guest was found
for filename in matches:
    print(f"Found: {filename}")
```

**Or use command line:**
```bash
python face_processor.py --search guest_selfie.jpg
```

## Complete Example

```python
from face_processor import FaceProcessor

# Initialize
processor = FaceProcessor(
    index_file='wedding_index.json',
    model='cnn',      # CNN for best accuracy
    tolerance=0.6     # Standard tolerance
)

# Step 1: Index gallery (do this once)
print("Indexing gallery...")
processor.index_gallery('uploads/wedding_gallery/sister_a')
print("✅ Gallery indexed!")

# Step 2: Search for guest
print("Searching for guest...")
matches = processor.search_face('guest_selfie.jpg')

if matches:
    print(f"✅ Found guest in {len(matches)} photos:")
    for filename in matches:
        print(f"   - {filename}")
else:
    print("❌ Guest not found")
```

## Model Selection

- **CNN** (Recommended): Best accuracy, slower processing
  - Perfect for Kerala wedding halls with background faces
  - Use: `model='cnn'`
  
- **HOG**: Faster, good for frontal faces
  - Use: `model='hog'` for quick testing

## Tolerance Tuning

- **0.5**: Stricter matching (fewer false positives)
- **0.6**: Default (balanced)
- **0.7**: More lenient (more matches, may include false positives)

## Files Created

- `face_processor.py` - Main processor class
- `example_face_processor.py` - Usage examples
- `test_face_processor.py` - Installation verification
- `FACE_RECOGNITION_README.md` - Complete documentation

## Next Steps

1. ✅ Run `python test_face_processor.py` to verify installation
2. ✅ Index your gallery: `python face_processor.py --index <folder>`
3. ✅ Test search: `python face_processor.py --search <selfie>`
4. ✅ Integrate with your FastAPI backend (see README for examples)

## Troubleshooting

**"No module named 'face_recognition'"**
```bash
pip install face_recognition
```

**"CMake not found"**
- macOS: `brew install cmake`
- Linux: `sudo apt-get install cmake`
- Windows: Download from cmake.org

**Low accuracy:**
- Use CNN model: `model='cnn'`
- Lower tolerance: `tolerance=0.5`
- Ensure good quality selfie

For more details, see `FACE_RECOGNITION_README.md`

