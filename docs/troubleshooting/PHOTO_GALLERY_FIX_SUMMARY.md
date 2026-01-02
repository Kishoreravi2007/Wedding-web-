# Photo Gallery Fix Summary

## Problem
The photo gallery was not displaying photos from the `uploads/wedding_gallery` folder.

## Solution
Updated the frontend to load photos from the backend's static file server which serves files from `uploads/wedding_gallery/`.

## Changes Made

### 1. Frontend API Configuration (`frontend/src/lib/api.ts`)
- **Changed**: Updated default API_BASE_URL from port 5000 to 5001
- **Reason**: Backend server runs on port 5001 to avoid macOS AirPlay conflict
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
```

### 2. Photo Gallery Simple Component (`frontend/src/components/PhotoGallery-simple.tsx`)
- **Added**: Import for API_BASE_URL
- **Updated**: `initialPhotos` useMemo to construct proper URLs
  - Sister A photos: `http://localhost:5001/uploads/wedding_gallery/sister_a/`
    - IMG_0309_Original.heic
    - IMG20230831163922_01.jpg
  - Sister B photos: `http://localhost:5001/uploads/wedding_gallery/sister_b/`
    - 1.jpeg through 15.jpeg
- **Fixed**: Added missing Photo interface properties (description, photographer, timestamp)

### 3. Photo Gallery Page (`frontend/src/pages/PhotoGallery.tsx`)
- **Changed**: Enabled gallery for Sister A (was previously showing "Gallery Not Available")
- **Added**: Dynamic gallery path and title based on sister prop
- **Updated**: Uses variable `galleryPath` instead of hardcoded path

## File Structure
```
uploads/
  └── wedding_gallery/
      ├── sister_a/
      │   ├── IMG_0309_Original.heic
      │   └── IMG20230831163922_01.jpg
      └── sister_b/
          ├── 1.jpeg
          ├── 2.jpeg
          ├── 3.jpeg
          ├── 4.jpeg
          ├── 5.jpeg
          ├── 6.jpeg
          ├── 7.jpeg
          ├── 8.jpeg
          ├── 9.jpeg
          ├── 10.jpeg
          ├── 11.jpeg
          ├── 12.jpeg
          ├── 13.jpeg
          ├── 14.jpeg
          └── 15.jpeg
```

## Backend Configuration (Already in place)
The backend (`backend/server.js`) already serves static files from the uploads directory:
```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

## How It Works
1. Frontend loads the PhotoGallery page for either sister
2. PhotoGallery-simple component receives `galleryPath` prop ('/sister-a-gallery' or '/sister-b-gallery')
3. Component maps the gallery path to actual backend URLs
4. Photos are loaded from: `${API_BASE_URL}/uploads/wedding_gallery/${sister}/`
5. Backend serves these static files from the `uploads/` folder

## Testing
1. **Backend**: Already running on port 5001 ✓
2. **Frontend**: Running on port 3001 ✓
3. **Photo URLs**: Accessible at `http://localhost:5001/uploads/wedding_gallery/sister_b/1.jpeg` ✓

## How to View
1. Navigate to `http://localhost:3001/parvathy/gallery` for Sister A's gallery
2. Navigate to `http://localhost:3001/sreedevi/gallery` for Sister B's gallery

## Adding More Photos
To add more photos to the galleries:
1. Place photos in the appropriate folder under `uploads/wedding_gallery/sister_a/` or `sister_b/`
2. Update the `imageNames` array in `PhotoGallery-simple.tsx` to include the new filenames
3. The photos will automatically appear in the gallery

## Environment Variables
For deployment, set:
- `VITE_API_URL` to your deployed backend URL (e.g., `https://your-backend.com`)
- Backend automatically serves from the uploads folder at `/uploads` route

