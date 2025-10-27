/**
 * Website Settings API
 * Manage website configuration stored in Supabase
 */

const express = require('express');
const router = express.Router();
const { supabase } = require('./server');

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// GET all settings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;

    // Convert to key-value object
    const settings = {};
    data.forEach(setting => {
      settings[setting.key] = setting.value;
    });

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings.' });
  }
});

// GET single setting by key
router.get('/:key', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('website_settings')
      .select('*')
      .eq('key', req.params.key)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Setting not found.' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Error fetching setting.' });
  }
});

// PUT/UPDATE setting (admin only)
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'Value is required.' });
    }

    const { data, error } = await supabase
      .from('website_settings')
      .update({ 
        value: String(value),
        updated_by: req.user.id,
        updated_at: new Date().toISOString()
      })
      .eq('key', req.params.key)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Setting not found.' });
      }
      throw error;
    }

    // Log admin activity
    await supabase
      .from('admin_activity_log')
      .insert({
        admin_id: req.user.id,
        action: 'update_setting',
        entity_type: 'setting',
        entity_id: data.id,
        details: { key: req.params.key, old_value: data.value, new_value: value }
      });

    res.json({ message: 'Setting updated successfully', setting: data });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Error updating setting.' });
  }
});

// POST/UPDATE multiple settings at once (admin only)
router.post('/bulk', requireAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required.' });
    }

    const updates = Object.keys(settings).map(key => ({
      key,
      value: String(settings[key]),
      updated_by: req.user.id,
      updated_at: new Date().toISOString()
    }));

    // Update each setting
    const results = await Promise.all(
      updates.map(update =>
        supabase
          .from('website_settings')
          .update({ 
            value: update.value,
            updated_by: update.updated_by,
            updated_at: update.updated_at
          })
          .eq('key', update.key)
          .select()
      )
    );

    // Log admin activity
    await supabase
      .from('admin_activity_log')
      .insert({
        admin_id: req.user.id,
        action: 'bulk_update_settings',
        entity_type: 'settings',
        details: { keys: Object.keys(settings), count: updates.length }
      });

    res.json({ 
      message: 'Settings updated successfully', 
      updated: updates.length 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings.' });
  }
});

module.exports = router;

