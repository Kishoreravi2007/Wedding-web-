/**
 * Wedding Web Application Server
 * 
 * Backend server with:
 * - Supabase for photo storage and face recognition
 * - Firebase for wishes management
 */

require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// =============================================================================
// FIREBASE INITIALIZATION (for wishes only)
// =============================================================================
if (serviceAccountPath) {
  try {
    const serviceAccount = require(serviceAccountPath);
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    console.log('✅ Firebase initialized successfully (for wishes)');
  } catch (error) {
    console.warn('⚠️ Warning: Firebase initialization failed. Wishes feature might not work:', error.message);
  }
} else {
  console.log('ℹ️ Firebase service account path not provided. Skipping Firebase initialization.');
}

// =============================================================================
// SUPABASE INITIALIZATION (REMOVED - Migrated to Cloud SQL & GCS)
// =============================================================================
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// if (!supabaseUrl || !supabaseAnonKey) {
//   console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
//   console.error('   Photos and face recognition will not work without Supabase configuration');
//   process.exit(1);
// }

// // Create Supabase client with anon key for general operations
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

// // Create admin client with service role key for admin operations
// const supabaseAdmin = supabaseServiceKey 
//   ? createClient(supabaseUrl, supabaseServiceKey)
//   : null;

// console.log('✅ Supabase initialized successfully');
// console.log(`   URL: ${supabaseUrl}`);

// // Export supabase clients for use in other modules
// module.exports.supabase = null; // supabase;
// module.exports.supabaseAdmin = null; // supabaseAdmin;

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// =============================================================================
// ROUTES
// =============================================================================

// Health check
app.get('/', (req, res) => {
  res.json({
    message: 'Wedding Web Backend API',
    status: 'running',
    version: '2.0.0',
    services: {
      firebase: admin.apps.length > 0 ? '✓' : '✗',
      gcp_sql: '✓ (photos, faces)',
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Check Firebase
  try {
    await admin.firestore().collection('wishes').limit(1).get();
    health.services.firebase = { status: 'connected', purpose: 'wishes' };
  } catch (error) {
    health.services.firebase = { status: 'error', error: error.message };
    health.status = 'degraded';
  }

  // Check Database (Cloud SQL)
  try {
    const { query } = require('./lib/db-gcp');
    await query('SELECT 1');
    health.services.database = { status: 'connected', purpose: 'photos, faces, profiles, auth' };
  } catch (error) {
    health.services.database = { status: 'error', error: error.message };
    health.status = 'degraded';
  }

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Wishes routes (Firebase)
const wishesRouter = require('./wishes');
app.use('/api/wishes', wishesRouter);

// Authentication routes
const { router: authRouter, authenticateToken } = require('./auth');
app.use('/api/auth', authRouter);

// Photos routes (Supabase) - Use new version
const photosRouter = require('./photos-new');
app.use('/api/photos', authenticateToken, photosRouter);

// Face recognition routes (Supabase)
const facesRouter = require('./faces');
app.use('/api/faces', authenticateToken, facesRouter);

// Profile routes (Cloud SQL)
const profilesRouter = require('./routes/profiles');
app.use('/api/profiles', profilesRouter);

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api/wishes',
      'POST /api/wishes',
      'POST /api/auth/login',
      'GET /api/photos',
      'POST /api/photos',
      'DELETE /api/photos/:id',
      'POST /api/faces/match',
      'GET /api/faces/people',
      'POST /api/faces/people'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);

  res.status(error.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// =============================================================================
// SERVER START
// =============================================================================

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 Wedding Web Application Server Started');
  console.log('='.repeat(80));
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📋 API Endpoints:`);
  console.log(`   Health:         http://localhost:${PORT}/health`);
  console.log(`   Wishes:         http://localhost:${PORT}/api/wishes`);
  console.log(`   Photos:         http://localhost:${PORT}/api/photos`);
  console.log(`   Face Recognition: http://localhost:${PORT}/api/faces`);
  console.log(`   Authentication: http://localhost:${PORT}/api/auth`);
  console.log('\n' + '='.repeat(80) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 SIGTERM received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received. Closing server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;

