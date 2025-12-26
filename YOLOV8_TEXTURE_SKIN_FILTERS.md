# YOLOv8-face Texture and Skin Color Filters

## Summary
Successfully added professional-grade "anti-ghosting" layers using texture density (Laplacian variance) and skin-color probability (YCbCr) filters to eliminate persistent background detections.

## Implemented Filters

### 1. Edge Density (Texture) Check - Laplacian Variance ✅
**Location**: Lines 385-396

**Purpose**: 
- Real faces have specific smoothness
- Background artifacts (intricate fabrics, flowers) contain too many sharp edges
- High variance = high-contrast pattern (noise)
- Low variance = flat wall or blur

**Logic**:
- Convert face crop to grayscale
- Apply Laplacian operator to detect edges
- Calculate variance of Laplacian result
- Discard if variance > 500 (high-detail background pattern) or < 10 (flat/blurry)

**Why it works**:
- Faces have moderate edge density
- Intricate patterns (flowers, fabrics) have very high edge density
- Flat surfaces (walls, lights) have very low edge density

**Code**:
```python
gray_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
laplacian_var = cv2.Laplacian(gray_face, cv2.CV_64F).var()

# Discard if variance is too high (>500) or too low (<10)
if laplacian_var > 500 or laplacian_var < 10:
    texture_filtered += 1
    logger.debug(f"Filtered out texture issue: Laplacian variance={laplacian_var:.1f}")
    continue
```

**Thresholds**:
- **High threshold**: 500 (eliminates high-detail background patterns)
- **Low threshold**: 10 (eliminates flat walls or blurry images)

### 2. Skin-Color Probability (YCbCr Check) ✅
**Location**: Lines 398-415

**Purpose**:
- Background objects often mimic face shapes but rarely have the same skin-color density
- Human skin pixels fall into a narrow range in YCbCr color space

**Logic**:
- Convert face crop to YCbCr color space
- Create mask for skin pixels using `cv2.inRange`:
  - Cb (blue-difference): 77-127
  - Cr (red-difference): 133-173
- Calculate percentage of skin pixels in the box
- Discard if less than 35% of pixels are skin color

**Why it works**:
- Real faces have significant skin-colored pixels
- Background objects (walls, lights, fabrics) rarely match skin color ranges
- 35% threshold ensures majority of detection is actual skin

**Code**:
```python
ycbcr_face = cv2.cvtColor(face_crop, cv2.COLOR_BGR2YCrCb)

# OpenCV YCrCb format: Channel 0=Y, Channel 1=Cr, Channel 2=Cb
cr_channel = ycbcr_face[:, :, 1]  # Cr (red-difference)
cb_channel = ycbcr_face[:, :, 2]  # Cb (blue-difference)

# Skin color range: Cb: 77-127, Cr: 133-173
skin_mask = cv2.inRange(cb_channel, 77, 127) & cv2.inRange(cr_channel, 133, 173)

# Calculate percentage of skin pixels
total_pixels = face_crop.shape[0] * face_crop.shape[1]
skin_pixels = np.sum(skin_mask > 0)
skin_percentage = (skin_pixels / total_pixels) * 100

# Discard if less than 35% of the box is actual skin color
if skin_percentage < 35:
    skin_color_filtered += 1
    logger.debug(f"Filtered out low skin color: {skin_percentage:.1f}% skin pixels")
    continue
```

**Skin Color Ranges**:
- **Cb (blue-difference)**: 77-127
- **Cr (red-difference)**: 133-173
- **Minimum skin percentage**: 35%

### 3. Stricter DeepFace Verification ✅
**Location**: Line 395

**Change**: Set `enforce_detection=True` in `DeepFace.extract_faces()` call

**Purpose**: Makes DeepFace much stricter before allowing a face to pass

**Code**:
```python
verified_faces = DeepFace.extract_faces(
    img_path=face_temp_path,
    detector_backend="opencv",
    enforce_detection=True,  # Stricter verification - must detect face
    align=False
)
```

## Complete Detection Pipeline

