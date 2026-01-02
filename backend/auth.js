/**
 * Authentication Router - SQL Version
 * 
 * This router implements authentication using the SecureUserDB (Cloud SQL)
 * and custom JWT tokens, replacing the previous Firebase implementation.
 */

const express = require('express');
const router = express.Router();
const { SecureUserDB, TokenManager, authMiddleware } = require('./lib/secure-auth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Support both username and email fields (map email to username if needed)
    const effectiveUsername = username || email;

    if (!effectiveUsername || !password) {
      return res.status(400).json({
        message: 'Username/Email and password are required'
      });
    }

    // Create user in SQL DB
    const newUser = await SecureUserDB.createUser({
      username: effectiveUsername,
      password,
      role
    });

    // Generate token
    const token = TokenManager.generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: newUser,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);

    let message = 'Registration failed';
    if (error.message.includes('already exists')) {
      message = 'Username or email already exists';
    }

    res.status(400).json({ message: error.message || message });
  }
});

/**
 * POST /api/auth/login
 * Log in and get token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const effectiveUsername = username || email;

    if (!effectiveUsername || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    const user = await SecureUserDB.authenticateUser(effectiveUsername, password);
    const token = TokenManager.generateToken(user);

    res.json({
      message: 'Login successful',
      user,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message || 'Login failed' });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify JWT token and return user info
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
      user
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      message: 'Invalid or expired token'
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (from token)
 */
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    // req.user is populated by verifyToken middleware
    res.json(req.user);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

/**
 * PUT /api/auth/profile
 * Update user auth details (like username/email)
 */
router.put('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { username } = req.body;

    // Update user in SQL
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

module.exports = { router, authenticateToken: authMiddleware.verifyToken };
