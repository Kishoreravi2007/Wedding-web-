// Wedding Management API Routes
const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check SUPABASE_URL and service keys.');
  }
  return supabase;
};

// =====================================================
// GET ALL WEDDINGS
// =====================================================
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    const client = ensureSupabase();
    let query = client
      .from('weddings')
      .select('*')
      .order('wedding_date', { ascending: false });
    
    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      weddings: data,
      count: data.length
    });
  } catch (error) {
    console.error('Error fetching weddings:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error.',
      details: error.code || error.hint || null
    });
  }
});

// =====================================================
// GET WEDDING BY ID
// =====================================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = ensureSupabase();
    const { data, error } = await client
      .from('weddings')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }
    
    res.json({
      success: true,
      wedding: data
    });
  } catch (error) {
    console.error('Error fetching wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GET WEDDING BY CODE
// =====================================================
router.get('/code/:weddingCode', async (req, res) => {
  try {
    const { weddingCode } = req.params;
    
    const client = ensureSupabase();
    const { data, error } = await client
      .from('weddings')
      .select('*')
      .eq('wedding_code', weddingCode)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }
    
    res.json({
      success: true,
      wedding: data
    });
  } catch (error) {
    console.error('Error fetching wedding by code:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GET WEDDING STATISTICS
// =====================================================
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use the database function to get stats
    const client = ensureSupabase();
    const { data, error } = await client
      .rpc('get_wedding_stats', { p_wedding_id: id });
    
    if (error) throw error;
    
    res.json({
      success: true,
      stats: data[0] || {
        total_photos: 0,
        total_people: 0,
        total_wishes: 0,
        storage_used_mb: 0
      }
    });
  } catch (error) {
    console.error('Error fetching wedding stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// CREATE NEW WEDDING
// =====================================================
router.post('/', async (req, res) => {
  try {
    const {
      wedding_code,
      bride_name,
      groom_name,
      wedding_date,
      wedding_month,
      venue,
      venue_address,
      package_type,
      status,
      theme_color,
      contact_email,
      contact_phone,
      enable_photo_booth,
      enable_face_recognition,
      enable_wishes,
      enable_live_stream
    } = req.body;
    
    // Validate required fields
    if (!wedding_code || (!bride_name && !groom_name)) {
      return res.status(400).json({
        success: false,
        error: 'wedding_code and at least one of bride_name or groom_name are required'
      });
    }
    
    // Insert new wedding
    const client = ensureSupabase();
    const { data, error } = await client
      .from('weddings')
      .insert([{
        wedding_code,
        bride_name,
        groom_name,
        wedding_date,
        wedding_month,
        venue,
        venue_address,
        package_type: package_type || 'basic',
        status: status || 'upcoming',
        theme_color: theme_color || '#ff6b9d',
        contact_email,
        contact_phone,
        enable_photo_booth: enable_photo_booth !== false,
        enable_face_recognition: enable_face_recognition !== false,
        enable_wishes: enable_wishes !== false,
        enable_live_stream: enable_live_stream || false
      }])
      .select()
      .single();
    
    if (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(409).json({
          success: false,
          error: 'Wedding code already exists'
        });
      }
      throw error;
    }
    
    res.status(201).json({
      success: true,
      message: 'Wedding created successfully',
      wedding: data
    });
  } catch (error) {
    console.error('Error creating wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// UPDATE WEDDING
// =====================================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.created_by;
    
    const client = ensureSupabase();
    const { data, error } = await client
      .from('weddings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        error: 'Wedding not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Wedding updated successfully',
      wedding: data
    });
  } catch (error) {
    console.error('Error updating wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// DELETE WEDDING
// =====================================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // First, check if wedding has any photos
    const client = ensureSupabase();
    const { data: photos } = await client
      .from('photos')
      .select('id')
      .eq('wedding_id', id)
      .limit(1);
    
    if (photos && photos.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete wedding with existing photos. Please delete photos first or archive the wedding.'
      });
    }
    
    const { error } = await client
      .from('weddings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Wedding deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// ARCHIVE WEDDING
// =====================================================
router.post('/:id/archive', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = ensureSupabase();
    const { data, error } = await client
      .from('weddings')
      .update({ status: 'archived' })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: 'Wedding archived successfully',
      wedding: data
    });
  } catch (error) {
    console.error('Error archiving wedding:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// =====================================================
// GET UPCOMING WEDDINGS (Public)
// =====================================================
router.get('/public/upcoming', async (req, res) => {
  try {
    const client = ensureSupabase();
    const { data, error } = await client
      .from('weddings')
      .select('wedding_code, bride_name, groom_name, wedding_date, wedding_month, theme_color')
      .in('status', ['active', 'upcoming'])
      .order('wedding_date', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      weddings: data
    });
  } catch (error) {
    console.error('Error fetching upcoming weddings:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

