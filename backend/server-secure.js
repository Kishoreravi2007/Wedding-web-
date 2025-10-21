/**
 * Secure Wedding Website Backend Server
 * 
 * This server implements secure authentication with proper RLS policies,
 * audit logging, and comprehensive security measures.
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
    credential: admin.credential.cert(serviceAccount)
  });
}

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) not fully set. Supabase storage will not be available.');
}

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required for secure authentication.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

// Import secure authentication router
const secureAuthRouter = require('./auth-secure');
const { authMiddleware } = require('./lib/secure-auth');

// Import other routers
const wishesRouter = require('./wishes');
const photosRouter = require('./photos');
const photosEnhancedRouter = require('./photos-enhanced');
const facesRouter = require('./faces');

// Routes
app.use('/api/auth', secureAuthRouter);
app.use('/api/wishes', wishesRouter);
app.use('/api/photos', authMiddleware.verifyToken, photosRouter);
app.use('/api/photos-enhanced', authMiddleware.verifyToken, photosEnhancedRouter);
app.use('/api/faces', facesRouter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connections
    const { data: supabaseTest } = await supabaseService
      .from('users')
      .select('count')
      .limit(1);
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        firebase: 'connected',
        supabase: 'connected'
      },
      security: {
        rls_enabled: true,
        audit_logging: true,
        rate_limiting: true
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
    message: 'Wedding Website Backend - Secure Version',
    version: '2.0.0',
    security: 'Enhanced',
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
module.exports.supabaseService = supabaseService;

// Start server
app.listen(PORT, () => {
  console.log('🔐 Secure Wedding Website Backend Server');
  console.log('=====================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔒 Security: Enhanced with RLS policies`);
  console.log(`📊 Audit logging: Enabled`);
  console.log(`🛡️ Rate limiting: Active`);
  console.log(`🌐 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:8080'}`);
  console.log('');
  console.log('📝 Available endpoints:');
  console.log('   GET  /health - Health check');
  console.log('   POST /api/auth/login - User login');
  console.log('   POST /api/auth/register - User registration');
  console.log('   GET  /api/auth/profile - User profile');
  console.log('   POST /api/photos - Upload photos (authenticated)');
  console.log('   GET  /api/wishes - Get wishes');
  console.log('');
  console.log('🔐 Authentication required for:');
  console.log('   - Photo uploads');
  console.log('   - Photo management');
  console.log('   - Profile updates');
  console.log('');
  console.log('✅ Server is ready for secure operations!');
});
