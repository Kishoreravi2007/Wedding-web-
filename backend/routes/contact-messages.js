const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { writeContactMessageToSheet, deleteContactMessageFromSheet } = require('../lib/google-sheets');

// Helper to ensure Supabase is available
const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check SUPABASE_URL and service keys.');
  }
  return supabase;
};

// Get all contact messages (for admin)
router.get('/', async (req, res) => {
  try {
    const client = ensureSupabase();
    const { data, error } = await client
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase query error detected!');
      console.error('Error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error || {}));
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      console.error('Full error JSON:', JSON.stringify(error, null, 2));
      
      // Check for common Supabase errors
      if (error?.code === '42P01') {
        console.error('🔴 TABLE DOES NOT EXIST: contact_messages');
      } else if (error?.code === 'PGRST116') {
        console.error('🔴 TABLE NOT FOUND: contact_messages');
      }
      
      throw error;
    }

    res.json({ success: true, messages: data || [] });
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Check if it's a table missing error
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      return res.status(500).json({ 
        success: false, 
        error: 'Table "contact_messages" does not exist. Please create it in Supabase.',
        code: error.code,
        hint: error.hint
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: error?.message || error?.toString() || 'Internal server error.',
      code: error?.code || null,
      hint: error?.hint || null,
      details: error?.details || null
    });
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
    const client = ensureSupabase();
    const { data, error } = await client
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

    // Write to Google Sheets (non-blocking - don't fail if this fails)
    try {
      await writeContactMessageToSheet({
        name,
        email,
        phone,
        eventDate,
        guestCount,
        message,
      });
    } catch (sheetsError) {
      // Log error but don't fail the request
      console.error('Error writing to Google Sheets (non-critical):', sheetsError);
    }

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

    const client = ensureSupabase();
    const { data, error } = await client
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

    // Get the message data before deleting (to find it in Google Sheets)
    const client = ensureSupabase();
    const { data: messageData, error: fetchError } = await client
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Supabase
    const { error } = await client
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete from Google Sheets (non-blocking)
    if (messageData) {
      try {
        console.log('🗑️ Attempting to delete contact message from Google Sheets...');
        const deleteResult = await deleteContactMessageFromSheet({
          email: messageData.email,
          message: messageData.message,
          name: messageData.name,
        });
        if (!deleteResult.success) {
          console.warn('⚠️ Google Sheets deletion failed:', deleteResult.error);
        }
      } catch (sheetsError) {
        // Log error but don't fail the request
        console.error('❌ Error deleting from Google Sheets (non-critical):', sheetsError);
        console.error('   Stack:', sheetsError.stack);
      }
    }

    res.json({ success: true, message: 'Message deleted successfully!' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

