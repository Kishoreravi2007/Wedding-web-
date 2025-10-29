require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize Firebase (moved to lib/firebase.js for better organization)
const { db, storage, checkFirebaseConnection } = require('./lib/firebase');

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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
console.log('📁 Serving static files from:', path.join(__dirname, '../uploads'));

// Serve backend directory for face detection reference images and mappings
app.use('/backend', express.static(path.join(__dirname)));
console.log('📁 Serving backend files from:', path.join(__dirname));

const wishesRouter = require('./wishes');
app.use('/api/wishes', wishesRouter);

const { router: authRouter, authenticateToken } = require('./auth');
app.use('/api/auth', authRouter);

const usersRouter = require('./users');
app.use('/api/users', authenticateToken, usersRouter);

const settingsRouter = require('./settings');
app.use('/api/settings', settingsRouter); // Public read, admin write

const analyticsRouter = require('./analytics');
app.use('/api/analytics', analyticsRouter); // Public track, admin read

const photosRouter = require('./photos');
app.use('/api/photos', photosRouter); // Authentication handled per-route in photos.js

// Local filesystem photo uploads (primary upload endpoint)
// Note: GET requests are public (for gallery), POST/DELETE require authentication
const photosLocalRouter = require('./photos-local');
app.use('/api/photos-local', photosLocalRouter);

// Enhanced photos API with face detection
const photosEnhancedRouter = require('./photos-enhanced');
app.use('/api/photos-enhanced', authenticateToken, photosEnhancedRouter);

// Face recognition API
const facesRouter = require('./faces');
app.use('/api/faces', facesRouter);

// Face detection trigger API (automatic processing)
const faceDetectionTriggerRouter = require('./routes/face-detection-trigger');
app.use('/api/face-detection', faceDetectionTriggerRouter);

// Face processing API (store face descriptors)
const processFacesRouter = require('./routes/process-faces');
app.use('/api/process-faces', processFacesRouter);

// Auto face detection API
const autoFaceDetectionRouter = require('./routes/auto-face-detection');
app.use('/api/auto-face-detection', autoFaceDetectionRouter);

// Face recognition endpoint (for frontend compatibility)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, async () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📸 Upload endpoint: http://localhost:${PORT}/api/photos-local`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
  
  // Check Firebase connection
  const isConnected = await checkFirebaseConnection();
  if (isConnected) {
    console.log('✅ Firebase connection successful');
  } else {
    console.warn('⚠️  Firebase connection check failed');
  }
});
