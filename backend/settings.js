/**
 * Website Settings API
 * Manage website configuration stored in Supabase
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth-simple');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseRestUrl = supabaseUrl ? `${supabaseUrl.replace(/\/+$/, '')}/rest/v1` : null;

const ensureSupabaseConfig = () => {
  if (!supabaseRestUrl || !supabaseKey) {
    throw new Error('Supabase credentials missing. Set SUPABASE_URL and service role/anon key.');
  }
};

const supabaseRequest = async (path, { method = 'GET', body, headers = {} } = {}) => {
  ensureSupabaseConfig();

  const response = await fetch(`${supabaseRestUrl}${path}`, {
    method,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Supabase request failed (${response.status}): ${message}`);
  }

  return response.json();
};

const ensureAdmin = [
  authenticateToken,
  (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  }
];

// GET all settings
router.get('/', async (req, res) => {
  try {
    const data = await supabaseRequest('/website_settings?select=*');

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
    const data = await supabaseRequest(`/website_settings?select=*&key=eq.${encodeURIComponent(req.params.key)}`);

    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Setting not found.' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Error fetching setting.' });
  }
});

// PUT/UPDATE setting (admin only)
router.put('/:key', ...ensureAdmin, async (req, res) => {
  try {
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'Value is required.' });
    }

    const now = new Date().toISOString();

    const payload = {
      key: req.params.key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      updated_by: req.user.id,
      updated_at: now
    };

    const data = await supabaseRequest('/website_settings', {
      method: 'POST',
      body: [payload],
      headers: {
        Prefer: 'return=representation,resolution=merge-duplicates'
      }
    });

    res.json({ message: 'Setting updated successfully', setting: data[0] });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Error updating setting.' });
  }
});

// POST/UPDATE multiple settings at once (admin only)
router.post('/bulk', ...ensureAdmin, async (req, res) => {
  try {
    const settings = req.body;
    
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Settings object is required.' });
    }

    const now = new Date().toISOString();

    const updates = Object.keys(settings).map(key => ({
      key,
      value: typeof settings[key] === 'object' 
        ? JSON.stringify(settings[key]) 
        : String(settings[key]),
      updated_by: req.user.id,
      updated_at: now
    }));

    await supabaseRequest('/website_settings', {
      method: 'POST',
      body: updates,
      headers: {
        Prefer: 'resolution=merge-duplicates'
      }
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

