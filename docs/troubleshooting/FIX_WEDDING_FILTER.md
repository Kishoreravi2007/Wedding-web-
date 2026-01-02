# Fix: Wedding Filter in Face Recognition

## Problem
When searching for faces in Parvathy's wedding (`/parvathy/photobooth`), the system was showing results from Sreedevi's wedding instead.

## Root Cause
The face matching function `matchFace()` was searching across **ALL weddings** first, then filtering photos afterward. This meant:
1. Face matching happened across both weddings
2. It could match faces from the wrong wedding
3. Photo filtering happened too late

## Solution

### 1. Filter by Wedding BEFORE Matching
Updated `matchFace()` to accept a `weddingName` parameter and filter face descriptors **before** matching:

```javascript
// Before: Matched all faces, then filtered photos
const matchResult = await matchFace(descriptor, 0.6);

// After: Filters faces by wedding FIRST, then matches
const matchResult = await matchFace(descriptor, 0.5, weddingName);
```

### 2. Updated Database Query
Added support for filtering face descriptors by photo IDs in `FaceDescriptorDB.findAll()`:

```javascript
// Now supports filtering by photo_ids
FaceDescriptorDB.findAll({ photo_ids: [...photoIds] })
```

### 3. Fixed Wedding Name Format
Fixed mismatch between frontend (`sister-a`/`sister-b`) and component (`sister_a`/`sister_b`):

```typescript
// Now handles both formats
const normalizedWedding = weddingName?.replace('-', '_') || 'sister_a';
```

### 4. Improved Matching Threshold
Changed from `0.6` to `0.5` to reduce false positives (fewer incorrect matches).

## Files Changed

1. **backend/lib/face-recognition.js**
   - Added `weddingName` parameter to `matchFace()`
   - Filters photos by wedding first
   - Gets face descriptors only from that wedding's photos
   - Then performs matching

2. **backend/lib/supabase-db.js**
   - Updated `FaceDescriptorDB.findAll()` to accept `photo_ids` filter

3. **backend/server.js**
   - Passes `weddingName` to `matchFace()`
   - Uses stricter threshold (0.5 instead of 0.6)
   - Added better logging

4. **frontend/src/components/FaceSearchResults.tsx**
   - Handles both wedding name formats (`sister-a` and `sister_a`)
   - Properly displays correct wedding name

## How It Works Now

1. **User searches in Parvathy's photobooth** (`/parvathy/photobooth`)
2. **Frontend sends** `wedding_name: 'sister-a'`
3. **Backend receives** request with wedding name
4. **Backend filters photos** first: Gets all photos where `sister = 'sister-a'`
5. **Backend filters face descriptors**: Gets only face descriptors from those photos
6. **Backend matches faces**: Compares user's face only against faces from Parvathy's wedding
7. **Backend returns results**: Only photos from Parvathy's wedding

## Testing

After the fix:
- ✅ Searching in `/parvathy/photobooth` shows only Parvathy's wedding photos
- ✅ Searching in `/sreedevi/photobooth` shows only Sreedevi's wedding photos
- ✅ No cross-wedding contamination
- ✅ Correct wedding name displayed in results modal

## Verification

Check backend logs when searching:
```
🔍 Face recognition request with descriptor length: 128
🎯 Filtering matches to wedding: sister-a
🔍 Filtered to X face descriptors from Y photos (wedding: sister-a)
✅ Including photo photo.jpg from sister-a
```

If you see photos from the wrong wedding, check:
1. Photo's `sister` field in database
2. Face descriptor's `photo_id` relationship
3. Wedding name being sent from frontend

## Backward Compatibility

The fix maintains backward compatibility:
- If no `weddingName` is provided, it searches all weddings (old behavior)
- Wedding name parameter is optional
- Both name formats (`sister-a` and `sister_a`) are supported

