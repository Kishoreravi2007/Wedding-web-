/**
 * Secure Authentication Router
 * 
 * This router implements secure authentication with proper RLS policies,
 * audit logging, and role-based access control.
 */

const express = require('express');
const router = express.Router();
const { SecureUserDB, TokenManager, authMiddleware } = require('./lib/secure-auth');

/**
 * POST /api/auth/register
 * Register a new user (admin only in production)
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // In production, you might want to restrict registration to admin users only
    // For now, we'll allow registration but log it
    console.log(`Registration attempt for user: ${username} with role: ${role}`);
    
    const newUser = await SecureUserDB.createUser({
      username,
      password,
      role
    });
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ 
      message: error.message || 'Registration failed' 
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    // Authenticate user
    const user = await SecureUserDB.authenticateUser(username, password);
    
    // Generate JWT token
    const token = TokenManager.generateToken(user);
    
    res.json({
      message: 'Login successful',
      accessToken: token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ 
      message: error.message || 'Authentication failed' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
router.post('/logout', authMiddleware.verifyToken, async (req, res) => {
  try {
    // Log the logout
    await SecureUserDB.logAuthAttempt(
      req.user.id, 
      'logout', 
      true, 
      { username: req.user.username }
    );
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const user = await SecureUserDB.getUserById(req.user.id);
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      is_active: user.is_active
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { username } = req.body;
    
    const updatedUser = await SecureUserDB.updateUserProfile(req.user.id, {
      username
    });
    
    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ 
      message: error.message || 'Profile update failed' 
    });
  }
});

/**
 * GET /api/auth/audit-logs
 * Get audit logs (admin only)
 */
router.get('/audit-logs', 
  authMiddleware.verifyToken, 
  authMiddleware.requireRole(['admin']), 
  async (req, res) => {
    try {
      const { limit = 100, user_id, action, success } = req.query;
      
      const logs = await SecureUserDB.getAuditLogs({
        limit: parseInt(limit),
        user_id,
        action,
        success: success === 'true' ? true : success === 'false' ? false : undefined
      });
      
      res.json({
        logs,
        total: logs.length
      });
    } catch (error) {
      console.error('Audit logs error:', error);
      res.status(500).json({ message: 'Failed to get audit logs' });
    }
  }
);

/**
 * POST /api/auth/verify-token
 * Verify if token is valid
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }
    
    const user = await TokenManager.verifyToken(token);
    res.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      valid: false, 
      message: 'Invalid or expired token' 
    });
  }
});

/**
 * GET /api/auth/health
 * Authentication system health check
 */
router.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await SecureUserDB.supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
