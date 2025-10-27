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

// Face recognition endpoint (for frontend compatibility)
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Helper function: Match face descriptor against photos in database
async function handleDescriptorMatching(req, res, wedding_name, face_descriptor_json) {
  try {
    const { PhotoDB, PhotoFaceDB } = require('./lib/supabase-db');
    const { matchFace } = require('./lib/face-recognition');
    
    // Parse face descriptor
    let userDescriptor;
    try {
      userDescriptor = JSON.parse(face_descriptor_json);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid face descriptor format' });
    }
    
    console.log(`🎯 Matching face descriptor (${userDescriptor.length} dimensions)`);
    
    // Convert wedding_name format
    const sister = wedding_name.replace('_', '-');
    
    // Get all photos from this wedding
    const allPhotos = await PhotoDB.findAll({ sister: sister });
    console.log(`📷 Searching through ${allPhotos.length} photos in ${sister} gallery`);
    
    if (allPhotos.length === 0) {
      return res.json({
        message: 'No photos found in this wedding gallery yet.',
        matches: [],
        wedding: wedding_name,
        total: 0
      });
    }
    
    // Find photos with matching faces
    const matchedPhotoUrls = [];
    const matchThreshold = 0.6; // Euclidean distance threshold
    
    for (const photo of allPhotos) {
      try {
        // Get all faces in this photo
        const photoFaces = await PhotoFaceDB.findByPhotoId(photo.id);
        
        if (!photoFaces || photoFaces.length === 0) {
          // No faces detected in this photo yet - skip it
          continue;
        }
        
        // Check if any face in this photo matches the user's face
        for (const photoFace of photoFaces) {
          // Get the face descriptor for this face
          const { FaceDescriptorDB } = require('./lib/supabase-db');
          if (photoFace.face_descriptor_id) {
            const faceDesc = await FaceDescriptorDB.findById(photoFace.face_descriptor_id);
            
            if (faceDesc && faceDesc.descriptor) {
              // Calculate Euclidean distance
              const distance = euclideanDistance(userDescriptor, faceDesc.descriptor);
              
              if (distance <= matchThreshold) {
                console.log(`✅ Match found! Distance: ${distance.toFixed(3)}, Photo: ${photo.filename}`);
                matchedPhotoUrls.push(photo.public_url);
                break; // Found match in this photo, move to next photo
              }
            }
          }
        }
      } catch (photoError) {
        console.error(`Error processing photo ${photo.id}:`, photoError.message);
        // Continue with other photos
      }
    }
    
    console.log(`🎯 Found ${matchedPhotoUrls.length} photos with matching faces`);
    
    if (matchedPhotoUrls.length === 0) {
      return res.json({
        message: 'No photos with your face found. Either face detection hasn\'t been run on uploaded photos yet, or you\'re not in any photos from this wedding.',
        matches: [],
        wedding: wedding_name,
        total: 0,
        note: 'Make sure face detection has been run on all uploaded photos'
      });
    }
    
    return res.json({
      message: `Found ${matchedPhotoUrls.length} photo(s) with matching faces!`,
      matches: matchedPhotoUrls,
      wedding: wedding_name,
      total: matchedPhotoUrls.length,
      method: 'descriptor_matching'
    });
    
  } catch (error) {
    console.error('❌ Descriptor matching error:', error);
    return res.status(500).json({
      message: 'Face matching failed',
      error: error.message
    });
  }
}

// Euclidean distance calculation
function euclideanDistance(desc1, desc2) {
  if (desc1.length !== desc2.length) {
    throw new Error('Descriptors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < desc1.length; i++) {
    const diff = desc1[i] - desc2[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

app.post('/api/recognize', upload.single('file'), async (req, res) => {
  try {
    const { wedding_name, face_descriptor } = req.body;
    
    if (!wedding_name || !['sister_a', 'sister_b'].includes(wedding_name)) {
      return res.status(400).json({ 
        message: 'Invalid wedding_name. Must be sister_a or sister_b' 
      });
    }
    
    console.log(`🔍 Face recognition request for ${wedding_name}`);
    
    // Check if face descriptor was provided (new method)
    if (face_descriptor) {
      console.log('✅ Using face descriptor for matching');
      return await handleDescriptorMatching(req, res, wedding_name, face_descriptor);
    }
    
    // Fallback to image-based (old method)
    const imageBuffer = req.file?.buffer;
    if (!imageBuffer) {
      return res.status(400).json({ message: 'No image file or face descriptor provided' });
    }
    
    console.log(`📸 Image size: ${imageBuffer.length} bytes (fallback to gallery photos)`);
    
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
    
    // NOTE: For now, return ALL photos from the gallery
    // Real face matching requires:
    // 1. Face descriptors to be extracted from all photos (Python script)
    // 2. Face descriptor from user's selfie to be compared
    // 3. Database queries to match descriptors
    
    // Check if any photos have face descriptors
    const { PhotoFaceDB } = require('./lib/supabase-db');
    let photosWithFaces = [];
    
    try {
      // Try to find photos with actual face data
      for (const photo of photos) {
        const faces = await PhotoFaceDB.findByPhotoId(photo.id);
        if (faces && faces.length > 0) {
          photosWithFaces.push(photo.public_url);
        }
      }
    } catch (error) {
      console.log('⚠️  Face matching not available yet:', error.message);
    }
    
    // If we have photos with face data, use those (limited set)
    // Otherwise show all photos from the gallery
    const matchedPhotos = photosWithFaces.length > 0 
      ? photosWithFaces.slice(0, 10) // Limit to first 10 with faces
      : photoUrls.slice(0, 10); // Show first 10 photos overall
    
    res.json({
      message: photosWithFaces.length > 0 
        ? 'Showing photos with detected faces from this wedding.' 
        : 'Showing all photos from this wedding. (Face matching will be available once face detection is fully configured)',
      matches: matchedPhotos,
      wedding: wedding_name,
      total: matchedPhotos.length,
      note: 'Face matching requires face descriptors to be generated for all photos. Until then, showing gallery photos.'
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
