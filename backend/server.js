require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
if (!serviceAccountPath) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set.');
  process.exit(1);
}
const serviceAccount = require(serviceAccountPath);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) not fully set. Supabase storage will not be available.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const PORT = process.env.PORT || 5001; // Changed from 5000 to avoid macOS AirPlay conflict

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

const wishesRouter = require('./wishes');
app.use('/api/wishes', wishesRouter);

const { router: authRouter, authenticateToken } = require('./auth');
app.use('/api/auth', authRouter);

const photosRouter = require('./photos');
app.use('/api/photos', authenticateToken, photosRouter);

// Enhanced photos API with face detection
const photosEnhancedRouter = require('./photos-enhanced');
app.use('/api/photos-enhanced', authenticateToken, photosEnhancedRouter);

// Face recognition API
const facesRouter = require('./faces');
app.use('/api/faces', facesRouter);

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
    
    // For now, return sample matching photos based on wedding selection
    // This is a placeholder - in production you'd use face recognition
    // Convert file paths to full URLs that the frontend can access
    // Use environment variable for deployed URL or fallback to localhost
    const baseUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    const samplePhotos = wedding_name === 'sister_a' 
      ? [
          `${baseUrl}/uploads/wedding_gallery/sister_a/IMG_0309_Original.heic`,
          `${baseUrl}/uploads/wedding_gallery/sister_a/IMG20230831163922_01.jpg`
        ]
      : [
          `${baseUrl}/uploads/wedding_gallery/sister_b/1.jpeg`,
          `${baseUrl}/uploads/wedding_gallery/sister_b/2.jpeg`,
          `${baseUrl}/uploads/wedding_gallery/sister_b/3.jpeg`
        ];
    
    console.log(`🔍 Face recognition request for ${wedding_name}`);
    console.log(`📸 Image size: ${imageBuffer.length} bytes`);
    
    res.json({
      message: 'Photos found!',
      matches: samplePhotos,
      wedding: wedding_name,
      total: samplePhotos.length
    });
    
  } catch (error) {
    console.error('❌ Face recognition error:', error);
    res.status(500).json({ 
      message: 'Face recognition failed',
      error: error.message 
    });
  }
});

// Export supabase client for use in other modules (fix circular dependency)
if (supabase) {
  module.exports.supabase = supabase;
}


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
