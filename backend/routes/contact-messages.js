const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

// Get all contact messages (for admin)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, messages: data || [] });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit a new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, eventDate, guestCount, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required'
      });
    }

    // Insert message into Supabase
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{
        name,
        email,
        phone: phone || null,
        event_date: eventDate || null,
        guest_count: guestCount || null,
        message,
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    res.json({ success: true, message: 'Message sent successfully!', data: data[0] });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update message status (mark as read, replied, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, response } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (response) updateData.response = response;

    const { data, error } = await supabase
      .from('contact_messages')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ success: true, message: 'Message updated successfully!', data: data[0] });
  } catch (error) {
    console.error('Error updating contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a message
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Message deleted successfully!' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

