/**
 * Firebase Configuration
 * 
 * This module initializes and exports the Firebase Admin SDK and Firestore client.
 * Replaces Supabase for database and storage operations.
 */

const admin = require('firebase-admin');

// Firebase configuration from user
const firebaseConfig = {
  apiKey: "AIzaSyB8BGBnEsJhDRhJ03Bvdevh792Gh8A9Uj8",
  authDomain: "kishore-75492.firebaseapp.com",
  projectId: "kishore-75492",
  storageBucket: "kishore-75492.firebasestorage.app",
  messagingSenderId: "904463871757",
  appId: "1:904463871757:web:e742970921a623a5718a44",
  measurementId: "G-0YJHHJ26L8"
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
    // Try to use service account key if available
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
    
    if (serviceAccountPath) {
      const serviceAccount = require(serviceAccountPath);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket
      });
    } else {
      // Initialize with config only (for basic operations)
      firebaseApp = admin.initializeApp({
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket
      });
    }
    
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

