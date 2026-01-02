# Supabase Refactoring Plan: Photo Storage & Face Recognition

## Executive Summary
This document outlines the complete refactoring of the wedding web application to use Supabase for photo storage and face recognition while retaining Firebase exclusively for wish data management.

## Architecture Overview

### Current State
- **Photos**: Firebase Storage (storage) + Firestore (metadata)
- **Wishes**: Firebase Firestore
- **Face Detection**: Frontend-only using face-api.js (not persisted)

### Target State
- **Photos**: Supabase Storage (storage) + PostgreSQL (metadata)
- **Wishes**: Firebase Firestore (unchanged)
- **Face Recognition**: Backend service using stored face descriptors in Supabase PostgreSQL

---

## 1. Database Schema Design

### Supabase PostgreSQL Tables

#### `photos` table
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  size BIGINT NOT NULL,
  mimetype TEXT NOT NULL,
  sister TEXT NOT NULL CHECK (sister IN ('sister-a', 'sister-b')),
  title TEXT,
  description TEXT,
  event_type TEXT,
  tags TEXT[], -- Array of tags
  storage_provider TEXT DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 'firebase')),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  photographer_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_photos_sister ON photos(sister);
CREATE INDEX idx_photos_event_type ON photos(event_type);
CREATE INDEX idx_photos_uploaded_at ON photos(uploaded_at DESC);
CREATE INDEX idx_photos_tags ON photos USING GIN(tags);
```

#### `people` table
```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('bride', 'groom', 'family', 'friend', 'vendor', 'other')),
  avatar_url TEXT,
  sister TEXT CHECK (sister IN ('sister-a', 'sister-b', 'both')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_people_sister ON people(sister);
```

#### `face_descriptors` table
```sql
CREATE TABLE face_descriptors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES people(id) ON DELETE CASCADE,
  descriptor REAL[], -- 128-dimensional face descriptor as array
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE, -- Reference photo where this face was detected
  confidence REAL, -- Confidence score of the face detection
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_face_descriptors_person ON face_descriptors(person_id);
CREATE INDEX idx_face_descriptors_photo ON face_descriptors(photo_id);
```

#### `photo_faces` table (junction table linking photos to detected faces)
```sql
CREATE TABLE photo_faces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id) ON DELETE SET NULL,
  face_descriptor_id UUID REFERENCES face_descriptors(id) ON DELETE CASCADE,
  bounding_box JSONB NOT NULL, -- {x, y, width, height} in percentage
  confidence REAL,
  is_verified BOOLEAN DEFAULT FALSE, -- Manual verification by photographer
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_photo_faces_photo ON photo_faces(photo_id);
CREATE INDEX idx_photo_faces_person ON photo_faces(person_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE face_descriptors ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_faces ENABLE ROW LEVEL SECURITY;

-- Photos: Public read, authenticated write
CREATE POLICY "Photos are viewable by everyone" ON photos
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert photos" ON photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own photos" ON photos
  FOR UPDATE USING (auth.uid() = photographer_id);

-- People: Public read, admin write
CREATE POLICY "People are viewable by everyone" ON people
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert people" ON people
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Face descriptors: Restricted access
CREATE POLICY "Face descriptors viewable by authenticated users" ON face_descriptors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert face descriptors" ON face_descriptors
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Photo faces: Public read for face info, authenticated write
CREATE POLICY "Photo faces viewable by everyone" ON photo_faces
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert photo faces" ON photo_faces
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## 2. Storage Setup

### Supabase Storage Bucket Configuration
```javascript
// Bucket name: 'wedding-photos'
// Configuration:
{
  public: true,
  fileSizeLimit: 10485760, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}
```

### Folder Structure
```
wedding-photos/
├── sister-a/
│   ├── {timestamp}_{filename}
│   └── ...
└── sister-b/
    ├── {timestamp}_{filename}
    └── ...
```

---

## 3. Backend API Changes

### New Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase (wishes only)
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./path-to-key.json
```

### API Endpoints

#### Photos Endpoints (Updated)

**POST /api/photos**
- Upload photo to Supabase Storage
- Detect faces using face-api.js descriptors from frontend
- Store photo metadata in PostgreSQL
- Store face descriptors and bounding boxes
- Return photo data with face information

```javascript
Request Body (FormData):
{
  photo: File,
  sister: 'sister-a' | 'sister-b',
  title?: string,
  description?: string,
  eventType?: string,
  tags?: string[], // JSON stringified
  faces?: string[] // JSON stringified array of face data
}

Response:
{
  id: uuid,
  publicUrl: string,
  faces: [
    {
      id: uuid,
      personName: string | null,
      boundingBox: { x, y, width, height },
      confidence: number
    }
  ],
  ...metadata
}
```

**GET /api/photos**
- Fetch photos with face information from PostgreSQL
- Support filtering by sister, event type, tags, person
- Join with photo_faces and people tables

```javascript
Query Parameters:
{
  sister?: 'sister-a' | 'sister-b',
  eventType?: string,
  tags?: string[],
  personId?: uuid,
  limit?: number,
  offset?: number
}

Response:
{
  photos: [...],
  total: number,
  hasMore: boolean
}
```

**DELETE /api/photos/:id**
- Delete photo from Supabase Storage
- Cascade delete photo metadata and face data from PostgreSQL

#### Face Recognition Endpoints (New)

**POST /api/faces/detect**
- Accept image and return detected faces with descriptors
- Used for initial face detection before upload

```javascript
Request Body (FormData):
{
  image: File
}

Response:
{
  faces: [
    {
      descriptor: number[], // 128-dimensional array
      boundingBox: { x, y, width, height },
      confidence: number
    }
  ]
}
```

**POST /api/faces/match**
- Match a face descriptor against known people
- Return best matches with confidence scores

```javascript
Request Body:
{
  descriptor: number[],
  threshold?: number // Default 0.6
}

Response:
{
  matches: [
    {
      personId: uuid,
      personName: string,
      distance: number,
      confidence: number
    }
  ]
}
```

**POST /api/people**
- Create a new person with reference photos
- Store face descriptors for future matching

```javascript
Request Body:
{
  name: string,
  role: string,
  sister: string,
  referenceFaces: [
    {
      descriptor: number[],
      photoId?: uuid
    }
  ]
}

Response:
{
  id: uuid,
  name: string,
  ...
}
```

**GET /api/people**
- List all people with their face descriptor counts

**GET /api/photos/:photoId/faces**
- Get all detected faces in a specific photo

---

## 4. Frontend Changes

### Configuration Files

**`frontend/src/lib/supabase.ts`** (New)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      photos: { ... },
      people: { ... },
      face_descriptors: { ... },
      photo_faces: { ... }
    }
  }
};
```

### Component Updates

#### `PhotoUpload.tsx` Modifications

**Key Changes:**
1. Remove storage provider selector (always use Supabase)
2. Detect faces on client-side before upload
3. Send face descriptors with photo upload
4. Show face detection status during upload
5. Allow manual person tagging before upload

**New Flow:**
```
1. User selects photos
2. For each photo:
   a. Display preview
   b. Auto-detect faces using face-api.js
   c. Show detected face boxes with confidence
   d. Allow user to tag detected faces with person names
   e. Allow manual face addition
3. On upload:
   a. Send photo + metadata + face descriptors to backend
   b. Backend stores in Supabase
   c. Backend performs server-side face matching
   d. Update UI with upload status
```

**New Interface:**
```typescript
interface PhotoFile {
  file: File;
  preview: string;
  title: string;
  description: string;
  eventType: string;
  tags: string[];
  destinationGallery: 'sister-a-gallery' | 'sister-b-gallery';
  faces: DetectedFace[]; // New
  status: 'pending' | 'detecting' | 'uploading' | 'completed' | 'error';
  progress: number;
  id: string;
}

interface DetectedFace {
  descriptor: Float32Array;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  personId?: string; // User-assigned person
  personName?: string; // Display name
}
```

#### `PhotoGallery.tsx` Modifications

**Key Changes:**
1. Fetch photos from backend (which now uses Supabase)
2. Display face-tagged people for each photo
3. Add person filter functionality
4. Show face detection overlay in viewer
5. Update photo viewer to highlight recognized faces

#### `services/photoService.ts` (New)

Create a centralized photo service for API calls:
```typescript
export const photoService = {
  uploadPhoto: async (data: PhotoUploadData) => { ... },
  getPhotos: async (filters: PhotoFilters) => { ... },
  deletePhoto: async (photoId: string) => { ... },
  detectFaces: async (image: File) => { ... },
  matchFace: async (descriptor: Float32Array) => { ... }
};
```

#### `services/faceRecognitionService.ts` (New)

Abstraction layer for face recognition:
```typescript
export const faceRecognitionService = {
  loadModels: async () => { ... },
  detectFaces: async (image: HTMLImageElement) => { ... },
  matchPerson: async (descriptor: Float32Array) => { ... },
  trainNewPerson: async (name: string, photos: File[]) => { ... }
};
```

---

## 5. Error Handling & Validation

### Backend Validation
- File type validation (images only)
- File size limits (10MB)
- Face descriptor validation (128 dimensions)
- Database constraint validation
- Transaction rollbacks on failures

### Frontend Validation
- Pre-upload validation
- Progressive error recovery
- User-friendly error messages
- Retry mechanisms for failed uploads

### Error Scenarios
1. **Upload Failures**: Rollback storage and database changes
2. **Face Detection Failures**: Allow upload without faces
3. **Face Matching Failures**: Store as "Unknown" person
4. **Network Issues**: Queue uploads for retry
5. **Storage Quota**: Clear error messaging

---

## 6. Security Considerations

### Authentication
- JWT-based auth for photographer portal (existing)
- Supabase RLS for database access control
- Signed URLs for private photos (if needed)

### Data Privacy
- Face descriptors are mathematical representations (not images)
- Compliance with privacy regulations (GDPR, CCPA)
- Option to disable face recognition per user request
- Data retention policies

### API Security
- Rate limiting on face detection endpoints
- Input sanitization and validation
- CORS configuration
- API key rotation procedures

---

## 7. Performance Optimization

### Database
- Proper indexing on frequently queried columns
- Pagination for photo lists
- Connection pooling

### Storage
- Image optimization before upload
- Thumbnail generation
- CDN integration (Supabase CDN)
- Lazy loading images

### Face Recognition
- Batch face detection on backend
- Caching face matcher instances
- Debounced face matching requests
- Progressive face detection (detect on view)

---

## 8. Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Supabase auto-scaling
- Connection pooling

### Data Growth
- Archival strategy for old photos
- Storage cleanup for deleted photos
- Face descriptor pruning

### Performance Monitoring
- Query performance tracking
- Upload success rates
- Face detection accuracy metrics
- API response times

---

## 9. Migration Strategy

### Phase 1: Setup (No User Impact)
1. Create Supabase tables
2. Set up storage bucket
3. Deploy backend changes (backwards compatible)

### Phase 2: Dual Write (No User Impact)
1. Write to both Firebase and Supabase
2. Validate data consistency
3. Monitor for errors

### Phase 3: Data Migration
1. Migrate existing photos from Firebase to Supabase
2. Run face detection on existing photos
3. Verify data integrity

### Phase 4: Cutover
1. Switch reads to Supabase
2. Disable Firebase writes for photos
3. Keep Firebase for wishes

### Phase 5: Cleanup
1. Remove Firebase photo code
2. Archive Firebase photo data
3. Update documentation

---

## 10. Testing Strategy

### Unit Tests
- Face descriptor validation
- Photo metadata validation
- Face matching accuracy

### Integration Tests
- Photo upload flow
- Face detection pipeline
- Data consistency checks

### E2E Tests
- Complete photographer workflow
- Guest photo browsing
- Face recognition accuracy

### Performance Tests
- Concurrent upload handling
- Large photo batch processing
- Face matching speed

---

## 11. Rollback Plan

### Immediate Rollback (< 1 hour)
- Revert backend deployment
- Switch frontend to Firebase endpoints
- Clear Supabase cache

### Data Rollback
- Keep Firebase data intact during migration
- Restore from Firebase backup if needed
- Maintain dual-write for safety period

---

## 12. Documentation Updates

### Developer Documentation
- API documentation (OpenAPI spec)
- Database schema documentation
- Setup instructions

### User Documentation
- Face recognition guide
- Privacy policy updates
- FAQ updates

---

## 13. Timeline Estimate

| Phase | Duration | Tasks |
|-------|----------|-------|
| Database Setup | 1 day | Tables, RLS, indexes |
| Backend Refactoring | 3 days | API endpoints, face recognition |
| Frontend Updates | 3 days | Components, services, UI |
| Testing | 2 days | Unit, integration, E2E |
| Migration | 1 day | Data transfer, validation |
| Deployment | 1 day | Production deploy, monitoring |
| **Total** | **11 days** | |

---

## 14. Success Metrics

### Technical Metrics
- Photo upload success rate > 99%
- Face detection rate > 95%
- Face recognition accuracy > 85%
- API response time < 500ms (p95)

### User Experience
- Upload time < 5 seconds per photo
- Gallery load time < 2 seconds
- Zero data loss during migration

---

## 15. Dependencies

### NPM Packages
```json
{
  "@supabase/supabase-js": "^2.75.0",
  "face-api.js": "latest"
}
```

### External Services
- Supabase project with Postgres and Storage
- Firebase project (wishes only)

---

## Appendix A: SQL Migration Scripts

See `backend/migrations/` directory for complete SQL scripts.

## Appendix B: Environment Variables Template

See `.env.example` files in backend and frontend directories.

## Appendix C: API Documentation

See `API_DOCUMENTATION.md` for complete OpenAPI specification.

