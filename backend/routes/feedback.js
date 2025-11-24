const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { writeFeedbackToSheet, deleteFeedbackFromSheet } = require('../lib/google-sheets');

// Helper to ensure Supabase is available
const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check SUPABASE_URL and service keys.');
  }
  return supabase;
};

// Get all feedback (for admin)
router.get('/', async (req, res) => {
  try {
    const client = ensureSupabase();
    const { data, error } = await client
      .from('feedback')
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
        console.error('🔴 TABLE DOES NOT EXIST: feedback');
      } else if (error?.code === 'PGRST116') {
        console.error('🔴 TABLE NOT FOUND: feedback');
      }
      
      throw error;
    }

    res.json({ success: true, feedback: data || [] });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Check if it's a table missing error
    if (error?.code === '42P01' || error?.message?.includes('does not exist')) {
      return res.status(500).json({ 
        success: false, 
        error: 'Table "feedback" does not exist. Please create it in Supabase.',
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

// Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, category, message, page_url } = req.body;

    // Validate required fields
    if (!rating || !message) {
      return res.status(400).json({
        success: false,
        error: 'Rating and message are required'
      });
    }

    // Insert feedback into Supabase
    const client = ensureSupabase();
    const { data, error } = await client
      .from('feedback')
      .insert([{
        name: name || 'Anonymous',
        email: email || null,
        rating: rating,
        category: category || 'general',
        message: message,
        page_url: page_url || null,
        status: 'new',
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;

    // Write to Google Sheets (non-blocking - don't fail if this fails)
    try {
      await writeFeedbackToSheet({
        name,
        email,
        rating,
        category,
        message,
        page_url,
      });
    } catch (sheetsError) {
      // Log error but don't fail the request
      console.error('Error writing to Google Sheets (non-critical):', sheetsError);
    }

    res.json({ success: true, message: 'Thank you for your feedback!', data: data[0] });
  } catch (error) {
    console.error('Error saving feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update feedback status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const client = ensureSupabase();
    const { data, error } = await client
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    res.json({ success: true, message: 'Feedback updated successfully!', data: data[0] });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get the feedback data before deleting (to find it in Google Sheets)
    const client = ensureSupabase();
    const { data: feedbackData, error: fetchError } = await client
      .from('feedback')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Supabase
    const { error } = await client
      .from('feedback')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Delete from Google Sheets (non-blocking)
    if (feedbackData) {
      try {
        console.log('🗑️ Attempting to delete feedback from Google Sheets...');
        const deleteResult = await deleteFeedbackFromSheet({
          email: feedbackData.email,
          rating: feedbackData.rating,
          message: feedbackData.message,
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

    res.json({ success: true, message: 'Feedback deleted successfully!' });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

