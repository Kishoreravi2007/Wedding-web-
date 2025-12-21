# Diagnostic Face Matching

## Current Issue
No matches found even with very lenient threshold (0.7).

## Changes Made

### 1. Very Lenient Threshold: 0.7
- **Location**: `backend/server.js`
- **Purpose**: Diagnostic - to see if ANY matches exist
- **If still no matches**: Descriptors likely don't match at all

### 2. Dual Distance Calculation
- **Euclidean Distance**: Standard distance metric
- **Cosine Distance**: Better for normalized vectors (face-api.js descriptors are normalized)
- **Uses the better match**: Takes minimum of both distances

### 3. Enhanced Logging
- Shows both euclidean and cosine distances
- Shows descriptor sample values
- Shows top 5 closest matches even when none pass threshold

## What to Check

### 1. Restart Backend Server
```bash
# Stop server (Ctrl+C)
cd backend
node server.js
```

### 2. Try Photo Booth Search

### 3. Check Console Logs

You should see:
```
🔍 FACE MATCHING DEBUG
Descriptor sample (first 5 values): [0.1234, -0.5678, ...]
📊 Closest matches (top 5):
   1. Distance: 0.XXXX (XX.X% confidence)
      Euclidean: 0.XXXX | Cosine: 0.XXXX
```

## What the Logs Tell You

### If Distances Are:
- **< 0.7**: Matches should appear now
- **0.7-0.8**: Descriptors are close but not matching
- **> 0.8**: Descriptors don't match at all

### If Cosine Distance is Much Lower:
- Descriptors are normalized correctly
- Cosine distance is more accurate
- System will use the better match

## Possible Issues

### Issue 1: Descriptors Don't Match
**Symptom**: All distances > 0.7
**Cause**: Face descriptors in database are from different people
**Solution**: Re-process photos or use InsightFace

### Issue 2: Descriptor Format Mismatch
**Symptom**: Very high distances (> 1.0)
**Cause**: Descriptors might not be normalized or wrong format
**Solution**: Check descriptor format in database

### Issue 3: Wrong Wedding Filter
**Symptom**: "Found 0 photos for wedding"
**Solution**: Check if photos are tagged with correct wedding name

## Next Steps

1. **Restart server** and test
2. **Check console logs** - what are the actual distances?
3. **Share the logs** - especially the "Closest matches" section
4. **If distances > 0.7**: Need to re-process photos or use InsightFace

## Long-term Solution

For best accuracy, migrate to InsightFace:
- 512-dim embeddings (vs 128-dim)
- Much more accurate
- Better at matching faces
- Already set up and ready

The threshold of 0.7 is very lenient. If this still shows no matches, the face descriptors in your database likely don't match the search face at all.

