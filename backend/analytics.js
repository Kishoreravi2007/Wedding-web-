const express = require('express');
const router = express.Router();
const { query: sqlQuery } = require('./lib/db-gcp');

// Middleware to check if user is admin is already handled by authenticateToken 
// But we can add a secondary role check if needed inside specific routes

// GET statistics (admin only)
router.get('/stats', async (req, res) => {
  try {
    // 1. Get total photos count
    const { rows: photoResults } = await sqlQuery('SELECT COUNT(*) as count FROM photos');
    const totalPhotos = parseInt(photoResults[0].count);

    // 2. Get total users count
    const { rows: userResults } = await sqlQuery('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(userResults[0].count);

    // 3. Get total wishes/feedback count
    const { rows: wishResults } = await sqlQuery('SELECT COUNT(*) as count FROM wishes');
    const wishesSubmitted = parseInt(wishResults[0].count);

    // 4. Get active users (placeholder or check sessions if implemented)
    const onlineUsers = 42; // Simulated live count until session management is fully implemented

    // 5. Get Revenue trends
    let monthlyRevenue = 0;
    let revenueTrends = [
      { month: 'Jan', revenue: 0 },
      { month: 'Feb', revenue: 0 },
      { month: 'Mar', revenue: 0 },
      { month: 'Apr', revenue: 0 },
      { month: 'May', revenue: 0 }
    ];

    try {
      const revResult = await sqlQuery(`
            SELECT 
                COALESCE(SUM(amount), 0) as total_revenue,
                EXTRACT(MONTH FROM created_at) as month_num,
                TO_CHAR(created_at, 'Mon') as month
            FROM payment_history 
            WHERE status = 'completed' OR status = 'success'
            AND created_at >= NOW() - INTERVAL '6 months'
            GROUP BY month_num, month
            ORDER BY month_num ASC;
        `);

      if (revResult.rows && revResult.rows.length > 0) {
        revenueTrends = revResult.rows.map(r => ({
          month: r.month,
          revenue: parseFloat(r.total_revenue) / 100
        }));
        monthlyRevenue = revenueTrends[revenueTrends.length - 1].revenue;
      }
    } catch (revError) {
      console.warn('Could not fetch revenue from SQL, using fallback');
    }

    res.json({
      totalPhotos,
      totalUsers,
      wishesSubmitted,
      totalViews: totalPhotos * 3, // Proxy for views
      monthlyRevenue,
      onlineUsers,
      revenueTrends
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics.' });
  }
});

// GET admin activity log (admin only)
router.get('/activity', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    const { rows: activities } = await sqlQuery(`
        SELECT a.*, u.username
        FROM auth_audit_log a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT $1
    `, [limit]);

    res.json(activities.map(a => ({
      id: a.id,
      action: a.action,
      success: a.success,
      created_at: a.created_at,
      admin: { username: a.username || 'System' },
      details: a.details
    })));
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ message: 'Error fetching activity log.' });
  }
});

module.exports = router;

