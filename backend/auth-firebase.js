/**
 * Firebase Authentication Router
 * 
 * This router implements authentication using Firebase Auth
 * with custom claims for role-based access control.
 */

const express = require('express');
const router = express.Router();
const { FirebaseAuth, authMiddleware } = require('./lib/firebase-auth');

const axios = require('axios');
const { firebaseConfig } = require('./lib/firebase');

/**
 * POST /api/auth/login
 * Log in using email and password via Firebase Auth REST API
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Call Firebase Auth REST API to sign in
    const firebaseSigninUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`;

    const response = await axios.post(firebaseSigninUrl, {
      email,
      password,
      returnSecureToken: true
    });

    const { idToken, localId } = response.data;

    // Verify the token to get role and other details
    const user = await FirebaseAuth.verifyToken(idToken);

    res.json({
      message: 'Login successful',
      token: idToken,
      accessToken: idToken,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);

    let message = 'Login failed';
    let status = 401;

    if (error.response?.data?.error?.message === 'INVALID_PASSWORD' ||
      error.response?.data?.error?.message === 'EMAIL_NOT_FOUND') {
      message = 'Invalid email or password';
    } else if (error.response?.data?.error?.message === 'USER_DISABLED') {
      message = 'User account has been disabled';
    }

    res.status(status).json({ message });
  }
});

/**
 * POST /api/auth/register
 * Register a new user (admin only in production)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, role = 'user' } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Validate role
    const validRoles = ['admin', 'photographer', 'couple', 'user'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
      });
    }

    const newUser = await FirebaseAuth.createUser({
      email,
      password,
      displayName,
      role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);

    let message = 'Registration failed';
    if (error.code === 'auth/email-already-exists') {
      message = 'Email already exists';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
    }

    res.status(400).json({ message });
  }
});

/**
 * POST /api/auth/verify-token
 * Verify Firebase ID token and return user info
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    const user = await FirebaseAuth.verifyToken(idToken);

    res.json({
      valid: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified
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
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const user = await FirebaseAuth.getUser(req.user.uid);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role: user.customClaims?.role || 'user',
      emailVerified: user.emailVerified,
      disabled: user.disabled
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
router.put('/profile', authMiddleware.verifyFirebaseToken, async (req, res) => {
  try {
    const { displayName } = req.body;

    // Update user in Firebase
    const { admin } = require('./lib/firebase-auth');
    await admin.auth().updateUser(req.user.uid, {
      displayName: displayName
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        uid: req.user.uid,
        email: req.user.email,
        displayName: displayName,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({
      message: error.message || 'Profile update failed'
    });
  }
});

/**
 * POST /api/auth/update-role
 * Update user role (admin only)
 */
router.post('/update-role',
  authMiddleware.verifyFirebaseToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { uid, role } = req.body;

      if (!uid || !role) {
        return res.status(400).json({
          message: 'User UID and role are required'
        });
      }

      const validRoles = ['admin', 'photographer', 'couple', 'user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          message: 'Invalid role. Must be one of: ' + validRoles.join(', ')
        });
      }

      await FirebaseAuth.updateUserRole(uid, role);

      res.json({
        message: 'User role updated successfully',
        uid,
        role
      });
    } catch (error) {
      console.error('Role update error:', error);
      res.status(400).json({
        message: error.message || 'Role update failed'
      });
    }
  }
);

/**
 * GET /api/auth/users
 * List all users (admin only)
 */
router.get('/users',
  authMiddleware.verifyFirebaseToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { limit = 100 } = req.query;
      const users = await FirebaseAuth.listUsers(parseInt(limit));

      res.json({
        users,
        total: users.length
      });
    } catch (error) {
      console.error('Users list error:', error);
      res.status(500).json({ message: 'Failed to get users list' });
    }
  }
);

/**
 * POST /api/auth/disable-user
 * Disable user account (admin only)
 */
router.post('/disable-user',
  authMiddleware.verifyFirebaseToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: 'User UID is required' });
      }

      await FirebaseAuth.disableUser(uid);

      res.json({
        message: 'User account disabled successfully',
        uid
      });
    } catch (error) {
      console.error('Disable user error:', error);
      res.status(400).json({
        message: error.message || 'Failed to disable user'
      });
    }
  }
);

/**
 * POST /api/auth/enable-user
 * Enable user account (admin only)
 */
router.post('/enable-user',
  authMiddleware.verifyFirebaseToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { uid } = req.body;

      if (!uid) {
        return res.status(400).json({ message: 'User UID is required' });
      }

      await FirebaseAuth.enableUser(uid);

      res.json({
        message: 'User account enabled successfully',
        uid
      });
    } catch (error) {
      console.error('Enable user error:', error);
      res.status(400).json({
        message: error.message || 'Failed to enable user'
      });
    }
  }
);

/**
 * DELETE /api/auth/user/:uid
 * Delete user account (admin only)
 */
router.delete('/user/:uid',
  authMiddleware.verifyFirebaseToken,
  authMiddleware.requireAdmin,
  async (req, res) => {
    try {
      const { uid } = req.params;

      await FirebaseAuth.deleteUser(uid);

      res.json({
        message: 'User account deleted successfully',
        uid
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(400).json({
        message: error.message || 'Failed to delete user'
      });
    }
  }
);

/**
 * GET /api/auth/health
 * Authentication system health check
 */
router.get('/health', async (req, res) => {
  try {
    // Test Firebase connection
    const { admin } = require('./lib/firebase-auth');
    await admin.auth().listUsers(1);

    res.json({
      status: 'healthy',
      provider: 'Firebase Auth',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      provider: 'Firebase Auth',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
