# Detecting Faces in Group Photos - Fix Guide

## Problem
Faces are not being detected from group photos, especially people in the background.

## Solution

The system has been updated to better detect faces in group photos by:
- ✅ Lowering minimum face size (20px instead of 50px) for indexing
- ✅ Disabling small face filtering for gallery indexing (detects all faces)
- ✅ Using CNN model for better background face detection
- ✅ Keeping strict filtering only for selfie searches

## Quick Fix - Re-index Your Gallery

### Option 1: Command Line (Recommended)

```bash
# Re-index with settings optimized for group photos
python face_processor.py \
  --index uploads/wedding_gallery/sister_a \
  --model cnn \
  --min-face-size 20

# This will detect ALL faces, including small ones in background
```

### Option 2: Python Code

```python
from face_processor import FaceProcessor

# Initialize processor
processor = FaceProcessor(
    index_file='face_index.json',
    model='cnn'  # CNN is better for group photos
)

# Index gallery with relaxed settings for group photos
stats = processor.index_gallery(
    'uploads/wedding_gallery/sister_a',
    min_face_size=20,          # Lower threshold for small faces
    filter_small_faces=False   # Don't filter - detect all faces
)

print(f"Indexed {stats['faces_found']} faces from {stats['processed']} photos")
```

## Settings Explained

### For Group Photos (Gallery Indexing)

```python
processor.index_gallery(
    gallery_folder='uploads/wedding_gallery/sister_a',
    min_face_size=20,          # Lower = detects smaller faces (background people)
    filter_small_faces=False,  # False = don't filter, accept all detected faces
    model='cnn'                # CNN model detects faces in background better
)
```

**Recommended settings for group photos:**
- `min_face_size=20-30`: Detects faces as small as 20-30 pixels
- `filter_small_faces=False`: Accepts all detected faces
- `model='cnn'`: Better accuracy for background faces

### For Selfie Search (Quality Control)

```python
# Selfie detection uses stricter settings automatically
processor.search_face(
    'guest_selfie.jpg',
    strict_mode=True  # Filters false positives
)
```

**Selfie settings (automatic):**
- `min_face_size=80`: Requires larger, clearer face
- `filter_small_faces=True`: Only accepts good quality faces

## Detection Settings Comparison

| Setting | Old (Too Strict) | New (For Group Photos) | Selfie Search |
|---------|-----------------|------------------------|---------------|
| min_face_size | 50px | 20px | 80px |
| filter_small_faces | True | **False** | True |
| Model | CNN | CNN | CNN |

## Step-by-Step Fix

### 1. Re-index Your Gallery

```bash
cd backend

# Re-index with group photo optimized settings
python face_processor.py \
  --index ../uploads/wedding_gallery/sister_a \
  --index-file face_index.json \
  --model cnn \
  --min-face-size 20
```

### 2. Verify Faces Were Detected

```bash
# Check statistics
python face_processor.py --stats --index-file face_index.json
```

You should see:
- Total photos indexed
- Total faces found (should be much higher now)
- Average faces per photo

### 3. Test Face Search

```bash
# Search for a face
python face_processor.py \
  --search guest_selfie.jpg \
  --index-file face_index.json \
  --tolerance 0.5
```

## Troubleshooting

### Still Not Detecting Faces?

1. **Check Image Quality**
   - Ensure photos are not too blurry
   - Verify photos have good lighting
   - Check if faces are clearly visible

2. **Lower min_face_size Even More**
   ```bash
   python face_processor.py \
     --index uploads/wedding_gallery/sister_a \
     --min-face-size 15  # Even lower threshold
   ```

3. **Check Logs**
   ```python
   import logging
   logging.basicConfig(level=logging.INFO)  # See detailed logs
   ```

4. **Verify Model is Working**
   ```python
   import face_recognition
   import cv2
   
   # Test detection
   image = face_recognition.load_image_file('test_photo.jpg')
   face_locations = face_recognition.face_locations(image, model='cnn')
   print(f"Detected {len(face_locations)} faces")
   ```

### Detecting Too Many False Faces?

If you're getting false face detections:

```python
# Slightly raise min_face_size
processor.index_gallery(
    'uploads/wedding_gallery/sister_a',
    min_face_size=30,  # Higher threshold
    filter_small_faces=True  # Filter small faces
)
```

## Example: Complete Workflow

```python
from face_processor import FaceProcessor

# Step 1: Initialize with CNN model
processor = FaceProcessor(
    index_file='wedding_index.json',
    model='cnn',
    tolerance=0.5
)

# Step 2: Index gallery (optimized for group photos)
print("Indexing gallery...")
stats = processor.index_gallery(
    'uploads/wedding_gallery/sister_a',
    min_face_size=20,          # Detect small faces
    filter_small_faces=False,  # Don't filter
    recursive=True,
    update_existing=True       # Re-index existing photos
)

print(f"✅ Indexed {stats['faces_found']} faces from {stats['processed']} photos")
print(f"   Average: {stats['faces_found']/stats['processed']:.1f} faces per photo")

# Step 3: Search for guest
print("\nSearching for guest...")
matches = processor.search_face(
    'guest_selfie.jpg',
    strict_mode=True
)

if matches:
    print(f"✅ Found guest in {len(matches)} photo(s):")
    for filename in matches[:10]:
        print(f"   - {filename}")
else:
    print("❌ Guest not found")
```

## Key Changes Made

✅ **Lowered min_face_size**: 50px → 20px for indexing  
✅ **Disabled filtering**: `filter_small_faces=False` by default for indexing  
✅ **Better logging**: More detailed information about face detection  
✅ **Separate settings**: Stricter for selfies, relaxed for gallery  
✅ **CNN model**: Better at detecting faces in background

## What to Expect

After re-indexing with the new settings:

- **Before**: Might detect 2-5 faces per group photo
- **After**: Should detect 10-30+ faces per group photo (including background)

**Example:**
- Photo with 20 people: Should detect 15-20 faces (depending on visibility)
- Photo with people in background: Should now detect background faces too

## Next Steps

1. ✅ Re-index your gallery with new settings
2. ✅ Verify face counts increased
3. ✅ Test face search with guest selfies
4. ✅ Adjust `min_face_size` if needed (15-30 range)

## Still Having Issues?

Run diagnostic:
```bash
python -c "
from face_processor import FaceProcessor
import logging
logging.basicConfig(level=logging.INFO)

processor = FaceProcessor(model='cnn')
stats = processor.index_gallery('uploads/wedding_gallery/sister_a', min_face_size=20, filter_small_faces=False)
print(f'Detected {stats[\"faces_found\"]} faces')
"
```

Check the logs for detailed information about what's being detected!

