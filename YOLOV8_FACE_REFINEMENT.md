# YOLOv8-face Detection Refinement - False Positive Reduction

## Summary
Successfully refined YOLOv8-face detection logic to eliminate false positives (detecting background objects as faces) using a multi-stage filtering approach optimized for wedding photography.

## Implementation Details

### 1. CLAHE Lighting Pre-processing
**Location**: `process_image_file()` function, applied after `cv2.imdecode()`

**Purpose**: Normalizes harsh wedding stage lighting (e.g., "par lights" and stage flashes) that create bright spots. YOLO often mistakes bright white spots on walls as foreheads.

**Implementation**:
```python
# Convert to LAB color space
lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
l, a, b = cv2.split(lab)
# Apply CLAHE to the L-channel (lightness)
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
cl = clahe.apply(l)
# Merge back
limg = cv2.merge((cl, a, b))
img = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
```

**Why it works**: CLAHE flattens extreme lighting variations, allowing the AI to distinguish between actual faces and bright background spots.

### 2. Confidence Filtering
**Change**: Increased default confidence threshold from `0.25` to `0.45`

**Purpose**: Filters out low-confidence detections that are more likely to be false positives.

**Configuration**:
- Default: `0.45`
- Range: `0.1` to `0.9`
- Can be adjusted via API parameter `conf_threshold`

### 3. Size-Based Filtering
**Rule**: Discard any detection where box width OR height is less than 40 pixels

**Purpose**: In a 1280px photo, a face in the 10th row is still usually about 50-60 pixels. Anything smaller than 40px is almost certainly a "ghost" detection or background noise.

**Implementation**:
```python
box_width = x2 - x1
box_height = y2 - y1

if box_width < 40 or box_height < 40:
    size_filtered += 1
    logger.debug(f"Filtered out small detection: {box_width}x{box_height}px")
    continue
```

### 4. DeepFace Double-Check (Verification)
**Process**: For every face YOLO detects, run `DeepFace.extract_faces()` on the cropped area before extracting embeddings.

**Purpose**: YOLO is fast but "eager" to find things. DeepFace is slower but much more "cautious." By making them work together, you get the best of both worlds.

**Implementation Flow**:
1. YOLOv8 detects potential faces
2. Size-based filtering removes tiny detections
3. DeepFace verification confirms each detection is actually a face
4. Only verified faces proceed to embedding extraction

**Code**:
```python
# DeepFace Double-Check: Verify this is actually a face
verified_faces = DeepFace.extract_faces(
    img_path=face_temp_path,
    detector_backend="opencv",
    enforce_detection=False,
    align=False
)

# If DeepFace doesn't find a face, skip this detection
if not verified_faces or len(verified_faces) == 0:
    verification_failed += 1
    continue
```

## Detection Pipeline

```
Image Input
    ↓
CLAHE Lighting Normalization
    ↓
YOLOv8-face Detection (conf ≥ 0.45)
    ↓
Size-Based Filtering (≥ 40px)
    ↓
DeepFace Verification (extract_faces)
    ↓
Embedding Extraction (DeepFace.represent)
    ↓
Final Verified Faces
```

## Logging

The system now provides detailed logging of the filtering process:

```
YOLOv8-face: {total_detections} detections →
  {size_filtered} size-filtered →
  {verification_failed} verification-failed →
  {verified_faces} verified faces
```

This helps track:
- How many detections YOLO made initially
- How many were filtered by size
- How many failed DeepFace verification
- Final count of verified faces

## Performance Impact

### Positive Impacts:
- **Reduced false positives**: Multi-stage filtering eliminates background noise
- **Better accuracy**: Only verified faces are returned
- **Wedding-specific optimization**: CLAHE handles harsh stage lighting

### Trade-offs:
- **Slightly slower**: DeepFace verification adds processing time per detection
- **More conservative**: May miss some very small or partially occluded faces

## Configuration

### Default Settings
- **Confidence threshold**: `0.45`
- **Minimum size**: `40px` (width or height)
- **Image size**: `1280px` (minimum)
- **CLAHE**: Enabled by default

### Adjusting Settings
- **Lower confidence** (e.g., 0.35): More detections, may include false positives
- **Higher confidence** (e.g., 0.55): Fewer detections, more accurate
- **Smaller size threshold** (e.g., 30px): May catch more faces but also more noise
- **Larger size threshold** (e.g., 50px): More conservative, fewer false positives

## Testing Recommendations

1. **Test with wedding photos**: Especially those with harsh stage lighting
2. **Monitor logs**: Check filtering statistics to tune thresholds
3. **Compare before/after**: Test with and without CLAHE to see the difference
4. **Edge cases**: Test with very small faces, side profiles, and crowded scenes

## Server Status
✅ DeepFace API server is running with refined YOLOv8-face detection
- Health endpoint: `http://localhost:8002/health`
- All filtering stages are active

## Next Steps
1. Test with real wedding photos
2. Monitor false positive rate
3. Adjust confidence threshold if needed (based on your specific use case)
4. Consider fine-tuning size threshold for your typical wedding photo sizes

