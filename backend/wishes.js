const express = require('express');
const router = express.Router();
const { WishesDB } = require('./lib/sql-db');

// GET wishes by recipient or all wishes if no recipient specified
router.get('/', async (req, res) => {
  const { recipient, weddingId } = req.query;
  try {
    const filters = {};
    if (weddingId) {
      filters.weddingId = weddingId;
    }
    // Backward compatibility: If recipient looks like a UUID, use it as weddingId?
    // Or just support both.
    if (recipient) {
      // If recipient is a UUID (approx check), treat as weddingId if weddingId not provided
      if (!weddingId && recipient.length > 30 && recipient.includes('-')) {
        filters.weddingId = recipient;
      } else {
        filters.recipient = recipient;
      }
    }

    const wishes = await WishesDB.findAll(filters);

    // Map to match frontend expectations if needed
    const mappedWishes = wishes.map(wish => ({
      id: wish.id,
      name: wish.name,
      wish: wish.wish,
      recipient: wish.recipient,
      audioUrl: wish.audio_url,
      timestamp: wish.timestamp,
      weddingId: wish.wedding_id
    }));

    res.json(mappedWishes);
  } catch (error) {
    console.error('Error getting wishes:', error);
    res.status(500).json({ message: 'Error retrieving wishes.' });
  }
});

// POST a new wish
router.post('/', async (req, res) => {
  const { name, wish, recipient, audioUrl, weddingId } = req.body;
  if (!name || (!wish && !audioUrl)) {
    return res.status(400).json({ message: 'Name and either a wish or an audio message are required.' });
  }

  try {
    let targetWeddingId = weddingId;
    let targetRecipient = recipient || 'both';

    // Heuristic: if recipient is a UUID, it's likely the weddingId
    if (!targetWeddingId && recipient && recipient.length > 30 && recipient.includes('-')) {
      targetWeddingId = recipient;
      targetRecipient = 'both'; // Default to generic recipient
    }

    const wishData = {
      name,
      wish: wish || null,
      audio_url: audioUrl || null,
      recipient: targetRecipient,
      wedding_id: targetWeddingId
    };

    const newWish = await WishesDB.create(wishData);

    res.status(201).json({
      id: newWish.id,
      name: newWish.name,
      wish: newWish.wish,
      recipient: newWish.recipient,
      audioUrl: newWish.audio_url,
      timestamp: newWish.timestamp,
      weddingId: newWish.wedding_id
    });
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ message: 'Error submitting wish.' });
  }
});

module.exports = router;
