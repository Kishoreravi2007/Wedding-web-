/**
 * Analytics API
 * Track and retrieve website analytics data
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

// POST track an event (public - anyone can track)
router.post('/track', async (req, res) => {
  try {
    const { event_type, event_category, event_data, session_id } = req.body;
    
    if (!event_type || !event_category) {
      return res.status(400).json({ message: 'event_type and event_category are required.' });
    }

    // Get IP and user agent from request
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    const { data, error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        event_category,
        event_data: event_data || {},
        user_id: req.user?.id || null,
        session_id: session_id || null,
        ip_address,
        user_agent
      })
      .select()
      .single();

    if (error) throw error;

    // Also increment the appropriate statistic counter
    if (event_type === 'page_view') {
      if (event_category === 'photo_booth') {
        await supabase.rpc('increment_stat', { p_stat_name: 'photo_booth', p_increment: 1 });
      } else if (event_category === 'gallery') {
        await supabase.rpc('increment_stat', { p_stat_name: 'gallery', p_increment: 1 });
      }
      await supabase.rpc('increment_stat', { p_stat_name: 'visits', p_increment: 1 });
    } else if (event_type === 'photo_download') {
      await supabase.rpc('increment_stat', { p_stat_name: 'downloads', p_increment: 1 });
    } else if (event_type === 'face_search') {
      await supabase.rpc('increment_stat', { p_stat_name: 'searches', p_increment: 1 });
    } else if (event_type === 'wish_submitted') {
      await supabase.rpc('increment_stat', { p_stat_name: 'wishes', p_increment: 1 });
    }

    res.json({ message: 'Event tracked successfully', id: data.id });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ message: 'Error tracking event.' });
  }
});

// GET statistics (admin only)
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    // Get current aggregated statistics
    const { data: stats, error: statsError } = await supabase
      .rpc('get_current_stats');

    if (statsError) throw statsError;

    // Get total photos count
    const { count: totalPhotos, error: photosError } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true });

    if (photosError) throw photosError;

    // Get total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Get total faces detected
    const { count: totalFaces, error: facesError } = await supabase
      .from('photo_faces')
      .select('*', { count: 'exact', head: true });

    if (facesError && facesError.code !== 'PGRST116') throw facesError;

    res.json({
      totalPhotos: totalPhotos || 0,
      totalUsers: totalUsers || 0,
      totalFaces: totalFaces || 0,
      totalViews: stats[0]?.total_visits || 0,
      photoBoothVisits: stats[0]?.photo_booth_visits || 0,
      galleryViews: stats[0]?.gallery_views || 0,
      photoDownloads: stats[0]?.photo_downloads || 0,
      faceSearches: stats[0]?.face_searches || 0,
      wishesSubmitted: stats[0]?.wishes_submitted || 0
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics.' });
  }
});

// GET events (admin only, with filters)
router.get('/events', requireAdmin, async (req, res) => {
  try {
    const { 
      event_type, 
      event_category, 
      start_date, 
      end_date, 
      limit = 100 
    } = req.query;

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    if (event_category) {
      query = query.eq('event_category', event_category);
    }

    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events.' });
  }
});

// GET daily statistics (admin only)
router.get('/daily', requireAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const { data, error } = await supabase
      .from('website_statistics')
      .select('*')
      .gte('stat_date', `now() - interval '${parseInt(days)} days'`)
      .order('stat_date', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching daily statistics:', error);
    res.status(500).json({ message: 'Error fetching daily statistics.' });
  }
});

// GET admin activity log (admin only)
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('admin_activity_log')
      .select(`
        *,
        admin:admin_id (username)
      `)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ message: 'Error fetching activity log.' });
  }
});

module.exports = router;

