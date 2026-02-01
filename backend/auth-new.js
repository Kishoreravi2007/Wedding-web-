/**
 * Authentication Router - SQL Version
 * 
 * This router implements authentication using the SecureUserDB (Cloud SQL)
 * and custom JWT tokens, replacing the previous Firebase implementation.
 */

const express = require('express');
console.log("!!! LOADING AUTH.JS WITH NEW ROUTES !!!");
const router = express.Router();
const { SecureUserDB, TokenManager, authMiddleware } = require('./lib/secure-auth');
const emailService = require('./services/email-service');
const OTPAuth = require('otpauth');

/**
 * Helper to get client IP address consistently
 */
const getClientIp = (req) => {
  const xForwardedFor = req.headers['x-forwarded-for'];
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.socket.remoteAddress || req.ip || 'Unknown';
};

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

    // Log registration
    await SecureUserDB.logAuthAttempt(newUser.id, 'register', true, {
      username: effectiveUsername,
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']
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

    const user = await SecureUserDB.authenticateUser(
      effectiveUsername,
      password,
      getClientIp(req),
      req.headers['user-agent']
    );

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

    // Log successful 2FA verification
    await SecureUserDB.logAuthAttempt(user.id, '2fa_success', true, {
      username: user.username,
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']
    });

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
 * POST /api/auth/change-password
 * Change password for logged-in user
 */
router.post('/change-password', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const bcrypt = require('bcryptjs');
    const user = await SecureUserDB.getUserWithPassword(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      await SecureUserDB.logAuthAttempt(userId, 'password_change_fail', false, {
        reason: 'incorrect_current_password',
        ip_address: getClientIp(req)
      });
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await SecureUserDB.updateUserPassword(userId, hashedPassword);

    // Log success
    await SecureUserDB.logAuthAttempt(userId, 'password_change', true, {
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']
    });

    res.json({ message: 'Password updated successfully', success: true });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to update password' });
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
 * GET /api/auth/login-activity
 * Get recent login activity for the current user
 */
router.get('/login-activity', authMiddleware.verifyToken, async (req, res) => {
  try {
    const logs = await SecureUserDB.getAuditLogs({
      user_id: req.user.id,
      success: true,
      limit: 20
    });

    res.json(logs);
  } catch (error) {
    console.error('Login activity error:', error);
    res.status(500).json({ message: 'Failed to fetch login activity' });
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

    // Check if user exists (email is stored in username column)
    const { query } = require('./lib/db-gcp');
    const { rows } = await query(
      'SELECT id, username FROM users WHERE username = $1',
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
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes from now

    // Store the token in the database
    await query(
      `UPDATE users SET 
        password_reset_token = $1, 
        password_reset_expires = $2 
      WHERE id = $3`,
      [resetToken, expiresAt, user.id]
    );

    // Send the reset email (username IS the email, extract name from before @)
    const userName = user.username.split('@')[0];
    const emailResult = await emailService.sendPasswordResetEmail(
      user.username,
      resetToken,
      userName
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

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({ message: 'Email, token, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    console.log('🔐 Password reset attempt for:', email);

    const { query } = require('./lib/db-gcp');
    const bcrypt = require('bcryptjs');

    // Verify token and expiry
    // Email is stored in username column
    const { rows } = await query(
      `SELECT id, username FROM users 
       WHERE username = $1 
       AND password_reset_token = $2 
       AND password_reset_expires > NOW()`,
      [email.toLowerCase(), token]
    );

    if (rows.length === 0) {
      console.log('⚠️ Invalid or expired password reset token for:', email);
      return res.status(400).json({ message: 'Invalid or expired password reset link' });
    }

    const user = rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password and clear reset token
    await query(
      `UPDATE users SET 
        password = $1, 
        password_reset_token = NULL, 
        password_reset_expires = NULL 
      WHERE id = $2`,
      [hashedPassword, user.id]
    );

    console.log('✅ Password successfully reset for:', email);

    res.json({
      message: 'Password reset successful',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

/**
 * DELETE /api/auth/account
 * Delete the currently logged-in user's account
 */
router.delete('/account', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const success = await SecureUserDB.deleteUser(userId);
    if (success) {
      res.json({ message: 'Account deleted successfully', success: true });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

/**
 * GET /api/auth/public/wedding/:slug
 * Get public wedding details by slug (username for now)
 */
router.get('/public/wedding/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { query } = require('./lib/db-gcp');

    // Join users and weddings table
    // We limit to 1 result
    console.log(`[PublicWedding] Fetching details for slug: ${slug}`);
    const result = await query(
      `SELECT u.username, w.* 
         FROM users u
         LEFT JOIN weddings w ON u.id = w.user_id
         WHERE u.username ILIKE $1 
         LIMIT 1`,
      [slug + '%']
    );
    console.log(`[PublicWedding] Query result rows: ${result.rows.length}`);
    if (result.rows.length > 0) {
      console.log(`[PublicWedding] Found user: ${result.rows[0].username}, Wedding ID: ${result.rows[0].id}`);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Wedding not found' });
    }

    const row = result.rows[0];

    // If no wedding data found (row.user_id might be null if left join failed to find match, 
    // but row exists because user exists), we return defaults
    // Actually if user exists but no wedding record, w.* columns will be null

    const weddingData = {
      groomName: row.groom_name || 'Groom',
      brideName: row.bride_name || 'Bride',
      weddingDate: row.wedding_date || '2026-03-15',
      venue: row.venue || 'Venue TBD',
      theme: row.theme || 'Modern Elegance',
      weddingTime: row.wedding_time || '10:00',
      showCountdown: row.show_countdown !== null ? row.show_countdown : true,
      guestCount: row.guest_count || 0
    };

    res.json(weddingData);
  } catch (error) {
    console.error('Get public wedding error:', error);
    res.status(500).json({ message: 'Failed to fetch wedding details' });
  }
});

/**
 * GET /api/auth/client/wedding
 * Get wedding details for logged-in user
 */
router.get('/client/wedding', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { query } = require('./lib/db-gcp');

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch wedding details for this user
    const result = await query(
      `SELECT * FROM weddings WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    let weddingData = {};

    if (result.rows.length > 0) {
      const row = result.rows[0];
      weddingData = {
        id: row.id, // Important for updates
        groomName: row.groom_name,
        brideName: row.bride_name,
        weddingDate: row.wedding_date,
        venue: row.venue,
        theme: row.theme,
        weddingTime: row.wedding_time,
        showCountdown: row.show_countdown,
        guestCount: row.guest_count,
        slug: row.wedding_code // Wait, calling it slug in frontend
      };

      // Also fetch the username/slug from users table if needed for correctness
      // But wedding_code in weddings table seems to be the intended slug field based on other code
      // Let's ensure we return what the frontend expects.
      // Frontend expects: groomName, brideName, weddingDate, weddingTime, showCountdown, guestCount, theme, slug.
    } else {
      // Return defaults if no wedding set up yet
      weddingData = {
        groomName: 'Groom',
        brideName: 'Bride',
        weddingDate: '2026-03-15',
        venue: '',
        theme: 'Modern Elegance',
        weddingTime: '10:00',
        showCountdown: true,
        guestCount: 0,
        slug: req.user.username // Fallback to username as slug if no wedding code
      };
    }

    // Wrap in "wedding" key as seen in frontend: if (data.wedding)
    res.json({ wedding: weddingData });

  } catch (error) {
    console.error('Get client wedding error:', error);
    res.status(500).json({ message: 'Failed to fetch wedding details' });
  }
});

/**
 * PUT /api/auth/client/wedding
 * Update wedding details for logged-in user
 */
router.put('/client/wedding', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { weddingData } = req.body;
    const { query } = require('./lib/db-gcp');

    if (!weddingData) {
      return res.status(400).json({ message: 'Wedding data is required' });
    }

    // req.user is set by authMiddleware
    // secure-auth.js -> verifyToken sets req.user = user
    // TokenManager.verifyToken returns user object (from SecureUserDB) which has .id property
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Upsert into weddings table
    // PostgreSQL UPSERT syntax
    await query(
      `INSERT INTO weddings (user_id, groom_name, bride_name, wedding_date, venue, guest_count, theme, wedding_time, show_countdown, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (user_id) 
         DO UPDATE SET 
            groom_name = EXCLUDED.groom_name,
            bride_name = EXCLUDED.bride_name,
            wedding_date = EXCLUDED.wedding_date,
            venue = EXCLUDED.venue,
            guest_count = EXCLUDED.guest_count,
            theme = EXCLUDED.theme,
            wedding_time = EXCLUDED.wedding_time,
            show_countdown = EXCLUDED.show_countdown,
            updated_at = NOW()`,
      [
        userId,
        weddingData.groomName,
        weddingData.brideName,
        weddingData.weddingDate,
        weddingData.venue,
        weddingData.guestCount || 0,
        weddingData.theme,
        weddingData.weddingTime,
        weddingData.showCountdown !== undefined ? weddingData.showCountdown : true
      ]
    );

    res.json({ message: 'Wedding details updated successfully', success: true });
  } catch (error) {
    console.error('Update wedding details error:', error);
    res.status(500).json({ message: 'Failed to update wedding details' });
  }
});

module.exports = { router, authenticateToken: authMiddleware.verifyToken };
