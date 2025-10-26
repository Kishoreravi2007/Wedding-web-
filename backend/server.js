require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const { supabase } = require('./lib/supabase');

// Initialize Firebase Admin SDK
let serviceAccount;

// Try to load service account from JSON string (for deployment) or file path (for local)
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // For deployment: JSON string in environment variable
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    console.log('✅ Loaded Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY');
  } catch (error) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT_KEY:', error.message);
    process.exit(1);
  }
} else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH) {
  // For local development: file path
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH.replace(/['"]/g, ''); // Remove quotes
    serviceAccount = require(serviceAccountPath);
    console.log('✅ Loaded Firebase service account from file:', serviceAccountPath);
  } catch (error) {
    console.error('❌ Error loading Firebase service account file:', error.message);
    process.exit(1);
  }
} else {
  console.error('Error: Neither FIREBASE_SERVICE_ACCOUNT_KEY nor FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set.');
  console.error('For deployment, set FIREBASE_SERVICE_ACCOUNT_KEY with the JSON content.');
  console.error('For local development, set FIREBASE_SERVICE_ACCOUNT_KEY_PATH with the file path.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Supabase client is now imported from lib/supabase.js
// This avoids circular dependency issues

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

// Face recognition endpoint (for frontend compatibility)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/recognize', upload.single('file'), async (req, res) => {
  try {
    const { wedding_name } = req.body;
    const imageBuffer = req.file.buffer;
    
    if (!wedding_name || !['sister_a', 'sister_b'].includes(wedding_name)) {
      return res.status(400).json({ 
        message: 'Invalid wedding_name. Must be sister_a or sister_b' 
      });
    }
    
    if (!imageBuffer) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    console.log(`🔍 Face recognition request for ${wedding_name}`);
    console.log(`📸 Image size: ${imageBuffer.length} bytes`);
    
    // Convert wedding_name format (sister_a -> sister-a)
    const sister = wedding_name.replace('_', '-');
    
    // Query actual photos from Supabase database
    const { PhotoDB } = require('./lib/supabase-db');
    const photos = await PhotoDB.findAll({ sister: sister });
    
    console.log(`📷 Found ${photos.length} total photos in ${sister} gallery`);
    
    if (photos.length === 0) {
      return res.json({
        message: 'No photos found in this wedding gallery yet.',
        matches: [],
        wedding: wedding_name,
        total: 0
      });
    }
    
    // Get photo URLs from database
    const photoUrls = photos.map(photo => photo.public_url);
    
    // TEMPORARY: Return random selection for face matching simulation
    // TODO: Replace with actual face descriptor comparison when face detection is fully set up
    const numMatches = Math.min(Math.floor(Math.random() * 3) + 1, photos.length);
    const matchedPhotos = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < numMatches; i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * photoUrls.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      matchedPhotos.push(photoUrls[randomIndex]);
    }
    
    // 80% chance of finding matches
    const shouldFindMatches = Math.random() > 0.2;
    
    if (!shouldFindMatches || matchedPhotos.length === 0) {
      return res.json({
        message: 'No matching photos found for this face.',
        matches: [],
        wedding: wedding_name,
        total: 0
      });
    }
    
    res.json({
      message: 'Photos found!',
      matches: matchedPhotos,
      wedding: wedding_name,
      total: matchedPhotos.length,
      note: 'Using random selection - real face matching requires face detection to be fully configured'
    });
    
  } catch (error) {
    console.error('❌ Face recognition error:', error);
    res.status(500).json({ 
      message: 'Face recognition failed',
      error: error.message 
    });
  }
});

// Supabase client is exported from lib/supabase.js
// No need to export from here


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📸 Upload endpoint: http://localhost:${PORT}/api/photos-local`);
  console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth/login`);
});
