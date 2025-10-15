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

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Warning: Supabase environment variables (SUPABASE_URL, SUPABASE_ANON_KEY) not fully set. Supabase storage will not be available.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Export supabase client for use in other modules
module.exports.supabase = supabase;


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
