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
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


// =============================================================================
// FIREBASE INITIALIZATION (for wishes only)
// =============================================================================
// =============================================================================
// FIREBASE INITIALIZATION 
// =============================================================================
// Initialization is handled by individual modules (lib/firebase.js, etc.) if needed.
// This manual block is removed to prevent conflicts and credential errors.


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

// =============================================================================
// Security Middleware Configuration
// =============================================================================

// CORS Configuration
const whitelist = [
  'https://weddingweb.co.in',
  'https://www.weddingweb.co.in',
  'https://wedding-backend-rst3dulcnq-el.a.run.app',
  'https://wedding-backend-979970479540.asia-south1.run.app', // Added from .env
  process.env.FRONTEND_URL
].filter(Boolean);

// Add local origins in development
if (process.env.NODE_ENV !== 'production') {
  whitelist.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001');
}

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl) or if in whitelist
    if (!origin || whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "https://checkout.razorpay.com", "https://*.razorpay.com", "https://apis.google.com", "https://www.gstatic.com", "https://www.googletagmanager.com"],
      workerSrc: ["'self'", "blob:"],
      connectSrc: ["'self'", "https://weddingweb.co.in", "https://*.supabase.co", "https://api.emailjs.com", "https://api.razorpay.com", "https://*.razorpay.com", "https://lumberjack.razorpay.com", "https://wedding-backend-rst3dulcnq-el.a.run.app", "https://wedding-deepface-rst3dulcnq-el.a.run.app", "https://*.firebaseio.com", "https://firebaseinstallations.googleapis.com", "https://*.googleapis.com", "https://www.google-analytics.com", process.env.DEEPFACE_API_URL, process.env.NODE_ENV !== 'production' ? "http://localhost:5001" : "", process.env.NODE_ENV !== 'production' ? "http://localhost:5002" : "", process.env.NODE_ENV !== 'production' ? "http://localhost:3001" : "", process.env.NODE_ENV !== 'production' ? "http://localhost:8002" : ""].filter(Boolean),
      imgSrc: ["'self'", "data:", "blob:", "https://*.supabase.co", "https://*.razorpay.com", "https://wedding-backend-rst3dulcnq-el.a.run.app", "https://*.googleusercontent.com", "https://*.gstatic.com", "https://storage.googleapis.com", "https://*.unsplash.com", process.env.FRONTEND_URL].filter(Boolean),
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com", "https://*.razorpay.com", "https://*.firebaseapp.com", "https://*.google.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// Rate Limiting (Basic protection)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all requests in production
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
  app.set('trust proxy', 1); // Trust first proxy (Cloud Run load balancer)
}
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, process.env.LOCAL_STORAGE_PATH || 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Serve desktop app binaries - support both root and /api prefixed paths for flexibility
app.use(['/binaries', '/api/binaries'], express.static(path.join(__dirname, 'binaries')));


// Request logging middleware (Development only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('\n--- Incoming Request ---');
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('------------------------\n');
    next();
  });
}

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
const { authMiddleware } = require('./lib/secure-auth');
const authenticateToken = authMiddleware.verifyToken;
const { router: authRouter } = require('./auth-new');

console.log('🔑 Registering /api/auth routes...');
app.get('/api/auth/test-inline', (req, res) => res.json({ message: 'w00t' }));
app.use('/api/auth', authRouter);
console.log('✅ Registered /api/auth routes.');

// Photos routes (Supabase) - Use new version
console.log('📦 Registering /api/photos routes...');
const photosRouter = require('./photos-new');
app.use('/api/photos', photosRouter);

// Face recognition routes (Cloud SQL)
console.log('👤 Registering /api/faces routes...');
const facesRouter = require('./faces');
app.use('/api/faces', facesRouter);

// Profile routes (Cloud SQL)
console.log('👤 Registering /api/profiles routes...');
const profilesRouter = require('./routes/profiles');
app.use('/api/profiles', profilesRouter);

// Admin setup routes (one-time user creation)
const adminSetupRouter = require('./routes/admin-setup');
app.use('/api/admin', adminSetupRouter);

console.log('🤖 Registering /api/ai routes...');
app.use('/api/ai', require('./routes/ai'));

console.log('🔔 Registering /api/notifications routes...');
app.use('/api/notifications', require('./routes/notifications'));

// Email Test Route (Development only, protected)
app.post('/api/email/test', authenticateToken, async (req, res) => {
  const { to } = req.body;
  const result = await emailService.sendTestEmail(to || req.user.email || process.env.EMAIL_USER);
  res.status(result.success ? 200 : 500).json(result);
});

// AI Email Webhook (for Google Apps Script fallback)
console.log('✉️ Registering /api/email routes...');
app.use('/api/email', require('./routes/email-webhook'));
console.log('✅ Registered /api/email routes.');


// Wedding Routes
console.log('💍 Registering /api/weddings route...');
const weddingsRouter = require('./routes/weddings');
app.use('/api/weddings', weddingsRouter);
console.log('✅ Registered /api/weddings route.');

// Music Routes
console.log('🎵 Registering /api/music routes...');
app.use('/api/music', require('./routes/music'));
console.log('✅ Registered /api/music routes.');



// Phase 2: Guests & Timeline
console.log('👥 Registering /api/guests routes...');
app.use('/api/guests', require('./routes/guests'));
console.log('📅 Registering /api/timeline routes...');
app.use('/api/timeline', require('./routes/timeline'));

console.log('🔄 Registering /api/live routes...');
app.use('/api/live', require('./routes/live-sync'));

// Public Guest Routes (RSVP)
const publicGuestsRouter = require('./routes/public-guests');
app.use('/api/public/guests', publicGuestsRouter);

// Reviews Routes
console.log('⭐ Registering /api/reviews routes...');
app.use('/api/reviews', require('./routes/reviews'));
console.log('✅ Registered /api/reviews routes.');

// Premium Routes (Razorpay checkout)
console.log('💎 Registering /api/premium routes...');
app.use('/api/premium', require('./routes/premium'));
console.log('✅ Registered /api/premium routes.');

// =============================================================================
// =============================================================================
// FRONTEND SERVING (Production Only)
// =============================================================================
// This must be placed AFTER API routes to ensure they are handled first
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
      'POST /api/auth/register',
      'POST /api/auth/verify-token',
      'GET /api/photos',
      'POST /api/photos',
      'GET /api/profiles/:userId',
      'POST /api/profiles',
      'GET /api/guests',
      'POST /api/guests',
      'GET /api/timeline',
      'POST /api/timeline',
      'POST /api/ai/generate-bio',
      'POST /api/auth/photographer/credentials',
      'GET /api/auth/photographer/wedding-details'
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
  console.log('='.repeat(80) + '\n');
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

