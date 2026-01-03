const express = require('express');
const router = express.Router();
const { WishesDB } = require('./lib/sql-db');

// GET wishes by recipient or all wishes if no recipient specified
router.get('/', async (req, res) => {
  const { recipient } = req.query;
  try {
    const filters = {};
    if (recipient) {
      filters.recipient = recipient;
    }

    const wishes = await WishesDB.findAll(filters);

    // Map to match frontend expectations if needed
    const mappedWishes = wishes.map(wish => ({
      id: wish.id,
      name: wish.name,
      wish: wish.wish,
      recipient: wish.recipient,
      audioUrl: wish.audio_url,
      timestamp: wish.timestamp
    }));

    res.json(mappedWishes);
  } catch (error) {
    console.error('Error getting wishes:', error);
    res.status(500).json({ message: 'Error retrieving wishes.' });
  }
});

// POST a new wish
router.post('/', async (req, res) => {
  const { name, wish, recipient, audioUrl } = req.body;
  if (!name || (!wish && !audioUrl)) {
    return res.status(400).json({ message: 'Name and either a wish or an audio message are required.' });
  }

  try {
    const wishData = {
      name,
      wish: wish || null,
      audio_url: audioUrl || null,
      recipient: recipient || 'both'
    };

    const newWish = await WishesDB.create(wishData);

    res.status(201).json({
      id: newWish.id,
      name: newWish.name,
      wish: newWish.wish,
      recipient: newWish.recipient,
      audioUrl: newWish.audio_url,
      timestamp: newWish.timestamp
    });
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ message: 'Error submitting wish.' });
  }
});

module.exports = router;