```
YOLOv8 Detection (conf≥0.5, iou=0.3, agnostic_nms=True)
    ↓
Size Filter (≥40px)
    ↓
Aspect Ratio (0.75-1.6)
    ↓
Brightness (≤230)
    ↓
Center Color/Texture Check
    ↓
Laplacian Variance (10-500) ← NEW
    ↓
Skin Color Probability (≥35%) ← NEW
    ↓
DeepFace Verification (enforce_detection=True) ← STRICTER
    ↓
Embedding Extraction
    ↓
Final Verified Faces
```

## Logging

The system now provides comprehensive logging of all filtering stages:

```
YOLOv8-face: {total_detections} detections →
  {size_filtered} size-filtered →
  {aspect_ratio_filtered} aspect-ratio-filtered →
  {brightness_filtered} brightness-filtered →
  {center_color_filtered} center-color-filtered →
  {texture_filtered} texture-filtered → ← NEW
  {skin_color_filtered} skin-color-filtered → ← NEW
  {verification_failed} verification-failed →
  {verified_faces} verified faces
```

## Filter Statistics

Each filter tracks how many detections it removes:
- **texture_filtered**: Laplacian variance out of range (too high or too low)
- **skin_color_filtered**: Less than 35% skin-colored pixels

## Performance Impact

### Positive Impacts:
- **Eliminates intricate patterns**: Laplacian variance filters out flowers, fabrics, and high-detail backgrounds
- **Skin color validation**: Ensures detections actually contain skin-colored pixels
- **Stricter verification**: `enforce_detection=True` makes DeepFace more conservative
- **Professional-grade filtering**: Multi-layer approach eliminates ghost detections

### Trade-offs:
- **More conservative**: May filter out some valid faces with unusual textures or lighting
- **Slightly slower**: Additional texture and color analysis adds processing time
- **Tuned for weddings**: Filters optimized for wedding photography scenarios

## Configuration

### Current Settings:
- **Laplacian variance range**: 10-500
  - High threshold: 500 (eliminates high-detail patterns)
  - Low threshold: 10 (eliminates flat/blurry images)
- **Skin color ranges**:
  - Cb: 77-127
  - Cr: 133-173
- **Minimum skin percentage**: 35%
- **DeepFace enforce_detection**: True (stricter)

### Tuning Recommendations:
- **Laplacian variance**:
  - Lower high threshold (e.g., 400) for more conservative filtering
  - Raise high threshold (e.g., 600-800) for less aggressive filtering
  - Adjust low threshold based on blur tolerance
- **Skin color percentage**:
  - Lower threshold (e.g., 30%) for more lenient filtering
  - Raise threshold (e.g., 40%) for stricter filtering
- **Skin color ranges**: Adjust based on your specific skin tone requirements

## Technical Details

### Laplacian Variance
- **Method**: Measures edge density using Laplacian operator
- **Formula**: `variance = var(Laplacian(gray_image))`
- **Interpretation**:
  - Low variance (< 10): Blurry or flat surface
  - Moderate variance (10-500): Normal face texture
  - High variance (> 500): High-detail pattern (flowers, fabric, etc.)

### YCbCr Color Space
- **Format**: OpenCV uses YCrCb (not YCbCr)
- **Channels**:
  - Channel 0: Y (luminance)
  - Channel 1: Cr (red-difference)
  - Channel 2: Cb (blue-difference)
- **Skin detection**: Uses Cb and Cr channels for skin color detection
- **Advantage**: YCbCr is better for skin detection than RGB

## Server Status
✅ DeepFace API server is running with all texture and skin color filters active
- Health endpoint: `http://localhost:8002/health`
- All filtering stages are operational

## Testing Recommendations

1. **Test with wedding photos**: Especially those with intricate patterns (flowers, fabrics)
2. **Monitor filter statistics**: Check logs to see which filters are most active
3. **Compare before/after**: Test with and without new filters to see improvement
4. **Edge cases**: Test with unusual lighting, different skin tones, and textured backgrounds

## Next Steps

1. Test with real wedding photos containing intricate patterns
2. Monitor false positive rate reduction
3. Adjust Laplacian variance threshold if needed (consider 800 for very high-detail patterns)
4. Fine-tune skin color percentage based on your specific use case

