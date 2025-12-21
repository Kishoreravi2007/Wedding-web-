# Face Matching Diagnosis Guide

## Current Configuration
- **Threshold**: 0.4 (60% confidence required)
- **Excellent matches** (< 0.35): Always accepted
- **Good matches** (0.35-0.4): Accepted with validation
- **Poor matches** (>= 0.4): Rejected

## Problem: No Photos Showing

If no photos are showing but you know photos exist in the gallery, check:

### 1. Are Face Descriptors Stored?

The photos need to have face descriptors extracted and stored in the database.

**Check if photos have been processed:**
- Go to Photographer Portal
- Check if photos show face detection data
- If not, photos need to be processed first

### 2. Check Backend Console Logs

When you search, look for these messages:

```
🔍 FACE MATCHING DEBUG
Threshold: 0.4 (60%+ confidence required)
📸 Found X photos for wedding: sister-a
✅ Filtered to Y face descriptors
🎯 Face match distances (top 10):
   1. Photo ... | Distance: 0.XXXX | Confidence: XX.X%
```

**What to look for:**
- If "Found 0 photos" → Photos not in database for that wedding
- If "Filtered to 0 face descriptors" → Photos don't have face descriptors stored
- If distances are all > 0.4 → No good matches found

### 3. Common Issues

#### Issue 1: Photos Not Processed
**Symptom**: No face descriptors in database
**Solution**: Process photos to extract face descriptors

#### Issue 2: Wrong Wedding Filter
**Symptom**: "Found 0 photos for wedding"
**Solution**: Check if photos are tagged with correct wedding name

#### Issue 3: Descriptors Don't Match
**Symptom**: Distances are all > 0.4
**Solution**: Re-process photos or use InsightFace for better accuracy

## Quick Fix: Lower Threshold Temporarily

If you want to test with a more lenient threshold:

Edit `backend/server.js` line 198:
```javascript
// Change from 0.4 to 0.5 (50% confidence) for testing
const matchResult = await matchFace(descriptor, 0.5, weddingName);
```

**Warning**: Lower threshold may show wrong photos. Use only for testing.

## Proper Solution

### Step 1: Verify Photos Have Face Descriptors

Check your database:
```sql
-- Check if photos have face descriptors
SELECT COUNT(*) FROM face_descriptors;
SELECT COUNT(*) FROM photo_faces;
```

### Step 2: Re-process Photos

If descriptors are missing or incorrect:
1. Go to Photographer Portal
2. Use "Process Faces" tool
3. Re-extract face descriptors for all photos

### Step 3: Use InsightFace (Best Solution)

For best accuracy:
1. Use InsightFace API (already set up)
2. Store 512-dim embeddings instead of 128-dim
3. Much more accurate matching

## Testing Steps

1. **Restart backend server**
2. **Try Photo Booth search**
3. **Check console logs** - what distances are shown?
4. **If distances > 0.4**: Descriptors don't match (need re-processing)
5. **If distances < 0.4 but no photos**: Check wedding filter

## Next Steps

Share the console logs showing:
- How many photos found for the wedding
- How many face descriptors found
- What are the match distances

This will help identify the exact issue.

