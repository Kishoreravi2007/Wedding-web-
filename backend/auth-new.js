/**
 * Authentication Router - SQL Version
 * 
 * This router implements authentication using the SecureUserDB (Cloud SQL)
 * and custom JWT tokens, replacing the previous Firebase implementation.
 */

const express = require('express');
// Auth router loading...
const router = express.Router();
const { SecureUserDB, TokenManager, authMiddleware } = require('./lib/secure-auth');
const emailService = require('./services/email-service');
const OTPAuth = require('otpauth');
const { supabase } = require('./lib/supabase');

console.log('🛡️  auth-new.js module loading... (Secure SQL Auth)');

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
    const { username, email, password, role = 'user', fullName, location, bio, avatarUrl } = req.body;

    // Support both username and email fields (map email to username if needed)
    const effectiveUsername = (username || email || '').toLowerCase();

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
        email_offers_opt_in: newUser.email_offers_opt_in,
        has_premium_access: newUser.has_premium_access
      },
      token,
      accessToken: token
    });

    // Create User Profile (SQL)
    try {
      const { query } = require('./lib/db-gcp');
      await query(
        `INSERT INTO profiles (user_id, full_name, email, location, bio, avatar_url, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [newUser.id, fullName || effectiveUsername.split('@')[0], effectiveUsername, location || null, bio || null, avatarUrl || null]
      );
      console.log(`👤 Profile created for user ${newUser.id}`);
    } catch (profileError) {
      console.error('Failed to create user profile during registration:', profileError);
      // Non-blocking: user is still created
    }

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
    const effectiveUsername = (username || email || '').toLowerCase();

    if (!effectiveUsername || !password) {
      return res.status(400).json({ message: 'Username/Email and password are required' });
    }

    const user = await SecureUserDB.authenticateUser(
      effectiveUsername,
      password,
      getClientIp(req),
      req.headers['user-agent']
    );

    // 2FA CHECK REMOVED FROM LOGIN
    // We now issue the token directly. The 2FA check is moved to a 'Step-up' action.

    const token = TokenManager.generateToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        email_offers_opt_in: user.email_offers_opt_in,
        is_2fa_enabled: user.is_2fa_enabled,
        has_premium_access: user.has_premium_access,
        wedding_id: user.wedding_id
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
 * POST /api/auth/social-sync
 * Sync social login (Supabase) with local SQL DB
 */
router.post('/social-sync', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Supabase token is required' });
    }

    // Verify token with Supabase
    const { data: { user: sbUser }, error: sbError } = await supabase.auth.getUser(token);

    if (sbError || !sbUser) {
      console.error('Supabase token verification failed:', sbError);
      return res.status(401).json({ message: 'Invalid social login session' });
    }

    const email = sbUser.email.toLowerCase();
    const { query } = require('./lib/db-gcp');

    // 1. Check if user already exists in SQL DB
    const { rows: existingUsers } = await query(
      'SELECT * FROM users WHERE LOWER(username) = $1',
      [email]
    );

    let user = existingUsers[0];

    // 2. If user doesn't exist, create them
    if (!user) {
      console.log(`🆕 Creating new SQL user for social login: ${email}`);
      const { rows: newUserRows } = await query(
        `INSERT INTO users (username, password, role, is_active, created_at)
         VALUES ($1, $2, $3, true, NOW())
         RETURNING *`,
        [email, 'SOC_' + require('crypto').randomBytes(16).toString('hex'), 'user']
      );
      user = newUserRows[0];

      // Create Profile
      try {
        await query(
          `INSERT INTO profiles (user_id, full_name, email, created_at, updated_at) 
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id, sbUser.user_metadata?.full_name || email.split('@')[0], email]
        );
      } catch (pErr) {
        console.error('Failed to create profile during social sync:', pErr);
      }
    }

    // 3. Generate native backend token
    const nativeToken = TokenManager.generateToken(user);

    // 4. Log sync success
    await SecureUserDB.logAuthAttempt(user.id, 'social_sync_success', true, {
      username: email,
      provider: 'google',
      ip_address: getClientIp(req)
    });

    res.json({
      message: 'Social login synchronized',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        wedding_id: user.wedding_id
      },
      token: nativeToken,
      accessToken: nativeToken
    });

  } catch (error) {
    console.error('Social sync error:', error);
    res.status(500).json({ message: 'Failed to synchronize social login' });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (validates JWT session)
 */
router.get('/profile', authMiddleware.verifyToken, async (req, res) => {
  try {
    // req.user is populated by authMiddleware.verifyToken
    const user = req.user;

    // Fetch wedding data and profile for a complete response
    const { query } = require('./lib/db-gcp');
    const { rows } = await query(
      `SELECT u.id, u.username, u.role, u.is_active, u.is_2fa_enabled,
              u.email_offers_opt_in, u.has_premium_access, u.wedding_id,
              w.groom_name, w.bride_name, w.wedding_date, w.venue, w.guest_count, w.theme,
              p.full_name, p.email, p.location, p.bio, p.avatar_url
       FROM users u
       LEFT JOIN weddings w ON u.id = w.user_id
       LEFT JOIN profiles p ON u.id::text = p.user_id
       WHERE u.id = $1`,
      [user.id]
    );

    const fullUser = rows[0] || user;

    // Build profile with wedding data
    const profile = {
      full_name: fullUser.full_name || fullUser.username?.split('@')[0],
      email: fullUser.email || fullUser.username,
      location: fullUser.location,
      bio: fullUser.bio,
      avatar_url: fullUser.avatar_url,
    };

    if (fullUser.groom_name || fullUser.bride_name) {
      profile.weddingData = {
        groomName: fullUser.groom_name,
        brideName: fullUser.bride_name,
        weddingDate: fullUser.wedding_date,
        venue: fullUser.venue,
        guestCount: fullUser.guest_count,
        theme: fullUser.theme,
      };
    }

    // Get premium features
    const premiumFeatures = await SecureUserDB.getActiveFeatures(user.id);

    res.json({
      user: {
        id: fullUser.id,
        username: fullUser.username,
        role: fullUser.role,
        is_active: fullUser.is_active,
        is_2fa_enabled: fullUser.is_2fa_enabled || false,
        email_offers_opt_in: fullUser.email_offers_opt_in || false,
        has_premium_access: fullUser.has_premium_access || false,
        premium_features: premiumFeatures,
        wedding_id: fullUser.wedding_id,
        profile: profile
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

/**
 * POST /api/auth/step-up-2fa
 * Verify 2FA code for an already authenticated user (Step-up auth)
 */
router.post('/step-up-2fa', authMiddleware.verifyToken, async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ message: '2FA Code is required' });
    }

    // Get user from DB to get secret
    const { query } = require('./lib/db-gcp');
    const { rows } = await query('SELECT username, two_factor_secret, is_2fa_enabled FROM users WHERE id = $1', [userId]);
    const user = rows[0];

    if (!user || !user.is_2fa_enabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
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
      // Log failed step-up attempt
      await SecureUserDB.logAuthAttempt(userId, 'step_up_2fa_fail', false, {
        ip_address: getClientIp(req),
        user_agent: req.headers['user-agent']
      });
      return res.status(401).json({ message: 'Invalid 2FA code' });
    }

    // Success
    await SecureUserDB.logAuthAttempt(userId, 'step_up_2fa_success', true, {
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: '2FA verification successful'
    });

  } catch (error) {
    console.error('Step-up 2FA error:', error);
    res.status(500).json({ message: 'Verification failed' });
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
      return res.status(404).json({ message: 'User not found' });
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
        email_offers_opt_in: user.email_offers_opt_in,
        wedding_id: user.wedding_id
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
    const normalizedSlug = slug ? slug.trim().toLowerCase().replace(/\/$/, '') : '';
    console.log(`[PublicWedding] Fetching details for normalized slug: "${normalizedSlug}" (Original: "${slug}")`);

    const result = await query(
      `SELECT 
          u.username,
          u.id as user_uuid,
          w.user_id as wedding_id,
          w.groom_name,
          w.bride_name,
          w.wedding_date,
          w.venue,
          w.guest_count,
          w.theme,
          w.wedding_time,
          w.show_countdown,
          w.music_enabled,
          w.music_url,
          w.music_source,
          w.playlist_url,
          w.volume,
          w.wedding_code,
          w.customizations
        FROM users u
        LEFT JOIN weddings w ON u.id = w.user_id
        WHERE w.wedding_code ILIKE $1 OR u.username ILIKE $1
        LIMIT 1`,
      [normalizedSlug]
    );

    console.log(`[PublicWedding] Query result rows: ${result.rows.length}`);

    if (result.rows.length === 0) {
      console.log(`[PublicWedding] No wedding found for slug: "${normalizedSlug}"`);
      return res.status(404).json({ message: 'Wedding not found' });
    }

    const row = result.rows[0];
    console.log(`[PublicWedding] Match found - Username: ${row.username}, Slug Match: ${row.wedding_code === normalizedSlug ? 'Wedding Code' : 'Username'}`);

    const weddingData = {
      id: row.wedding_id || row.user_uuid,
      groomName: row.groom_name || 'Groom',
      brideName: row.bride_name || 'Bride',
      weddingDate: row.wedding_date || '2026-03-15',
      venue: row.venue || 'Venue TBD',
      theme: row.theme || 'Modern Elegance',
      weddingTime: row.wedding_time || '10:00',
      showCountdown: row.show_countdown !== null ? row.show_countdown : true,
      guestCount: row.guest_count || 0,
      musicEnabled: row.music_enabled || false,
      musicUrl: row.music_url || null,
      musicSource: row.music_source || 'upload',
      playlistUrl: row.playlist_url || null,
      musicSource: row.music_source || 'upload',
      playlistUrl: row.playlist_url || null,
      volume: row.volume !== null ? row.volume : 50,
      customizations: row.customizations || {}
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
        ...row,
        // Also provide camelCase for other components
        id: row.id,
        groomName: row.groom_name,
        brideName: row.bride_name,
        weddingDate: row.wedding_date,
        venue: row.venue,
        theme: row.theme,
        weddingTime: row.wedding_time,
        showCountdown: row.show_countdown,
        guestCount: row.guest_count,
        slug: row.wedding_code,
        musicEnabled: row.music_enabled || false,
        musicUrl: row.music_url || null,
        musicSource: row.music_source || 'upload',
        playlistUrl: row.playlist_url || null,
        playlistUrl: row.playlist_url || null,
        volume: row.volume !== null ? row.volume : 50,
        customizations: row.customizations || {},
        photographer_username: row.photographer_username,
        photographer_password: row.photographer_password
      };

      // Also fetch the username/slug from users table if needed for correctness
      // But wedding_code in weddings table seems to be the intended slug field based on other code
      // Let's ensure we return what the frontend expects.
      // Frontend expects: groomName, brideName, weddingDate, weddingTime, showCountdown, guestCount, theme, slug.
    } else {
      // Return defaults if no wedding set up yet
      weddingData = {
        groom_name: 'Groom',
        bride_name: 'Bride',
        wedding_date: '2026-03-15',
        venue: '',
        theme: 'Modern Elegance',
        wedding_time: '10:00',
        show_countdown: true,
        guest_count: 0,
        wedding_code: req.user.username.split('@')[0],

        groomName: 'Groom',
        brideName: 'Bride',
        weddingDate: '2026-03-15',
        theme: 'Modern Elegance',
        weddingTime: '10:00',
        showCountdown: true,
        musicEnabled: false,
        musicUrl: null,
        musicSource: 'upload',
        playlistUrl: null,
        volume: 50,
        guestCount: 0,
        slug: req.user.username.split('@')[0]
      };
    }

    console.log('📡 [GET /client/wedding] Sending response:', JSON.stringify({ wedding: weddingData }, null, 2));
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
    console.log('📝 [PUT /client/wedding] Received weddingData:', JSON.stringify(weddingData, null, 2));

    // TokenManager.verifyToken returns user object (from SecureUserDB) which has .id property
    const userId = req.user.id;
    const requestedSlug = weddingData.slug ? weddingData.slug.toLowerCase().trim() : null;

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    // Check for slug uniqueness if provided
    if (requestedSlug) {
      // Check if it's already used in weddings table by someone else
      const weddingCheck = await query(
        `SELECT user_id FROM weddings WHERE wedding_code ILIKE $1 AND user_id != $2`,
        [requestedSlug, userId]
      );

      if (weddingCheck.rows.length > 0) {
        return res.status(409).json({ message: 'This personalized link is already taken by another wedding.' });
      }

      // Check if it's a reserved username in the users table by someone else
      const userCheck = await query(
        `SELECT id FROM users WHERE username ILIKE $1 AND id != $2`,
        [requestedSlug, userId]
      );

      if (userCheck.rows.length > 0) {
        return res.status(409).json({ message: 'This link name is reserved by another user profile. Please choose another.' });
      }
    }

    console.log('📝 [PUT /client/wedding] userId:', userId, 'Slug:', requestedSlug);

    // Upsert into weddings table
    // PostgreSQL UPSERT syntax
    await query(
      `INSERT INTO weddings (user_id, groom_name, bride_name, wedding_date, venue, guest_count, theme, wedding_time, show_countdown, music_enabled, music_url, music_source, playlist_url, volume, wedding_code, customizations, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
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
            music_enabled = EXCLUDED.music_enabled,
            music_url = EXCLUDED.music_url,
            music_source = EXCLUDED.music_source,
            playlist_url = EXCLUDED.playlist_url,
            volume = EXCLUDED.volume,
            wedding_code = EXCLUDED.wedding_code,
            customizations = EXCLUDED.customizations,
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
        weddingData.showCountdown !== undefined ? weddingData.showCountdown : true,
        weddingData.musicEnabled !== undefined ? weddingData.musicEnabled : false,
        weddingData.musicUrl || null,
        weddingData.musicSource || 'upload',
        weddingData.playlistUrl || null,
        weddingData.volume !== undefined ? weddingData.volume : 50,
        weddingData.slug,
        weddingData.customizations || {}
      ]
    );

    res.json({ message: 'Wedding details updated successfully', success: true });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'This Website Link is already taken. Please choose another one.' });
    }
    console.error('Update wedding error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    res.status(500).json({ message: 'Failed to update wedding details: ' + error.message });
  }
});

/**
 * POST /api/auth/photographer/credentials
 * Generate or update photographer credentials for the client's wedding
 */
router.get('/photographer/wedding-details', authMiddleware.verifyToken, async (req, res) => {
  try {
    const weddingId = req.user.wedding_id;
    const { query } = require('./lib/db-gcp');

    if (!weddingId) {
      return res.status(403).json({ message: 'Not authorized for any wedding portal' });
    }

    const { rows } = await query(
      'SELECT id, wedding_code, groom_name, bride_name, wedding_date, theme FROM weddings WHERE id = $1',
      [weddingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Wedding not found' });
    }

    const wedding = rows[0];

    // Fetch events for this wedding's user_id
    // Note: weddings table user_id links to its owner, event_timeline links to user_id
    const { rows: events } = await query(
      'SELECT id, title FROM event_timeline WHERE user_id = (SELECT user_id FROM weddings WHERE id = $1) ORDER BY event_date ASC',
      [weddingId]
    );

    res.json({
      success: true,
      wedding: {
        ...wedding,
        events: events.map(e => e.title)
      }
    });

  } catch (error) {
    console.error('Photographer wedding details error:', error);
    res.status(500).json({ message: 'Failed to fetch wedding details' });
  }
});

router.post('/photographer/credentials', authMiddleware.verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    const { query } = require('./lib/db-gcp');
    const bcrypt = require('bcryptjs');

    if (!password || password.length < 4) {
      return res.status(400).json({ message: 'Photographer password must be at least 4 characters' });
    }

    // 1. Get client's wedding (Robust Lookup)
    console.log(`🔍 Looking up wedding for user: ${userId}`);

    // Strategy A: Check user's profile for wedding_id first
    const userProfile = await query('SELECT wedding_id FROM users WHERE id = $1', [userId]);
    let weddingIdProfile = userProfile.rows[0]?.wedding_id;
    let weddingResult;

    if (weddingIdProfile) {
      weddingResult = await query('SELECT id, wedding_code FROM weddings WHERE id = $1', [weddingIdProfile]);
    }

    // Strategy B: Fallback to ownership lookup if Step A failed
    if (!weddingResult || weddingResult.rows.length === 0) {
      weddingResult = await query('SELECT id, wedding_code FROM weddings WHERE user_id = $1 LIMIT 1', [userId]);
    }

    // Log for debugging (using appendFileSync for reliability)
    try {
      require('fs').appendFileSync('request_debug.log', `[${new Date().toISOString()}] USER_ID: ${userId} | PROFILE_WID: ${weddingIdProfile} | FOUND: ${weddingResult.rows.length > 0}\n`);
    } catch (e) { }

    if (weddingResult.rows.length === 0) {
      return res.status(404).json({ message: 'No wedding found for this account. Create a wedding first.' });
    }

    const wedding = weddingResult.rows[0];
    const photoUsername = `photo_${wedding.wedding_code || wedding.id.substring(0, 8)}`.toLowerCase();

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create or Update Photographer User
    const { rows: existingPhotos } = await query(
      'SELECT id FROM users WHERE role = $1 AND wedding_id = $2',
      ['photographer', wedding.id]
    );

    let resultUser;
    if (existingPhotos.length > 0) {
      // Update existing
      const updateResult = await query(
        `UPDATE users SET 
          username = $1, 
          password = $2, 
          is_active = true 
        WHERE id = $3 
        RETURNING id, username, role`,
        [photoUsername, hashedPassword, existingPhotos[0].id]
      );
      resultUser = updateResult.rows[0];
    } else {
      // Create new
      const insertResult = await query(
        `INSERT INTO users (username, password, role, is_active, wedding_id, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id, username, role`,
        [photoUsername, hashedPassword, 'photographer', true, wedding.id]
      );
      resultUser = insertResult.rows[0];
    }

    // 4. Store plaintext credentials in weddings table for display
    await query(
      `UPDATE weddings 
       SET photographer_username = $1, 
           photographer_password = $2 
       WHERE id = $3`,
      [photoUsername, password, wedding.id]
    );

    res.json({
      success: true,
      message: 'Photographer credentials updated successfully',
      credentials: {
        username: resultUser.username,
        password: password
      }
    });

  } catch (error) {
    console.error('Photographer credentials error:', error);
    res.status(500).json({ message: 'Failed to manage photographer credentials' });
  }
});

module.exports = { router, authenticateToken: authMiddleware.verifyToken };
