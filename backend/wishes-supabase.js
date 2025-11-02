/**
 * Wishes Router - Supabase Version
 * 
 * Handles wedding wishes from guests
 * Switched from Firebase to Supabase
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('./lib/supabase');

// GET wishes by recipient or all wishes if no recipient specified
router.get('/', async (req, res) => {
  const { recipient } = req.query;
  
  try {
    let query = supabase
      .from('wishes')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (recipient) {
      query = query.eq('recipient', recipient);
    }
    
    const { data: wishes, error } = await query;
    
    if (error) {
      console.error('Error getting wishes from Supabase:', error);
      throw error;
    }
    
    res.json(wishes || []);
  } catch (error) {
    console.error('Error getting wishes:', error);
    res.status(500).json({ message: 'Error retrieving wishes.' });
  }
});

// POST a new wish
router.post('/', async (req, res) => {
  const { name, wish, recipient, audioUrl } = req.body;
  
  // Validate input
  if (!name || (!wish && !audioUrl)) {
    return res.status(400).json({ 
      message: 'Name and either a wish or an audio message are required.' 
    });
  }

  try {
    const newWish = {
      name,
      wish: wish || null,
      audio_url: audioUrl || null,
      recipient: recipient || 'both',
      timestamp: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('wishes')
      .insert([newWish])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding wish to Supabase:', error);
      throw error;
    }
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ message: 'Error submitting wish.' });
  }
});

module.exports = router;

