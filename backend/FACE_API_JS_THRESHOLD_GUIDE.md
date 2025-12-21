# Face-api.js Threshold Guide

## Standard Threshold for face-api.js

**face-api.js uses 128-dimensional descriptors**, which are less accurate than modern face recognition systems. The **standard threshold is 0.6** (40% confidence).

## Why 0.6?

- face-api.js documentation recommends 0.6 for face matching
- 128-dim descriptors need more tolerance than 512-dim (InsightFace)
- Lower thresholds (0.4-0.5) are too strict and reject valid matches
- Higher thresholds (>0.7) allow too many false positives

## Current Configuration

- **Threshold**: 0.6 (40% confidence)
- **Excellent matches** (< 0.5): Always accepted
- **Good matches** (0.5-0.6): Accepted with validation
- **Borderline matches** (> 0.5): Require 15% improvement over second best

## Expected Behavior

### Good Match:
```
Best match distance: 0.55 (confidence: 45%)
✅ Good match - accepted
```

### Excellent Match:
```
Best match distance: 0.45 (confidence: 55%)
✅ Excellent match - accepted
```

### Poor Match:
```
Best match distance: 0.65 (confidence: 35%)
❌ Rejected - below threshold
```

## If Still No Matches

If distances are still > 0.6, the issue is:

1. **Face descriptors don't match** - Photos need to be re-processed
2. **Different angles/lighting** - Search photo is too different from stored photos
3. **face-api.js limitations** - 128-dim isn't accurate enough

## Solutions

### Option 1: Re-process Photos
- Extract face descriptors again
- Ensure good quality photos
- Use consistent lighting/angles

### Option 2: Use InsightFace (Recommended)
- 512-dim embeddings (4x more dimensions)
- Much more accurate
- Better at matching faces
- Standard threshold: 0.75 (75% confidence)

## Testing

1. Restart backend server
2. Try Photo Booth search
3. Check console logs for match distances
4. If distances < 0.6, matches should appear
5. If distances > 0.6, need to re-process or use InsightFace

## Next Steps

The threshold of 0.6 is the standard for face-api.js. If this still doesn't work, the face descriptors in your database likely don't match the search face, and you should:

1. **Re-process photos** to extract fresh descriptors
2. **Or migrate to InsightFace** for better accuracy

