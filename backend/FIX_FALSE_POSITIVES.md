# Fix False Positives - Face Recognition Accuracy Guide

## Problem
When searching for your face, the system is returning photos of different people (false positives).

## Solutions

### 1. Use Stricter Tolerance (Recommended)

The default tolerance has been changed from **0.6 to 0.5** for better accuracy. For even stricter matching:

```python
from face_processor import FaceProcessor

# Very strict (fewer false positives)
processor = FaceProcessor(tolerance=0.45, model='cnn')

# Search with strict mode (enabled by default)
matches = processor.search_face('your_selfie.jpg', strict_mode=True)
```

### 2. Enable Strict Mode (Default)

Strict mode is now enabled by default. It:
- Requires matches to be significantly better than other faces in the same photo
- Filters out outlier matches
- Uses a 10% stricter threshold

```python
# Strict mode is ON by default
processor = FaceProcessor(tolerance=0.5, model='cnn')
matches = processor.search_face('your_selfie.jpg', strict_mode=True)
```

### 3. Lower Tolerance for Your Search

Try progressively lower tolerances until you get accurate results:

```python
# Try these tolerances (lower = stricter):
processor = FaceProcessor(tolerance=0.45)  # Stricter
matches = processor.search_face('your_selfie.jpg')

processor = FaceProcessor(tolerance=0.40)  # Very strict
matches = processor.search_face('your_selfie.jpg')
```

### 4. Use Better Quality Selfie

**Requirements for good selfie:**
- ✅ Clear, well-lit face
- ✅ Face should be large (at least 80x80 pixels)
- ✅ Front-facing (not at extreme angles)
- ✅ Good resolution
- ✅ Only ONE person in the selfie

### 5. Check Match Confidence

View match scores to see how confident the matches are:

```python
matches = processor.search_face('your_selfie.jpg', return_scores=True)

for filename, distance in matches:
    confidence = (1 - distance) * 100
    print(f"{filename}: {confidence:.1f}% confidence")
    
    # Filter to only high-confidence matches
    if confidence > 60:  # Only 60%+ confidence
        print(f"  ✓ High confidence match")
```

### 6. Re-index Gallery with Better Settings

Re-index your gallery with stricter face detection:

```python
processor = FaceProcessor(
    index_file='face_index.json',
    model='cnn',  # Use CNN for better accuracy
    tolerance=0.5
)

# Re-index with update_existing=True
processor.index_gallery(
    'uploads/wedding_gallery/sister_a',
    update_existing=True  # Re-process all photos
)
```

### 7. Command Line Usage

```bash
# Search with strict mode and lower tolerance
python face_processor.py \
  --search your_selfie.jpg \
  --tolerance 0.45 \
  --index-file face_index.json

# View match scores
python face_processor.py \
  --search your_selfie.jpg \
  --tolerance 0.45 \
  --stats
```

## Recommended Settings

### For Best Accuracy (Fewer False Positives)
```python
processor = FaceProcessor(
    index_file='face_index.json',
    model='cnn',
    tolerance=0.45,  # Stricter
)

matches = processor.search_face(
    'your_selfie.jpg',
    strict_mode=True,  # Default
    min_confidence=0.40  # Additional filter
)
```

### For Balanced Results
```python
processor = FaceProcessor(
    tolerance=0.5,  # Default
    model='cnn'
)

matches = processor.search_face('your_selfie.jpg')
```

## Understanding Tolerance Values

- **0.4**: Very strict - Only very similar faces match
- **0.45**: Strict - Good for reducing false positives
- **0.5**: Balanced (recommended) - Good accuracy
- **0.6**: Lenient - May include false positives

## Understanding Confidence Scores

When `return_scores=True`, you get match distances:
- **Distance < 0.40**: Excellent match (90%+ confidence)
- **Distance 0.40-0.50**: Good match (50-90% confidence)
- **Distance 0.50-0.60**: Fair match (40-50% confidence)
- **Distance > 0.60**: Poor match (<40% confidence)

**Recommendation**: Filter to distance < 0.45 for best results.

## Quick Fix Script

```python
from face_processor import FaceProcessor

# Quick fix: Use strictest settings
processor = FaceProcessor(
    index_file='face_index.json',
    model='cnn',
    tolerance=0.45  # Stricter than default
)

# Search with strict mode
matches_with_scores = processor.search_face(
    'your_selfie.jpg',
    return_scores=True,
    strict_mode=True
)

# Filter to only high-confidence matches
high_confidence_matches = [
    (filename, distance) 
    for filename, distance in matches_with_scores 
    if distance < 0.45  # 55%+ confidence
]

print(f"Found {len(high_confidence_matches)} high-confidence matches:")
for filename, distance in high_confidence_matches:
    confidence = (1 - distance) * 100
    print(f"  - {filename} ({confidence:.1f}% confidence)")
```

## Troubleshooting Steps

1. **Test with lower tolerance**
   ```bash
   python face_processor.py --search your_selfie.jpg --tolerance 0.45
   ```

2. **Check match scores** - Look at the distance values. If false positives have high distances (>0.50), lower your tolerance.

3. **Improve selfie quality** - Take a new selfie with better lighting and clearer face.

4. **Re-index gallery** - Sometimes the gallery index needs updating:
   ```bash
   python face_processor.py --index uploads/wedding_gallery/sister_a --model cnn
   ```

5. **Use strict mode** (default) - It filters out ambiguous matches.

## What Changed in the Fix

✅ **Default tolerance lowered**: 0.6 → 0.5  
✅ **Strict mode enabled by default**: Filters ambiguous matches  
✅ **Face size validation**: Ignores very small faces (likely false positives)  
✅ **Multi-face validation**: In photos with multiple people, requires clear best match  
✅ **Outlier filtering**: Removes statistically unlikely matches  
✅ **Better selfie validation**: Requires larger, clearer face in selfie

## Still Getting False Positives?

Try this ultra-strict configuration:

```python
processor = FaceProcessor(tolerance=0.40, model='cnn')

matches = processor.search_face(
    'your_selfie.jpg',
    strict_mode=True,
    min_confidence=0.35  # Even stricter
)

# Then manually filter
filtered = [
    f for f, d in matches if d < 0.40  # Only excellent matches
]
```

If false positives persist, check:
- Selfie quality (should be clear, front-facing)
- Gallery photo quality
- Whether photos have similar-looking people
- Try re-indexing the gallery

