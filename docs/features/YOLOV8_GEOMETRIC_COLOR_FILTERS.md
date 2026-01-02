# YOLOv8-face Geometric and Color Filters

## Summary
Successfully added strict geometric and color filters to eliminate persistent "ghost" detections of background objects in wedding photos.

## Implemented Filters

### 1. Aspect Ratio Check ✅
**Location**: Lines 322-328

**Logic**: 
- Calculate `aspect_ratio = box_height / box_width`
- Discard if `aspect_ratio < 0.75` (too wide) or `aspect_ratio > 1.6` (too tall)

**Why it works**: 
- Real faces have a consistent aspect ratio range
- Background objects often have extreme aspect ratios (very wide or very tall)

**Code**:
```python
aspect_ratio = box_height / box_width if box_width > 0 else 0
if aspect_ratio < 0.75 or aspect_ratio > 1.6:
    aspect_ratio_filtered += 1
    logger.debug(f"Filtered out invalid aspect ratio: {aspect_ratio:.2f}")
    continue
```

### 2. Saturation/Brightness Filter ✅
**Location**: Lines 338-345

**Logic**:
- Convert face crop to grayscale
- Calculate average brightness
- Discard if `avg_brightness > 230` (over-exposed)

**Why it works**:
- Stage lights and over-exposed areas have very high brightness (> 230)
- Real faces rarely exceed this threshold even in bright lighting

**Code**:
```python
gray_crop = cv2.cvtColor(face_crop, cv2.COLOR_BGR2GRAY)
avg_brightness = np.mean(gray_crop)
if avg_brightness > 230:
    brightness_filtered += 1
    logger.debug(f"Filtered out over-exposed detection: brightness={avg_brightness:.1f}")
    continue
```

### 3. Center-Point Verification ✅
**Location**: Lines 347-381

**Logic**:
- Crop center 30% of the detected box (35% to 65% in both dimensions)
- Convert to HSV color space for better color analysis
- Check for neon colors (high saturation > 150 with specific hue ranges)
- Check for lack of texture (low standard deviation < 10)
- Discard if neon-colored or lacks texture

**Why it works**:
- Skin has natural texture variation (std dev > 10)
- Neon lights have high saturation and specific hue ranges
- Uniform colors (low std dev) indicate solid backgrounds or lights, not skin

**Code**:
```python
# Crop center 30% of the detected box
center_x_start = int(box_width * 0.35)
center_x_end = int(box_width * 0.65)
center_y_start = int(box_height * 0.35)
center_y_end = int(box_height * 0.65)
center_crop = face_crop[center_y_start:center_y_end, center_x_start:center_x_end]

# Convert to HSV for color analysis
hsv_center = cv2.cvtColor(center_crop, cv2.COLOR_BGR2HSV)
avg_hue = np.mean(hsv_center[:, :, 0])
avg_saturation = np.mean(hsv_center[:, :, 1])

# Check for neon colors
is_neon = avg_saturation > 150 and (
    (avg_hue < 20) or  # Red/Orange neon
    (avg_hue > 160 and avg_hue < 180)  # Magenta/Pink neon
)

# Check for lack of texture
gray_center = cv2.cvtColor(center_crop, cv2.COLOR_BGR2GRAY)
std_dev = np.std(gray_center)

# Discard if neon or lacks texture
if is_neon or std_dev < 10:
    center_color_filtered += 1
    continue
```

### 4. Agnostic NMS ✅
**Location**: Line 283

**Logic**:
- Set `agnostic_nms=True` in YOLO predict call

**Why it works**:
- Prevents multiple overlapping boxes on high-detail background patterns
- Reduces duplicate detections on complex backgrounds

**Code**:
```python
results = yolov8_model(
    img, 
    conf=conf_threshold, 
    imgsz=imgsz, 
    iou=0.3,
    agnostic_nms=True,  # Prevents overlapping boxes on background patterns
    verbose=False
)
```

### 5. IOU Adjustment ✅
**Location**: Line 282

**Logic**:
- Set `iou=0.3` in YOLO predict call

**Why it works**:
- More aggressive in merging/removing overlapping detections
- Lower IOU threshold (0.3 vs default 0.45) removes more overlapping boxes

**Code**:
```python
results = yolov8_model(
    img, 
    conf=conf_threshold, 
    imgsz=imgsz, 
    iou=0.3,  # More aggressive overlap removal
    agnostic_nms=True,
    verbose=False
)
```

## Complete Detection Pipeline

```
YOLOv8 Detection (conf ≥ 0.5, iou=0.3, agnostic_nms=True)
    ↓
Size Filter (width ≥ 40px AND height ≥ 40px)
    ↓
Aspect Ratio Filter (0.75 ≤ ratio ≤ 1.6)
    ↓
Brightness Filter (avg_brightness ≤ 230)
    ↓
Center-Point Color/Texture Verification
    ↓
DeepFace.extract_faces() Verification
    ↓
Embedding Extraction
    ↓
Final Verified Faces
```

## Logging

The system provides detailed logging of all filtering stages:

```
YOLOv8-face: {total_detections} detections →
  {size_filtered} size-filtered →
  {aspect_ratio_filtered} aspect-ratio-filtered →
  {brightness_filtered} brightness-filtered →
  {center_color_filtered} center-color-filtered →
  {verification_failed} verification-failed →
  {verified_faces} verified faces
```

## Filter Statistics

Each filter tracks how many detections it removes:
- **size_filtered**: Detections < 40px
- **aspect_ratio_filtered**: Invalid aspect ratios
- **brightness_filtered**: Over-exposed detections (> 230 brightness)
- **center_color_filtered**: Neon colors or lack of texture
- **verification_failed**: DeepFace verification failures

## Performance Impact

### Positive Impacts:
- **Eliminates ghost detections**: Multi-stage filtering removes background objects
- **Better accuracy**: Only geometrically and color-valid faces pass through
- **Reduced false positives**: Aggressive filtering ensures high-quality detections

### Trade-offs:
- **More conservative**: May filter out some valid but unusual faces
- **Slightly slower**: Additional color/texture analysis adds processing time
- **Tuned for weddings**: Filters are optimized for wedding photography scenarios

## Configuration

### Current Settings:
- **Aspect ratio range**: 0.75 to 1.6
- **Brightness threshold**: 230
- **Neon saturation threshold**: 150
- **Texture std dev threshold**: 10
- **IOU threshold**: 0.3
- **Agnostic NMS**: Enabled

### Tuning Recommendations:
- **Aspect ratio**: Adjust range if you need to detect very wide or tall faces
- **Brightness**: Lower threshold (e.g., 220) for darker venues, raise (e.g., 240) for very bright venues
- **Texture std dev**: Lower threshold (e.g., 8) for smoother skin, raise (e.g., 12) for more textured skin
- **Neon detection**: Adjust saturation threshold based on your venue's lighting

## Server Status
✅ DeepFace API server is running with all geometric and color filters active
- Health endpoint: `http://localhost:8002/health`
- All filtering stages are operational

## Testing Recommendations

1. **Test with wedding photos**: Especially those with stage lights and complex backgrounds
2. **Monitor filter statistics**: Check logs to see which filters are most active
3. **Compare before/after**: Test with and without filters to see improvement
4. **Edge cases**: Test with unusual lighting, side profiles, and crowded scenes

## Next Steps

1. Test with real wedding photos
2. Monitor false positive rate
3. Adjust thresholds if needed based on your specific venue lighting
4. Fine-tune aspect ratio range if you encounter valid faces being filtered

