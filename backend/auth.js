/**
 * Authentication Router - SQL Version
 * 
 * This router implements authentication using the SecureUserDB (Cloud SQL)
 * and custom JWT tokens, replacing the previous Firebase implementation.
 */

const express = require('express');
const router = express.Router();
const { SecureUserDB, TokenManager, authMiddleware } = require('./lib/secure-auth');
const emailService = require('./services/email-service');
const OTPAuth = require('otpauth');

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'user', fullName } = req.body;

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
      role,
      email_offers_opt_in: req.body.email_offers_opt_in || false
    });

    // Generate token
    const token = TokenManager.generateToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email_offers_opt_in: newUser.email_offers_opt_in
      },
      token,
      accessToken: token
    });

    // Send AI Welcome Email (Non-blocking)
    try {
      const displayName = fullName || effectiveUsername.split('@')[0];
      emailService.sendWelcomeEmailAI(effectiveUsername, displayName);
    } catch (emailError) {
      console.error('Failed to send AI welcome email:', emailError);
    }

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

    // 2FA CHECK
    if (user.is_2fa_enabled) {
      return res.json({
        message: '2FA verification required',
        require2FA: true,
        userId: user.id
      });
    }

    const token = TokenManager.generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        email_offers_opt_in: user.email_offers_opt_in
      },
      token,
      accessToken: token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: error.message || 'Login failed' });
  }
});

/**
 * POST /api/auth/verify-2fa
 * Verify 2FA code and complete login
 */
router.post('/verify-2fa', async (req, res) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ message: 'User ID and Code are required' });
    }

    // Get user to retrieve secret (Need a method to get user by ID including secrets, 
    // but SecureUserDB.authenticateUser is by username/password.
    // Let's add a quick helper or reuse logic carefully. 
    // Since we authenticated password in /login step, we just need to verify code.
    // Ideally we would use a temporary session token, but for simplicity here we trust userId + code.
    // A better approach: login issues a temp limited-scope JWT that allows calling /verify-2fa.
    // For this MVP: trusting userId is risky if someone guesses userId, but they need the code too.

    // We need the secret from DB. SecureUserDB doesn't expose secret by default in getUserById.
    // We will query directly here or add a helper in SecureUserDB.
    // Re-using a query here for simplicity:
    const { query } = require('./lib/db-gcp');
    const { rows } = await query('SELECT id, username, role, is_active, two_factor_secret, email_offers_opt_in FROM users WHERE id = $1', [userId]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'User found' });
    }

    // Verify code
    const totp = new OTPAuth.TOTP({
      issuer: "WeddingWeb",
      label: user.username,
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: user.two_factor_secret
    });

    const delta = totp.validate({ token: code, window: 1 });

    if (delta === null) {
      return res.status(401).json({ message: 'Invalid 2FA code' });
    }

    // Success - issue full token
    const token = TokenManager.generateToken(user);
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        email_offers_opt_in: user.email_offers_opt_in
      },
      token,
      accessToken: token
    });

  } catch (error) {
    console.error('2FA Verification error:', error);
    res.status(500).json({ message: 'Verification failed' });
  }
});

/**
 * POST /api/auth/2fa/toggle
 * Enable or Disable 2FA
 */
router.post('/2fa/toggle', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { enabled, secret } = req.body;
    const userId = req.user.id;

    if (enabled && !secret) {
      return res.status(400).json({ message: 'Secret is required to enable 2FA' });
    }

    await SecureUserDB.setTwoFactorAuth(userId, enabled ? secret : null, enabled);

    res.json({
      message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      is_2fa_enabled: enabled
    });

  } catch (error) {
    console.error('2FA Toggle error:', error);
    res.status(500).json({ message: 'Failed to update 2FA settings' });
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

/**
 * DELETE /api/auth/delete
 * Delete user account permanently
 */
router.delete('/delete', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Perform deletion
    await SecureUserDB.deleteUser(userId);

    res.json({
      message: 'Account deleted successfully',
      deleted: true
    });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({
      message: 'Failed to delete account. Please try again.'
    });
  }
});

/**
 * POST /api/auth/preferences/email
 * Update email opt-in preference
 */
router.post('/preferences/email', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { enabled } = req.body;
    const userId = req.user.id;

    if (enabled === undefined) {
      return res.status(400).json({ message: 'Enabled status is required' });
    }

    await SecureUserDB.setEmailOptIn(userId, enabled);

    res.json({
      message: `Email offers ${enabled ? 'enabled' : 'disabled'} successfully`,
      email_offers_opt_in: enabled
    });

  } catch (error) {
    console.error('Email Preference error:', error);
    res.status(500).json({ message: 'Failed to update email preferences' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    console.log('🔐 Password reset requested for:', email);

    // Check if user exists (using email as username)
    const { rows } = await require('./db/postgres').query(
      'SELECT id, username, email FROM users WHERE username = $1 OR email = $1',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration attacks
    if (rows.length === 0) {
      console.log('⚠️ Password reset requested for non-existent email:', email);
      return res.json({
        message: 'If an account exists with this email, a reset link has been sent.',
        success: true
      });
    }

    const user = rows[0];

    // Generate reset token (simple UUID-like token)
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store the token in the database
    await require('./db/postgres').query(
      `UPDATE users SET 
        password_reset_token = $1, 
        password_reset_expires = $2 
      WHERE id = $3`,
      [resetToken, expiresAt, user.id]
    );

    // Send the reset email
    const emailResult = await emailService.sendPasswordResetEmail(
      user.username,
      resetToken,
      user.email || user.username.split('@')[0]
    );

    if (emailResult.success) {
      console.log('✅ Password reset email sent to:', email);
    } else {
      console.error('❌ Failed to send password reset email:', emailResult.error);
    }

    res.json({
      message: 'If an account exists with this email, a reset link has been sent.',
      success: true
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process password reset request' });
  }
});

module.exports = { router, authenticateToken: authMiddleware.verifyToken };
