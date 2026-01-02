const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
// Helper to get DB only after initialization
const getDB = () => {
  if (admin.apps.length === 0) {
    return null;
  }
  return admin.firestore();
};

// GET wishes by recipient or all wishes if no recipient specified
router.get('/', async (req, res) => {
  const { recipient } = req.query;
  try {
    const db = getDB();
    if (!db) {
      return res.status(503).json({ message: 'Wishes service unavailable (Firebase not configured).' });
    }
    let wishesRef = db.collection('wishes');
    if (recipient) {
      wishesRef = wishesRef.where('recipient', '==', recipient);
    }
    const snapshot = await wishesRef.orderBy('timestamp', 'desc').get();
    const wishes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
      };
    });
    res.json(wishes);
  } catch (error) {
    console.error('Error getting wishes:', error);
    res.status(500).json({ message: 'Error retrieving wishes.' });
  }
});

// POST a new wish
router.post('/', async (req, res) => {
  const { name, wish, recipient, audioUrl } = req.body; // Include audioUrl
  if (!name || (!wish && !audioUrl)) { // Ensure either wish or audioUrl is present
    return res.status(400).json({ message: 'Name and either a wish or an audio message are required.' });
  }

  try {
    const db = getDB();
    if (!db) {
      return res.status(503).json({ message: 'Wishes service unavailable (Firebase not configured).' });
    }

    const newWish = {
      name,
      wish: wish || null, // Store wish as null if not provided
      audioUrl: audioUrl || null, // Store audioUrl as null if not provided
      recipient: recipient || 'both',
      timestamp: admin.firestore.FieldValue.serverTimestamp(), // Use timestamp to match frontend interface
    };
    const docRef = await db.collection('wishes').add(newWish);
    res.status(201).json({ id: docRef.id, ...newWish });
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ message: 'Error submitting wish.' });
  }
});

module.exports = router;
