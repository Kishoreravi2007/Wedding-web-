const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// GET wishes by recipient or all wishes if no recipient specified
router.get('/', async (req, res) => {
  const { recipient } = req.query;
  try {
    let wishesRef = db.collection('wishes');
    if (recipient) {
      wishesRef = wishesRef.where('recipient', '==', recipient);
    }
    const snapshot = await wishesRef.orderBy('createdAt', 'desc').get();
    const wishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(wishes);
  } catch (error) {
    console.error('Error getting wishes:', error);
    res.status(500).json({ message: 'Error retrieving wishes.' });
  }
});

// POST a new wish
router.post('/', async (req, res) => {
  const { name, wish, recipient } = req.body;
  if (!name || !wish) {
    return res.status(400).json({ message: 'Name and wish are required.' });
  }

  try {
    const newWish = {
      name,
      wish,
      recipient: recipient || 'both',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('wishes').add(newWish);
    res.status(201).json({ id: docRef.id, ...newWish });
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ message: 'Error submitting wish.' });
  }
});

module.exports = router;
