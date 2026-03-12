require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Firebase (Replaced Supabase with Firebase for database and storage)
const { db, storage, checkFirebaseConnection } = require('./lib/firebase');

// Discord Bot (starts automatically — no HTTP dependency)
require('./discord/bot');
// const { supabase } = require('./lib/supabase');

const app = express();
const PORT = process.env.PORT || 5001; // Use 5001 to avoid macOS AirPlay conflict on port 5000

// Configure CORS for frontend-backend communication
// Backend supports frontend running on separate ports/domains
const allowedOrigins = [
  // Local development URLs (Vite dev server and common ports)
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173', // Vite default port
  'http://localhost:5192', // Current user port
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5192',
  // Deployed frontend URLs
  'https://weddingweb.co.in',
  'https://www.weddingweb.co.in',
  // Environment variable for dynamic URLs
  process.env.FRONTEND_URL,
  // Cloud Storage hosting origin
  'https://storage.googleapis.com',
  'https://weddingweb.co.in',
  'https://www.weddingweb.co.in',
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (same-origin requests, mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow all origins for flexibility
      // In production, you may want to restrict this
      if (process.env.NODE_ENV === 'production') {
        console.warn(`⚠️  CORS: Blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      } else {
        // Development: allow all origins
        callback(null, true);
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint - useful for frontend to verify backend connectivity
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend API is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Wedding Website API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      photos: '/api/photos',
      photosLocal: '/api/photos-local',
      wishes: '/api/wishes',
      weddings: '/api/weddings',
      contact: '/api/contact-messages',
      feedback: '/api/feedback',
      recognize: '/api/recognize'
    },
    cors: {
      enabled: true,
      allowedOrigins: allowedOrigins.length > 0 ? 'configured' : 'all (development)'
    }
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('📁 Serving static files from:', path.join(__dirname, '../uploads'));

// Serve backend directory for face detection reference images and mappings
app.use('/backend', express.static(path.join(__dirname)));
console.log('📁 Serving backend files from:', path.join(__dirname));

// Use wishes endpoint
// const wishesRouter = require('./wishes');
// app.use('/api/wishes', wishesRouter);

// Firebase wishes endpoint
const wishesFirebaseRouter = require('./wishes');
app.use('/api/wishes', wishesFirebaseRouter);

// Secure SQL authentication (Replaced Firebase)
const { router: authRouter } = require('./auth-new');
const { authMiddleware } = require('./lib/secure-auth');

app.use('/api/auth', authRouter);

const usersRouter = require('./users');
app.use('/api/users', authMiddleware.verifyToken, usersRouter);

const settingsRouter = require('./settings');
app.use('/api/settings', settingsRouter); // Public read, admin write

const analyticsRouter = require('./analytics');
app.use('/api/analytics', analyticsRouter); // Public track, admin read

// Wedding management API
const weddingsRouter = require('./routes/weddings');
app.use('/api/weddings', weddingsRouter); // Wedding customer management

// Firebase photos endpoint (Replaced with SQL-backed photos-new)
const photosFirebaseRouter = require('./photos-new');
app.use('/api/photos', photosFirebaseRouter);

// Local filesystem photo uploads (primary upload endpoint)
// Note: GET requests are public (for gallery), POST/DELETE require authentication
const photosLocalRouter = require('./photos-local');
app.use('/api/photos-local', photosLocalRouter);

// Enhanced photos API with face detection (Disabled - using Firebase-backed /api/photos instead)
// const photosEnhancedRouter = require('./photos-enhanced');
// app.use('/api/photos-enhanced', authenticateToken, photosEnhancedRouter);

// Face recognition API - Re-enabled for photographer portal face matching
const facesRouter = require('./faces');
app.use('/api/faces', facesRouter);

// Face detection routes - Enabled for face descriptor processing
const processFacesRouter = require('./routes/process-faces');
app.use('/api/process-faces', processFacesRouter);

// Auto face detection routes - Enabled for automated processing
const faceDetectionTriggerRouter = require('./routes/face-detection-trigger');
app.use('/api/face-detection', faceDetectionTriggerRouter);
const autoFaceDetectionRouter = require('./routes/auto-face-detection');
app.use('/api/auto-face-detection', autoFaceDetectionRouter);

// Live sync API routes
const liveSyncRouter = require('./routes/live-sync');
app.use('/api/live', liveSyncRouter);

// Premium membership & builder routes
const premiumRouter = require('./routes/premium');
app.use('/api/premium', premiumRouter);

// Coupons management
const couponsRouter = require('./routes/coupons');
app.use('/api/coupons', couponsRouter);

// Resolve 404 errors on Client Portal
const profilesRouter = require('./routes/profiles');
app.use('/api/profiles', profilesRouter);

const guestsRouter = require('./routes/guests');
app.use('/api/guests', guestsRouter);

const timelineRouter = require('./routes/timeline');
app.use('/api/timeline', timelineRouter);

const aiRouter = require('./routes/ai');
app.use('/api/ai', aiRouter);


// Face recognition endpoint (for photo booth feature)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { matchFace } = require('./lib/face-recognition-logic');
const { PhotoDB } = require('./lib/sql-db');

// POST /api/recognize - Find photos by face descriptor
app.post('/api/recognize', upload.none(), async (req, res) => {
  try {
    // Photo booth sends FormData with face_descriptor as JSON string
    let descriptor;
    const weddingName = req.body.wedding_name;

    if (weddingName && !['sister-a', 'sister-b'].includes(weddingName)) {
      return res.status(400).json({
        message: 'Invalid wedding name. Expected "sister-a" or "sister-b".'
      });
    }

    if (req.body.face_descriptor) {
      // Parse from FormData
      descriptor = JSON.parse(req.body.face_descriptor);
      console.log('✅ Parsed descriptor from FormData');
    } else if (req.body.descriptor) {
      // Accept direct descriptor (for backwards compatibility)
      descriptor = req.body.descriptor;
      console.log('✅ Received descriptor from JSON body');
    } else {
      return res.status(400).json({
        message: 'Face descriptor is required (send as face_descriptor in FormData or descriptor in JSON)'
      });
    }

    if (!Array.isArray(descriptor)) {
      return res.status(400).json({
        message: 'Face descriptor must be an array'
      });
    }

    console.log(`🔍 Face recognition request with descriptor length: ${descriptor.length}`);
    if (weddingName) {
      console.log(`🎯 Filtering matches to wedding: ${weddingName}`);
    }

    // Match the face against known faces, filtered by wedding if provided
    // Using TUNED threshold (0.55) based on calibration (simulated positive=0.49, negative=0.61)
    // Distance < 0.55 = match
    console.log(`🔍 Matching face with threshold: 0.55 (45%+ confidence required)`);
    const matchResult = await matchFace(descriptor, 0.55, weddingName);


    if (!matchResult.matches || matchResult.matches.length === 0) {
      console.log('❌ No matching faces found');
      return res.json({
        message: 'No matching photos found.',
        matches: []
      });
    }

    console.log(`✅ Found ${matchResult.matches.length} matching face(s)`);

    // Get unique photo IDs from matches
    const photoIds = [...new Set(matchResult.matches.map(m => m.photoId).filter(Boolean))];

    // Fetch photo details with STRICT wedding filtering
    const photos = [];
    console.log(`🔍 Step 3: Fetching ${photoIds.length} photo details...`);

    for (const photoId of photoIds) {
      try {
        const photo = await PhotoDB.findById(photoId);
        if (!photo) {
          console.log(`⚠️  Photo ${photoId} not found`);
          continue;
        }

        // CRITICAL: Strict wedding check - reject if doesn't match
        if (weddingName && photo.sister !== weddingName) {
          console.error(`❌ REJECTING photo ${photo.filename} (belongs to ${photo.sister}, requested ${weddingName})`);
          console.error(`   This should not happen - wedding filter should have prevented this!`);
          continue;
        }

        // Verify photo has valid fields
        if (!photo.public_url) {
          console.warn(`⚠️  Photo ${photo.filename} missing public_url, skipping`);
          continue;
        }

        console.log(`✅ Including photo ${photo.filename} from ${photo.sister || 'unknown'}`);

        photos.push({
          id: photo.id,
          url: photo.public_url,
          filename: photo.filename,
          title: photo.title,
          sister: photo.sister
        });
      } catch (err) {
        console.error(`❌ Error fetching photo ${photoId}:`, err);
      }
    }

    // FINAL VERIFICATION: Ensure all returned photos belong to correct wedding
    if (weddingName) {
      const wrongWeddingPhotos = photos.filter(p => p.sister !== weddingName);
      if (wrongWeddingPhotos.length > 0) {
        console.error(`❌ CRITICAL ERROR: Returning ${wrongWeddingPhotos.length} photos from wrong wedding!`);
        wrongWeddingPhotos.forEach(p => {
          console.error(`   Photo ${p.filename}: sister=${p.sister}, expected=${weddingName}`);
        });
        // Filter them out
        const correctPhotos = photos.filter(p => p.sister === weddingName);
        console.log(`✅ Filtered to ${correctPhotos.length} correct photos`);
        photos.length = 0;
        photos.push(...correctPhotos);
      }
    }

    console.log(`📸 Returning ${photos.length} photo(s)`);

    const responsePayload = {
      message: photos.length > 0 ? 'Photos found!' : 'No matching photos found.',
      matches: photos,
      matchCount: photos.length,
      bestMatch: matchResult.bestMatch
    };

    if (weddingName) {
      responsePayload.wedding = weddingName;
    }

    res.json(responsePayload);

  } catch (error) {
    console.error('❌ Face recognition error:', error);
    res.status(500).json({
      message: 'Error during face recognition',
      error: error.message
    });
  }
});

// API routes should be handled before the catch-all route
// All API routes are already defined above

// POST /api/photos/check-face-match - Quick check if a specific photo contains a matching face
// Used by the live mode feature to check new photos in real-time
app.post('/api/photos/check-face-match', upload.none(), async (req, res) => {
  try {
    const weddingName = req.body.wedding_name;
    const photoId = req.body.photo_id;

    // Parse face descriptor
    let descriptor;
    if (req.body.face_descriptor) {
      descriptor = JSON.parse(req.body.face_descriptor);
    } else if (req.body.descriptor) {
      descriptor = req.body.descriptor;
    } else {
      return res.status(400).json({
        message: 'Face descriptor is required',
        matches: false
      });
    }

    if (!photoId) {
      return res.status(400).json({
        message: 'Photo ID is required',
        matches: false
      });
    }

    if (!Array.isArray(descriptor)) {
      return res.status(400).json({
        message: 'Face descriptor must be an array',
        matches: false
      });
    }

    console.log(`🔍 Quick face match check for photo ${photoId}`);

    // Get the photo from the database
    const photo = await PhotoDB.findById(photoId);

    if (!photo) {
      return res.json({
        matches: false,
        message: 'Photo not found'
      });
    }

    // Check wedding filter
    if (weddingName && photo.sister !== weddingName) {
      return res.json({
        matches: false,
        message: 'Photo belongs to different wedding'
      });
    }

    // Use the matchFace function to check if this photo matches
    const matchResult = await matchFace(descriptor, 0.75, weddingName);
    const photoMatch = matchResult.matches.find(m => m.photoId === photoId);

    if (photoMatch) {
      console.log(`📸 Photo ${photoId} MATCHES! (distance: ${photoMatch.distance.toFixed(3)})`);
      return res.json({
        matches: true,
        similarity: 1 - photoMatch.distance,
        photoId: photoId,
        url: photo.public_url
      });
    }

    console.log(`📸 Photo ${photoId} does not match`);
    res.json({
      matches: false,
      message: 'No matching face in photo'
    });

  } catch (error) {
    console.error('❌ Quick face match error:', error);
    res.status(500).json({
      matches: false,
      message: 'Error checking face match',
      error: error.message
    });
  }
});



// Root endpoint - simple status message
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running'
  });
});

// FRONTEND SERVING (Production Only)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, 'build');
  app.use(express.static(buildPath));

  // All other requests should serve index.html for SPA routing
  app.use((req, res, next) => {
    // API and uploads are already handled or should fall through to 404
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// Catch-all handler: return 404 for non-API routes
app.use((req, res) => {
  // Skip API routes - they should have been handled above
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // If we reached here in production, index.html should have been served already
  // but if buildPath is missing or file not found, we fall through to here
  res.status(404).json({
    error: 'Route not found',
    message: 'This is an API-only server. Frontend should be accessed separately or build/index.html is missing.',
    availableEndpoints: '/api'
  });
});

// Create HTTP server for WebSocket support
const httpServer = http.createServer(app);

// Initialize WebSocket server
const { initializeWebSocketServer } = require('./websocket-server');
const io = initializeWebSocketServer(httpServer);

// Make io available globally for emitting events from routes
app.locals.io = io;

httpServer.listen(PORT, async () => {
  console.log(`✅ Backend API server running on http://localhost:${PORT}`);
  console.log(`📋 API Info: http://localhost:${PORT}/api`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`📸 Upload endpoint: http://localhost:${PORT}/api/photos`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📡 Live sync endpoint: http://localhost:${PORT}/api/live/uploadPhoto`);
  console.log(`🔌 WebSocket server: ws://localhost:${PORT}`);
  console.log(`💾 Using Firebase for photo storage and database`);
  console.log(`🌐 CORS enabled for frontend support`);
  console.log(`   Allowed origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'All (development mode)'}`);

  // Firebase connection check
  const isConnected = await checkFirebaseConnection();
  if (isConnected) {
    console.log('✅ Firebase connection successful');
  } else {
    console.warn('⚠️  Firebase connection check failed');
  }
});
