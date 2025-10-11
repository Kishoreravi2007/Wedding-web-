const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET wishes by recipient or all wishes if no recipient specified
router.get('/', async (req, res) => {
  const { recipient } = req.query;
  try {
    let query = supabase.from('wishes').select('*');
    if (recipient) {
      query = query.eq('recipient', recipient);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) {
      throw error;
    }
    res.json(data);
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
    const { data, error } = await supabase
      .from('wishes')
      .insert([{ name, wish, recipient: recipient || 'both' }])
      .select();

    if (error) {
      throw error;
    }
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error adding wish:', error);
    res.status(500).json({ message: 'Error submitting wish.' });
  }
});

module.exports = router;
