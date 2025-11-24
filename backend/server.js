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

// Configure CORS for frontend-backend communication (local + deployed)
app.use(cors({
  origin: [
    // Local development URLs
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002', 
    'http://localhost:3003', 
    'http://localhost:5173',
    // Deployed frontend URLs (add your deployed domain)
    'https://weddingweb.co.in',
    'https://www.weddingweb.co.in',
    // Add any other deployed URLs you use
    process.env.FRONTEND_URL, // Environment variable for dynamic URLs
  ].filter(Boolean), // Remove undefined values
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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
    
    // Match the face against known faces (threshold 0.6 = 60% similarity)
    const matchResult = await matchFace(descriptor, 0.6);
    
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
    
    // Fetch photo details
    const photos = [];
    for (const photoId of photoIds) {
      try {
        const photo = await PhotoDB.findById(photoId);
        if (photo) {
          // If a wedding is specified, only include photos from that wedding
          if (weddingName && photo.sister !== weddingName) {
            console.log(`⏭️  Skipping photo ${photo.filename} (belongs to ${photo.sister}, requested ${weddingName})`);
            continue;
          }

          photos.push({
            id: photo.id,
            url: photo.public_url,
            filename: photo.filename,
            title: photo.title,
            sister: photo.sister
          });
        }
      } catch (err) {
        console.error(`Error fetching photo ${photoId}:`, err);
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

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Create HTTP server for WebSocket support
const httpServer = http.createServer(app);

// Initialize WebSocket server
const { initializeWebSocketServer } = require('./websocket-server');
const io = initializeWebSocketServer(httpServer);

// Make io available globally for emitting events from routes
app.locals.io = io;

httpServer.listen(PORT, async () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📸 Upload endpoint: http://localhost:${PORT}/api/photos`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log(`📡 Live sync endpoint: http://localhost:${PORT}/api/live/uploadPhoto`);
  console.log(`🔌 WebSocket server: ws://localhost:${PORT}`);
  console.log(`💾 Using Supabase for photo storage`);
  
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
