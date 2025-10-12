require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET // Ensure this is set in .env
  });
}
console.log('FIREBASE_STORAGE_BUCKET from .env:', process.env.FIREBASE_STORAGE_BUCKET);

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


app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
