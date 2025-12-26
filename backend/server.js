require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

// Initialize Supabase (switched back from Firebase)
const { supabase } = require('./lib/supabase');
// Firebase (commented out - keeping for future migration)
// const { db, storage, checkFirebaseConnection } = require('./lib/firebase');

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
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
  'http://127.0.0.1:5173',
  // Deployed frontend URLs
  'https://weddingweb.co.in',
  'https://www.weddingweb.co.in',
  // Environment variable for dynamic URLs
  process.env.FRONTEND_URL,
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
app.use(express.json());

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

// Use Supabase wishes endpoint (switched back from Firebase)
const wishesRouter = require('./wishes-supabase');
app.use('/api/wishes', wishesRouter);

// Contact messages endpoint
const contactMessagesRouter = require('./routes/contact-messages');
app.use('/api/contact-messages', contactMessagesRouter);

// Call schedules endpoint
const callSchedulesRouter = require('./routes/call-schedules');
app.use('/api/call-schedules', callSchedulesRouter);

// Feedback endpoint
const feedbackRouter = require('./routes/feedback');
app.use('/api/feedback', feedbackRouter);

// N8N Integration endpoint
const n8nRouter = require('./routes/n8n-integration');
app.use('/api/n8n', n8nRouter);

// Firebase wishes endpoint (commented out - keeping for future migration)
// const wishesFirebaseRouter = require('./wishes');
// app.use('/api/wishes', wishesFirebaseRouter);

// Use simple authentication (works with basic users table)
const { router: authRouter, authenticateToken } = require('./auth-simple');
app.use('/api/auth', authRouter);

// Secure auth with RLS (commented out - needs RPC functions)
// const { router: authSecureRouter, authenticateToken: authSecureToken } = require('./auth-secure');
// app.use('/api/auth', authSecureRouter);

// Firebase authentication (commented out - keeping for future migration)
// const { router: authFirebaseRouter, authenticateToken: authFirebaseToken } = require('./auth');
// app.use('/api/auth', authFirebaseRouter);

const usersRouter = require('./users');
app.use('/api/users', authenticateToken, usersRouter);

const settingsRouter = require('./settings');
app.use('/api/settings', settingsRouter); // Public read, admin write

const analyticsRouter = require('./analytics');
app.use('/api/analytics', analyticsRouter); // Public track, admin read

// Wedding management API
const weddingsRouter = require('./routes/weddings');
app.use('/api/weddings', weddingsRouter); // Wedding customer management

// Use Supabase photos endpoint (switched back from Firebase)
const photosRouter = require('./photos-supabase');
app.use('/api/photos', photosRouter); // Authentication handled per-route in photos-supabase.js

// Firebase photos endpoint (commented out - keeping for future migration)
// const photosFirebaseRouter = require('./photos');
// app.use('/api/photos', photosFirebaseRouter);

// Local filesystem photo uploads (primary upload endpoint)
// Note: GET requests are public (for gallery), POST/DELETE require authentication
const photosLocalRouter = require('./photos-local');
app.use('/api/photos-local', photosLocalRouter);

// Enhanced photos API with face detection (Disabled - using Firebase-backed /api/photos instead)
// const photosEnhancedRouter = require('./photos-enhanced');
// app.use('/api/photos-enhanced', authenticateToken, photosEnhancedRouter);

// Face recognition API (Temporarily disabled during Supabase to Firebase migration)
// const facesRouter = require('./faces');
// app.use('/api/faces', facesRouter);

// Face detection routes - Enabled for face descriptor processing
const processFacesRouter = require('./routes/process-faces');
app.use('/api/process-faces', processFacesRouter);

// Other face detection routes (temporarily disabled)
// const faceDetectionTriggerRouter = require('./routes/face-detection-trigger');
// app.use('/api/face-detection', faceDetectionTriggerRouter);
// const autoFaceDetectionRouter = require('./routes/auto-face-detection');
// app.use('/api/auto-face-detection', autoFaceDetectionRouter);

// Live sync API routes
const liveSyncRouter = require('./routes/live-sync');
app.use('/api/live', liveSyncRouter);

// Premium membership & builder routes
const premiumRouter = require('./routes/premium');
app.use('/api/premium', premiumRouter);

// Face recognition endpoint (for photo booth feature)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { matchFace } = require('./lib/face-recognition');
const { PhotoDB } = require('./lib/supabase-db');

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
    // Using lenient threshold (0.75) for better matching
    // Distance < 0.75 = 25%+ confidence (lenient for wedding photos)
    console.log(`🔍 Matching face with threshold: 0.75 (25%+ confidence required)`);
    const matchResult = await matchFace(descriptor, 0.75, weddingName);
    
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

// Root endpoint - simple status message
app.get('/', (req, res) => {
  res.json({
    message: 'Backend is running'
  });
});

// Catch-all handler: return 404 for non-API routes
// Frontend should be served separately (e.g., Vite dev server or separate hosting)
app.use((req, res) => {
  // Skip API routes - they should have been handled above
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // For non-API routes, return 404
  res.status(404).json({ 
    error: 'Route not found',
    message: 'This is an API-only server. Frontend should be accessed separately.',
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
  console.log(`💾 Using Supabase for photo storage`);
  console.log(`🌐 CORS enabled for frontend support`);
  console.log(`   Allowed origins: ${allowedOrigins.length > 0 ? allowedOrigins.join(', ') : 'All (development mode)'}`);
  
  // Check Supabase connection
  if (supabase) {
    console.log('✅ Supabase client initialized');
  } else {
    console.warn('⚠️  Supabase client not initialized. Check environment variables.');
  }
  
  // Firebase connection check (commented out)
  // const isConnected = await checkFirebaseConnection();
  // if (isConnected) {
  //   console.log('✅ Firebase connection successful');
  // } else {
  //   console.warn('⚠️  Firebase connection check failed');
  // }
});
