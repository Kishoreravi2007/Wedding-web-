
require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');

console.log('--- Firebase Diagnosis ---');
console.log('GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

try {
    console.log('Attempting to initialize Firebase Admin...');
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
    console.log('✅ Firebase initialized successfully!');
} catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
}
