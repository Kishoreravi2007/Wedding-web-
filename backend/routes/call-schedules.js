const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

const sendMissingTableResponse = (res) => {
  res.status(500).json({
    success: false,
    error: 'CALL_SCHEDULES_TABLE_MISSING',
    detail: 'Supabase table "call_schedules" is missing. Run SUPABASE_CALL_SCHEDULES_SETUP.sql from the project root using the Supabase SQL editor and redeploy the backend.'
  });
};

const isMissingTableError = (error) =>
  error?.message?.toLowerCase().includes('call_schedules');

// Fetch all scheduled calls
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('call_schedules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) return sendMissingTableResponse(res);
      throw error;
    }

    res.json({ success: true, schedules: data || [] });
  } catch (error) {
    console.error('Error fetching call schedules:', error);
    if (isMissingTableError(error)) return sendMissingTableResponse(res);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new scheduled call
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      preferredDate,
      preferredTime,
      timezone,
      message,
      source
    } = req.body;

    // Make preferredDate optional - default to today if not provided
    const defaultDate = preferredDate || new Date().toISOString().split('T')[0];
    
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Name and email are required'
      });
    }

    const { data, error } = await supabase
      .from('call_schedules')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          preferred_date: defaultDate,
          preferred_time: preferredTime || null,
          timezone: timezone || null,
          message: message || null,
          status: 'pending',
          source: source || 'website',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      if (isMissingTableError(error)) return sendMissingTableResponse(res);
      throw error;
    }

    res.json({
      success: true,
      message: 'Call scheduled successfully!',
      schedule: data?.[0]
    });
  } catch (error) {
    console.error('Error creating call schedule:', error);
    if (isMissingTableError(error)) return sendMissingTableResponse(res);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update schedule status or notes
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { data, error } = await supabase
      .from('call_schedules')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      if (isMissingTableError(error)) return sendMissingTableResponse(res);
      throw error;
    }

    res.json({
      success: true,
      message: 'Schedule updated successfully!',
      schedule: data?.[0]
    });
  } catch (error) {
    console.error('Error updating call schedule:', error);
    if (isMissingTableError(error)) return sendMissingTableResponse(res);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete a schedule
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('call_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      if (isMissingTableError(error)) return sendMissingTableResponse(res);
      throw error;
    }

    res.json({ success: true, message: 'Schedule deleted successfully!' });
  } catch (error) {
    console.error('Error deleting call schedule:', error);
    if (isMissingTableError(error)) return sendMissingTableResponse(res);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

