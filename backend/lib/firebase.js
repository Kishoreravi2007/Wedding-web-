/**
 * Firebase Configuration
 * 
 * This module initializes and exports the Firebase Admin SDK and Firestore client.
 * Replaces Supabase for database and storage operations.
 */

const admin = require('firebase-admin');

// Firebase configuration - Use environment variables or fallback to defaults
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyB8BGBnEsJhDRhJO3Bvdevh792Gh8A9Uj8",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "kishore-75492.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "kishore-75492",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "kishore-75492.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "904463871757",
  appId: process.env.FIREBASE_APP_ID || "1:904463871757:web:e742970921a623a5718a44",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-0YJHHJ26L8"
};

let firebaseApp;
let db;
let storage;

try {
  // Check if Firebase is already initialized
  firebaseApp = admin.app();
  console.log('✅ Firebase Admin already initialized');
} catch (error) {
  // Initialize Firebase Admin SDK
  try {
    const path = require('path');
    const fs = require('fs');
    
    // Try to find the service account key file
    const possiblePaths = [
      path.join(__dirname, '..', 'weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23 (2).json'),
      path.join(__dirname, '..', 'firebase-service-account.json'),
      path.join(__dirname, '..', 'serviceAccountKey.json')
    ];
    
    let credential;
    let foundServiceAccount = false;
    
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        try {
          const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          credential = admin.credential.cert(serviceAccount);
          console.log(`✅ Using Firebase service account from: ${path.basename(filePath)}`);
          foundServiceAccount = true;
          break;
        } catch (parseError) {
          console.warn(`⚠️  Failed to parse service account file: ${filePath}`);
        }
      }
    }
    
    if (!foundServiceAccount) {
      console.warn('⚠️  No service account file found, initializing without credentials');
      // Initialize without credentials (will work for some operations if GOOGLE_APPLICATION_CREDENTIALS is set)
      credential = null;
    }
    
    const initConfig = {
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket
    };
    
    if (credential) {
      initConfig.credential = credential;
    }
    
    firebaseApp = admin.initializeApp(initConfig);
    console.log('✅ Firebase Admin SDK initialized');
  } catch (initError) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', initError);
    throw initError;
  }
}

// Initialize Firestore
db = admin.firestore();
db.settings({
  ignoreUndefinedProperties: true,
  timestampsInSnapshots: true
});

// Initialize Storage
storage = admin.storage().bucket();

console.log('✅ Firestore and Storage initialized');

// Helper functions to replace Supabase functionality

/**
 * Check Firebase connection
 */
async function checkFirebaseConnection() {
  try {
    await db.collection('_connection_test').doc('test').set({ timestamp: new Date() });
    await db.collection('_connection_test').doc('test').delete();
    return true;
  } catch (error) {
    console.error('Firebase connection check failed:', error);
    return false;
  }
}

/**
 * Get Storage bucket URL
 */
function getStorageBucketUrl() {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}`;
}

/**
 * Generate public URL for a storage file
 */
function getPublicUrl(filePath) {
  return `https://storage.googleapis.com/${firebaseConfig.storageBucket}/${filePath}`;
}

module.exports = {
  admin,
  db,
  storage,
  firebaseConfig,
  checkFirebaseConnection,
  getStorageBucketUrl,
  getPublicUrl
};

