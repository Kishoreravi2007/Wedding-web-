# Wedding Photo Gallery - File Organization

## 📁 Project Structure Overview

### Backend Files (Node.js/Express)

#### Core Backend Services
```
backend/
├── server.js                              # Main server file with routes
├── auth.js                                # Authentication routes
├── photos.js                              # Original photo routes
├── photos-enhanced.js                     # 🆕 Enhanced photo API with face detection
├── faces.js                               # 🔧 Enhanced face recognition API
├── wishes.js                              # Wishes management
└── register-photographer.js               # Photographer registration
```

#### Backend Libraries & Services
```
backend/
├── lib/
│   ├── face-recognition.js                # 🔧 Enhanced face matching algorithms
│   └── supabase-db.js                     # 🔧 Enhanced database operations
│
└── services/
    └── face-processing-service.js         # 🆕 Core face processing engine
```

#### Database & Configuration
```
backend/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql         # Database schema with face tables
│   └── run-migration.js                   # Migration runner
│
├── .env                                   # Backend environment variables
├── env.example                            # Environment template
└── package.json                           # Backend dependencies
```

#### Firebase Configuration
```
backend/
├── wedding-429e4-firebase-adminsdk-fbsvc-1ce2602299.json
└── weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json
```

---

### Frontend Files (React/TypeScript)

#### Main Application Files
```
frontend/
├── src/
│   ├── App.tsx                            # Main app component with routes
│   ├── main.tsx                           # Application entry point
│   └── vite-env.d.ts                      # TypeScript definitions
```

#### Core Components
```
frontend/src/components/
├── PhotoGallery.tsx                       # Main photo gallery
├── PhotoUpload.tsx                        # Original photo upload
├── PhotoUpload-simple.tsx                 # Simplified upload
├── PhotoUploadEnhanced.tsx                # 🆕 Enhanced upload with face detection
├── PeopleManager.tsx                      # People database management
├── PersonGallery.tsx                      # 🆕 Person-specific photo galleries
├── FaceVerificationPanel.tsx              # 🆕 Manual face verification UI
├── FaceRecognitionAnalytics.tsx           # 🆕 Analytics dashboard
├── WishBox.tsx                            # Wedding wishes component
└── MusicPlayer.tsx                        # Background music player
```

#### UI Components
```
frontend/src/components/ui/
├── button.tsx                             # Button component
├── card.tsx                               # Card component
├── input.tsx                              # Input component
├── select.tsx                             # Select dropdown
├── badge.tsx                              # Badge component
├── progress.tsx                           # Progress bar
├── dialog.tsx                             # Dialog/modal
├── tabs.tsx                               # Tabs component
├── slider.tsx                             # Slider component
└── alert.tsx                              # Alert component
```

#### Pages
```
frontend/src/pages/
├── Index.tsx                              # Landing page
├── Wishes.tsx                             # Wishes page
├── PhotoGallery.tsx                       # Gallery page
├── EventInvitation.tsx                    # Event invitation
├── NotFound.tsx                           # 404 page
│
├── sister-a/                              # Sister A's pages
│   ├── Layout.tsx
│   ├── Schedule.tsx                       # 🔧 Enhanced with HTML rendering
│   ├── PhotoBooth.tsx
│   └── EngagementVideo.tsx
│
├── sister-b/                              # Sister B's pages
│   ├── Layout.tsx
│   ├── Schedule.tsx                       # 🔧 Enhanced with HTML rendering
│   ├── PhotoBooth.tsx
│   └── EngagementVideo.tsx
│
├── photographer/                          # Photographer portal
│   ├── Login.tsx
│   └── Dashboard.tsx
│
├── couple/                                # Couple portal
│   ├── Login.tsx
│   └── Dashboard.tsx
│
└── admin/                                 # Admin portal
    ├── Login.tsx
    └── Dashboard.tsx
```

#### Data & Services
```
frontend/src/
├── data/
│   └── schedules.ts                       # 🔧 Event schedules with descriptions
│
├── services/
│   ├── fileUploadService.ts               # File upload service
│   ├── authService.ts                     # Authentication service
│   ├── photoService.ts                    # Photo service
│   └── wishService.ts                     # Wish service
│
├── contexts/
│   ├── WebsiteContext.tsx                 # Global website state
│   ├── AuthContext.tsx                    # Authentication context
│   └── ThemeContext.tsx                   # Theme context
│
└── hooks/
    ├── useAuth.ts                         # Authentication hook
    └── useWebsite.tsx                     # Website hook
```

