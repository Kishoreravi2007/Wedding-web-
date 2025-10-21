/**
 * Firebase Authentication Backend Server
 * 
 * This server uses Firebase Authentication for user management
 * with custom claims for role-based access control.
 */

require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
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
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

// Initialize Supabase client (for photos and face recognition)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase environment variables not set. Photo features will not be available.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting (basic implementation)
const rateLimitMap = new Map();
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // Max requests per window
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return next();
  }
  
  const userLimit = rateLimitMap.get(ip);
  
  if (now - userLimit.firstRequest > windowMs) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return next();
  }
  
  if (userLimit.count >= maxRequests) {
    return res.status(429).json({ message: 'Too many requests, please try again later.' });
  }
  
  userLimit.count++;
  next();
});

// Import Firebase authentication router
const firebaseAuthRouter = require('./auth-firebase');
const { authMiddleware } = require('./lib/firebase-auth');

// Import other routers
const wishesRouter = require('./wishes');
const photosRouter = require('./photos');
const photosEnhancedRouter = require('./photos-enhanced');
const facesRouter = require('./faces');

// Routes
app.use('/api/auth', firebaseAuthRouter);
app.use('/api/wishes', wishesRouter);
app.use('/api/photos', authMiddleware.verifyFirebaseToken, photosRouter);
app.use('/api/photos-enhanced', authMiddleware.verifyFirebaseToken, photosEnhancedRouter);
app.use('/api/faces', facesRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test Firebase connection
    await admin.auth().listUsers(1);
    
    // Test Supabase connection if configured
    let supabaseStatus = 'not configured';
    if (supabaseUrl && supabaseAnonKey) {
      try {
        const { data } = await supabase.from('photos').select('count').limit(1);
        supabaseStatus = 'connected';
      } catch (error) {
        supabaseStatus = 'error';
      }
    }
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        firebase_auth: 'connected',
        supabase: supabaseStatus
      },
      security: {
        firebase_auth: true,
        rate_limiting: true,
        custom_claims: true
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Wedding Website Backend - Firebase Auth',
    version: '2.0.0',
    authentication: 'Firebase Auth',
    endpoints: {
      auth: '/api/auth',
      photos: '/api/photos',
      wishes: '/api/wishes',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    message: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Export clients for use in other modules
module.exports.supabase = supabase;
module.exports.admin = admin;

// Start server
app.listen(PORT, () => {
  console.log('🔥 Firebase Authentication Backend Server');
  console.log('========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔐 Authentication: Firebase Auth`);
  console.log(`👥 User Management: Firebase Admin SDK`);
  console.log(`🛡️ Security: Custom claims & role-based access`);
  console.log(`🌐 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
  console.log('');
  console.log('📝 Available endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/auth/register - User registration');
  console.log('   POST /api/auth/verify-token - Token verification');
  console.log('   GET  /api/auth/profile - User profile');
  console.log('   POST /api/photos - Upload photos (authenticated)');
  console.log('   GET  /api/wishes - Get wishes');
  console.log('');
  console.log('🔐 Authentication required for:');
  console.log('   - Photo uploads (Firebase token)');
  console.log('   - Photo management (Firebase token)');
  console.log('   - Profile updates (Firebase token)');
  console.log('');
  console.log('✅ Server is ready with Firebase Authentication!');
});
