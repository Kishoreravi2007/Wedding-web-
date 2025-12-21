# Debug Face Matching Issues

## Problem
Photo Booth is showing wrong photos even with strict thresholds.

## Debugging Steps

### 1. Check Backend Logs

When you search for photos, check the backend console for:

```
🔍 Matching face with ULTRA strict threshold: 0.25 (75%+ confidence required)
📊 Match statistics:
   Total faces compared: X
   Matches within threshold (0.25): Y
   Best match distance: 0.XXXX (confidence: XX.X%)
🎯 Final match validation:
   Best match distance: 0.XXXX
   Best match confidence: XX.X%
   Best match person: Name
   Best match photo ID: uuid
```

### 2. What to Look For

**Good Match (Should Accept):**
- Distance < 0.25
- Confidence > 75%
- Clear improvement over second best (>20%)

**Bad Match (Should Reject):**
- Distance >= 0.25
- Confidence < 75%
- Too close to second best (<20% improvement)

### 3. Common Issues

#### Issue 1: Threshold Too Lenient
**Symptom**: Wrong photos appearing
**Solution**: Already set to 0.25 (75% confidence)

#### Issue 2: Database Has Wrong Descriptors
**Symptom**: Even good matches point to wrong photos
**Solution**: Re-process photos to extract correct descriptors

#### Issue 3: Wedding Filter Not Working
**Symptom**: Photos from wrong wedding appearing
**Solution**: Check logs for "REJECTING photo" messages

### 4. Quick Fix: Make Threshold Even Stricter

If still getting wrong photos, try:

```javascript
// In backend/server.js, change threshold to 0.2 (80% confidence)
const matchResult = await matchFace(descriptor, 0.2, weddingName);
```

### 5. Long-term Solution: Use InsightFace

For best accuracy, migrate to InsightFace:
- 512-dim embeddings (vs 128-dim)
- Better accuracy
- More reliable matching

See `INSIGHTFACE_API_GUIDE.md` for integration steps.

## Testing

1. Restart backend server
2. Try Photo Booth search
3. Check console logs for match details
4. Verify the best match distance is < 0.25
5. If distance is >= 0.25, match should be rejected

## Next Steps

If the issue persists:
1. Share the console logs showing match distances
2. Consider migrating to InsightFace for better accuracy
3. Check if face descriptors in database are correct