#### Utilities
```
frontend/src/
├── utils/
│   ├── faceDetection.ts                   # Face detection utilities
│   └── toast.ts                           # Toast notifications
│
└── lib/
    ├── api.ts                             # API utilities
    ├── firebase.ts                        # Firebase config
    └── utils.ts                           # General utilities
```

#### Translations
```
frontend/src/
├── en.json                                # 🔧 English translations
├── ml.json                                # Malayalam translations
├── translation.json                       # Translation config
└── i18n.ts                                # i18n configuration
```

#### Styling
```
frontend/src/
├── globals.css                            # Global styles
└── index.css                              # Main CSS
```

#### Configuration Files
```
frontend/
├── .env                                   # Frontend environment variables
├── env.example                            # Environment template
├── package.json                           # Frontend dependencies
├── tsconfig.json                          # TypeScript config
├── vite.config.ts                         # Vite configuration
├── tailwind.config.ts                     # Tailwind CSS config
├── postcss.config.js                      # PostCSS config
├── eslint.config.js                       # ESLint config
└── components.json                        # UI components config
```

#### Public Assets
```
frontend/public/
├── models/                                # Face detection models
│   ├── tiny_face_detector_model-*
│   ├── face_landmark_68_model-*
│   ├── face_recognition_model-*
│   └── face_expression_model-*
│
├── images/                                # Static images
│   ├── wedding.jpg
│   ├── engagement-background.jpg
│   ├── reception-background.jpg
│   └── ...
│
├── audio/
│   └── wedding-music.mp3
│
├── index.html                             # HTML template
└── robots.txt                             # SEO robots file
```

---

## 🗂️ Documentation Files (Root Directory)

### Face Recognition Documentation
```
root/
├── FACE_RECOGNITION_README.md             # 🆕 Main README
├── FACE_RECOGNITION_SYSTEM.md             # 🆕 Complete system documentation
├── FACE_RECOGNITION_QUICKSTART.md         # 🆕 Quick start guide
├── FACE_RECOGNITION_INTEGRATION.md        # 🆕 Integration guide
└── FACE_RECOGNITION_IMPLEMENTATION_SUMMARY.md  # 🆕 Implementation summary
```

### Deployment & Debugging Documentation
```
root/
├── FACE_DETECTION_DEPLOYMENT_DEBUG.md     # 🆕 Deployment debugging guide
├── DEPLOYMENT_QUICK_FIX.md                # 🆕 Quick fix reference
├── DEPLOYMENT_TROUBLESHOOTING_SUMMARY.md  # 🆕 Troubleshooting summary
└── FILE_ORGANIZATION.md                   # 🆕 This file
```

### General Documentation
```
root/
├── README.md                              # Main project README
├── QUICK_START.md                         # Quick start guide
├── QUICK_REFERENCE.md                     # Quick reference
├── SETUP_GUIDE.md                         # Setup guide
├── SETUP_CHECKLIST.md                     # Setup checklist
├── TODO.md                                # Project TODOs
├── IMPLEMENTATION_SUMMARY.md              # Implementation summary
├── UPLOAD_READY.md                        # Upload readiness
├── PHOTOGRAPHER_UPLOAD_GUIDE.md           # Photographer guide
├── SUPABASE_REFACTORING_PLAN.md          # Supabase refactoring
└── FIREBASE_STORAGE_FIX.md               # Firebase fixes
```

### Frontend-Specific Documentation
```
frontend/
├── AI_RULES.md                            # AI development rules
├── DEPLOYMENT_GUIDE.md                    # Deployment guide
├── FIREBASE_SETUP.md                      # Firebase setup
├── PHOTOGRAPHER_PORTAL_FIXES.md           # Portal fixes
├── README.md                              # Frontend README
├── README-FACE-DETECTION.md               # Face detection README
├── README-PHOTOGRAPHER-PORTAL.md          # Photographer portal README
├── WEDDING_APP_GUIDE.md                   # Wedding app guide
└── TODO.md                                # Frontend TODOs
```

### Backend-Specific Documentation
```
backend/
└── supabase/
    └── README.md                          # Supabase setup instructions
```

---

## 🔧 Scripts & Tools

### Utility Scripts
```
scripts/
├── diagnose-face-detection.js             # 🆕 Diagnostic tool
├── fix-deployment.sh                      # 🆕 Automated fix script
└── copy-models.js                         # 🆕 Model copy script
```

---

## 📊 Key Changes Summary

### 🆕 New Files Created

**Backend (5 files):**
1. `backend/services/face-processing-service.js` - Face processing engine
2. `backend/photos-enhanced.js` - Enhanced photo API
3. Enhanced existing files: `faces.js`, `face-recognition.js`, `supabase-db.js`

