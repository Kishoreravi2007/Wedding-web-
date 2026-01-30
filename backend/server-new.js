/**
 * Wedding Web Application Server
 * 
 * Backend server with:
 * - Cloud SQL (PostgreSQL) for photos, faces, profiles, and wishes
 * - Google Cloud Storage for photo files
 */

require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const emailService = require('./services/email-service');


// =============================================================================
// FIREBASE INITIALIZATION (for wishes only)
// =============================================================================
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
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
// CLOUD SQL & GCS (Migrated from Supabase)
// =============================================================================
// Database connection is handled in lib/db-gcp.js
// Photos are stored in Google Cloud Storage via lib/gcs-storage.js

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

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, process.env.LOCAL_STORAGE_PATH || 'uploads');
app.use('/uploads', express.static(uploadsPath));

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
      gcp_sql: '✓ (photos, faces, wishes)',
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

  // Check Firebase (Optional now)
  if (admin.apps.length > 0) {
    try {
      await admin.firestore().collection('wishes').limit(1).get();
      health.services.firebase = { status: 'connected' };
    } catch (error) {
      health.services.firebase = { status: 'error', error: error.message };
    }
  }

  // Check Database (Cloud SQL)
  try {
    const { query } = require('./lib/db-gcp');
    await query('SELECT 1');
    health.services.database = { status: 'connected', purpose: 'photos, faces, profiles, auth, wishes' };
  } catch (error) {
    health.services.database = { status: 'error', error: error.message };
    health.status = 'degraded';
  }

  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});

// Wishes routes (Firebase)
const wishesRouter = require('./wishes');
app.use('/api/wishes', wishesRouter);

// Contact/Leads routes (Supabase)
const contactMessagesRouter = require('./routes/contact-messages');
app.use('/api/contact-messages', contactMessagesRouter);

// Authentication routes
const { router: authRouter, authenticateToken } = require('./auth');
app.use('/api/auth', authRouter);

// Photos routes (Supabase) - Use new version
console.log('📦 Loading photos router from ./photos-new');
const photosRouter = require('./photos-new');
app.use('/api/photos', photosRouter);

// Face recognition routes (Cloud SQL)
const facesRouter = require('./faces');
app.use('/api/faces', facesRouter); // Auth handled per-route inside facesRouter

// Profile routes (Cloud SQL)
const profilesRouter = require('./routes/profiles');
app.use('/api/profiles', profilesRouter);

// Admin setup routes (one-time user creation)
const adminSetupRouter = require('./routes/admin-setup');
app.use('/api/admin', adminSetupRouter);

// AI Generation Routes
app.use('/api/ai', require('./routes/ai'));

// Email Test Route (Development only)
app.post('/api/email/test', async (req, res) => {
  const { to } = req.body;
  const result = await emailService.sendTestEmail(to || process.env.EMAIL_USER);
  res.status(result.success ? 200 : 500).json(result);
});


// Wedding Routes
console.log('💍 Registering /api/weddings route...');
const weddingsRouter = require('./routes/weddings');
app.use('/api/weddings', weddingsRouter);
console.log('✅ Registered /api/weddings route.');

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