**Frontend (4 files):**
1. `frontend/src/components/PhotoUploadEnhanced.tsx` - Enhanced upload
2. `frontend/src/components/PersonGallery.tsx` - Person galleries
3. `frontend/src/components/FaceVerificationPanel.tsx` - Verification UI
4. `frontend/src/components/FaceRecognitionAnalytics.tsx` - Analytics

**Documentation (8 files):**
1. `FACE_RECOGNITION_README.md`
2. `FACE_RECOGNITION_SYSTEM.md`
3. `FACE_RECOGNITION_QUICKSTART.md`
4. `FACE_RECOGNITION_INTEGRATION.md`
5. `FACE_RECOGNITION_IMPLEMENTATION_SUMMARY.md`
6. `FACE_DETECTION_DEPLOYMENT_DEBUG.md`
7. `DEPLOYMENT_QUICK_FIX.md`
8. `DEPLOYMENT_TROUBLESHOOTING_SUMMARY.md`

**Scripts (3 files):**
1. `scripts/diagnose-face-detection.js`
2. `scripts/fix-deployment.sh`
3. `scripts/copy-models.js` (created by fix script)

### 🔧 Modified Files

**Frontend (4 files):**
1. `frontend/src/en.json` - Updated wedding descriptions
2. `frontend/src/data/schedules.ts` - Updated with HTML formatting
3. `frontend/src/pages/sister-a/Schedule.tsx` - HTML rendering
4. `frontend/src/pages/sister-b/Schedule.tsx` - HTML rendering

**Backend (1 file):**
1. `backend/server.js` - Added face recognition routes

---

## 🚀 Quick File Lookup

### Need to Add Face Detection Features?
- **Backend API**: `backend/photos-enhanced.js`
- **Processing Logic**: `backend/services/face-processing-service.js`
- **Frontend Upload**: `frontend/src/components/PhotoUploadEnhanced.tsx`

### Need to Manage People Database?
- **Backend API**: `backend/faces.js`
- **Frontend UI**: `frontend/src/components/PeopleManager.tsx`

### Need Person-Specific Galleries?
- **Backend API**: `backend/photos-enhanced.js` (line 345+)
- **Frontend UI**: `frontend/src/components/PersonGallery.tsx`

### Need to Verify Faces?
- **Backend API**: `backend/faces.js` (line 163+)
- **Frontend UI**: `frontend/src/components/FaceVerificationPanel.tsx`

### Need Analytics?
- **Backend API**: `backend/photos-enhanced.js` (line 289+)
- **Frontend UI**: `frontend/src/components/FaceRecognitionAnalytics.tsx`

### Need to Update Wedding Descriptions?
- **Data**: `frontend/src/data/schedules.ts`
- **Translations**: `frontend/src/en.json`, `frontend/src/ml.json`

### Need to Debug Deployment?
- **Main Guide**: `FACE_DETECTION_DEPLOYMENT_DEBUG.md`
- **Quick Fix**: `DEPLOYMENT_QUICK_FIX.md`
- **Diagnostic Tool**: `scripts/diagnose-face-detection.js`

---

## 📝 File Naming Conventions

### Backend Files
- **Routes**: `[feature].js` (e.g., `photos.js`, `faces.js`)
- **Services**: `[feature]-service.js` (e.g., `face-processing-service.js`)
- **Libraries**: `[feature].js` in `lib/` folder
- **Config**: All lowercase with hyphens

### Frontend Files
- **Components**: `PascalCase.tsx` (e.g., `PhotoUpload.tsx`)
- **Pages**: `PascalCase.tsx` in `pages/` folder
- **Services**: `camelCase.ts` (e.g., `fileUploadService.ts`)
- **Utils**: `camelCase.ts` (e.g., `faceDetection.ts`)
- **Data**: `camelCase.ts` (e.g., `schedules.ts`)

### Documentation Files
- **All caps with underscores**: `FEATURE_NAME.md`
- **Hyphenated**: `feature-name.md` for scripts

---

## 🎯 Development Workflow

### Working on Backend
```bash
cd backend
npm install
npm start
```

### Working on Frontend
```bash
cd frontend
npm install
npm run dev
```

### Testing Face Detection
1. Ensure models are in `frontend/public/models/`
2. Start both backend and frontend
3. Navigate to photographer dashboard
4. Upload photos with PhotoUploadEnhanced component
5. Check analytics dashboard for results

---

**Last Updated**: October 2025
**Maintained By**: Wedding Photo Gallery Development Team

