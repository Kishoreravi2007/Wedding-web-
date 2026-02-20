/**
 * Secure Authentication System - Cloud SQL Version
 * 
 * This module provides secure authentication using Cloud SQL
 * replacing the previous Supabase implementation.
 */

const { query } = require('./db-gcp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Secure User Database Operations
 */
const SecureUserDB = {
  /**
   * Create a new user with proper security checks
   */
  async createUser(userData) {
    try {
      const { username, password, role } = userData;
      const normalizedUsername = username.toLowerCase();

      // Validate input
      if (!username || !password || !role) {
        throw new Error('Username, password, and role are required');
      }

      // Check if user already exists
      const checkQuery = 'SELECT id FROM users WHERE LOWER(username) = $1';
      const { rows: existingUsers } = await query(checkQuery, [normalizedUsername]);

      if (existingUsers.length > 0) {
        throw new Error('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const insertQuery = `
        INSERT INTO users (username, password, role, is_active, email_offers_opt_in, has_premium_access, wedding_id, created_at)
        VALUES ($1, $2, $3, true, $4, $5, $6, NOW())
        RETURNING id
      `;

      const { rows } = await query(insertQuery, [
        normalizedUsername,
        hashedPassword,
        role,
        userData.email_offers_opt_in || false,
        userData.has_premium_access || false,
        userData.wedding_id || null
      ]);

      return {
        id: rows[0].id,
        username: normalizedUsername,
        role,
        email_offers_opt_in: userData.email_offers_opt_in || false,
        has_premium_access: userData.has_premium_access || false,
        wedding_id: userData.wedding_id || null
      };

    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Authenticate user with security checks
   */
  async authenticateUser(username, password, ipAddress, userAgent) {
    try {
      const normalizedUsername = username.toLowerCase();
      // Get user data - using SELECT * to be defensive against schema changes
      // AND join with weddings table to populate weddingData
      const { rows } = await query(
        `SELECT u.*, 
            w.groom_name, w.bride_name, w.wedding_date, w.venue, w.guest_count, w.theme,
            p.email as profile_email, p.full_name, p.avatar_url as profile_avatar
         FROM users u
         LEFT JOIN weddings w ON u.id = w.user_id
         LEFT JOIN profiles p ON u.id = p.user_id::uuid OR u.username = p.email
         WHERE LOWER(u.username) = $1 OR LOWER(p.email) = $1`,
        [normalizedUsername]
      );

      const user = rows[0];
      const authDetails = { username: normalizedUsername, ip_address: ipAddress, user_agent: userAgent };

      if (!user) {
        // Log failed attempt (generic user_not_found)
        await this.logAuthAttempt(null, 'login_failed', false, { ...authDetails, reason: 'user_not_found' });
        throw new Error('Invalid credentials');
      }

      // Check if locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        throw new Error('Account is temporarily locked due to too many failed attempts');
      }

      if (!user.is_active) {
        await this.logAuthAttempt(user.id, 'login_failed', false, { ...authDetails, reason: 'account_inactive' });
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // Increment login attempts and lock if necessary
        const newAttempts = (user.login_attempts || 0) + 1;
        let lockQuery = 'UPDATE users SET login_attempts = $1, last_login_attempt = NOW() WHERE id = $2';
        const params = [newAttempts, user.id];

        if (newAttempts >= 5) {
          // Lock for 15 minutes
          lockQuery = 'UPDATE users SET login_attempts = $1, last_login_attempt = NOW(), locked_until = NOW() + INTERVAL \'15 minutes\' WHERE id = $2';
        }
        await query(lockQuery, params);

        await this.logAuthAttempt(user.id, 'login_failed', false, { ...authDetails, reason: 'invalid_password' });
        throw new Error('Invalid credentials');
      }

      // Success: Reset attempts and update login info
      await query(
        'UPDATE users SET login_attempts = 0, last_login_attempt = NOW(), locked_until = NULL WHERE id = $1',
        [user.id]
      );

      // Log successful login
      await this.logAuthAttempt(user.id, 'login_success', true, authDetails);

      // Map wedding data
      user.profile = user.profile || {};
      if (user.groom_name || user.bride_name) {
        user.profile.weddingData = {
          groomName: user.groom_name,
          brideName: user.bride_name,
          weddingDate: user.wedding_date,
          venue: user.venue,
          guestCount: user.guest_count,
          theme: user.theme
        };
      }

      // Get active premium features
      const premiumFeatures = await this.getActiveFeatures(user.id);

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        is_2fa_enabled: user.is_2fa_enabled,
        two_factor_secret: user.two_factor_secret,
        email_offers_opt_in: user.email_offers_opt_in,
        has_premium_access: user.has_premium_access, // Keep for backward compatibility
        premium_features: premiumFeatures, // New atomic features list
        wedding_id: user.wedding_id,
        profile: user.profile,
        full_name: user.full_name,
        avatar_url: user.profile_avatar || user.avatar_url
      };

    } catch (error) {
      console.error('Authentication error:', error);
      throw error; // Re-throw for controller to handle
    }
  },

  /**
   * Log authentication attempts
   */
  async logAuthAttempt(userId, action, success, details = {}) {
    try {
      // Ensure auth_audit_log table exists or is created
      await query(
        `INSERT INTO auth_audit_log (user_id, action, success, details, ip_address, user_agent, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [userId, action, success, details, details.ip_address || null, details.user_agent || null]
      );
    } catch (error) {
      console.error('Error logging auth attempt:', error);
      // Don't throw
    }
  },

  /**
   * Get user by ID (for token verification)
   */
  async getUserById(id) {
    try {
      const { rows } = await query(
        `SELECT u.id, u.username, u.role, u.is_active, u.email_offers_opt_in, u.has_premium_access, u.wedding_id, p.avatar_url, p.full_name, p.email 
         FROM users u
         LEFT JOIN profiles p ON u.id = p.user_id::uuid OR u.username = p.email
         WHERE u.id = $1`,
        [id]
      );

      if (!rows[0]) return null;

      const user = rows[0];
      user.premium_features = await this.getActiveFeatures(id);

      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * Get all active premium features for a user
   * Merges features from all active memberships
   */
  async getActiveFeatures(userId) {
    try {
      const { rows } = await query(
        `SELECT features 
         FROM premium_memberships 
         WHERE user_id = $1 
         AND status = 'active' 
         AND expiry_date > NOW()`,
        [userId]
      );

      // Flatten and uniquify features from all active memberships
      const allFeatures = new Set();
      rows.forEach(row => {
        if (Array.isArray(row.features)) {
          row.features.forEach(f => allFeatures.add(f));
        }
      });

      return Array.from(allFeatures);
    } catch (error) {
      console.error('Error fetching active features:', error);
      return []; // Fail safe to empty array
    }
  },

  /**
   * Get user with password (for validation)
   */
  async getUserWithPassword(id) {
    try {
      const { rows } = await query(
        'SELECT id, username, password FROM users WHERE id = $1',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting user with password:', error);
      throw error;
    }
  },

  /**
   * Update user password
   */
  async updateUserPassword(id, hashedPassword) {
    try {
      await query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, id]
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  },

  /**
   * Update user profile (safe fields only)
   */
  async updateUserProfile(id, updates) {
    try {
      const allowedFields = ['username'];
      const safeUpdates = {};

      const setParts = [];
      const values = [];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key)) {
          setParts.push(`${key} = $${values.length + 1}`);
          values.push(updates[key]);
        }
      });

      if (setParts.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);
      const text = `
        UPDATE users 
        SET ${setParts.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, username, role, is_active
      `;

      const { rows } = await query(text, values);
      return rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },


  /**
   * Set 2FA Secret and Enable status
   */
  async setTwoFactorAuth(userId, secret, enabled) {
    try {
      await query(
        'UPDATE users SET two_factor_secret = $1, is_2fa_enabled = $2 WHERE id = $3',
        [secret, enabled, userId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error setting 2FA:', error);
      throw error;
    }
  },

  /**
   * Update email opt-in preference
   */
  async setEmailOptIn(userId, enabled) {
    try {
      await query(
        'UPDATE users SET email_offers_opt_in = $1 WHERE id = $2',
        [enabled, userId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error updating email opt-in:', error);
      throw error;
    }
  },

  /**
   * Delete user account and associated data
   */
  async deleteUser(userId) {
    try {
      // 1. Log attempt FIRST while user still exists (foreign key check)
      await this.logAuthAttempt(userId, 'delete_account', true, { reason: 'user_request' });

      // 2. Delete Profile (Optional but good for cleanup)
      // Note: profiles.user_id might be a string-id, while users.id is UUID.
      // We check both if possible or just try to delete if exists.
      await query('DELETE FROM profiles WHERE user_id = $1::text', [userId]);

      // 3. Delete from users table
      const { rowCount } = await query('DELETE FROM users WHERE id = $1', [userId]);

      if (rowCount === 0) {
        throw new Error('User not found or already deleted');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Get audit logs (admin only)
   */
  async getAuditLogs(filters = {}) {
    try {
      let text = `
        SELECT a.*
        FROM auth_audit_log a
      `;
      const params = [];
      const conditions = [];

      if (filters.user_id) {
        conditions.push(`a.user_id = $${params.length + 1}::uuid`);
        params.push(filters.user_id);
      }

      if (filters.action) {
        conditions.push(`a.action = $${params.length + 1}`);
        params.push(filters.action);
      }

      if (filters.success !== undefined) {
        conditions.push(`a.success = $${params.length + 1}`);
        params.push(filters.success);
      }

      if (conditions.length > 0) {
        text += ' WHERE ' + conditions.join(' AND ');
      }

      text += ' ORDER BY a.created_at DESC';

      if (filters.limit) {
        text += ` LIMIT $${params.length + 1}`;
        params.push(filters.limit);
      }

      const { rows } = await query(text, params);
      return rows;
    } catch (error) {
      console.error('Error getting audit logs:', error);
      throw error;
    }
  }
};

/**
 * JWT Token Management
 */
const TokenManager = {
  /**
   * Generate JWT token
   */
  generateToken(user) {
    const secret = process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production environment');
    }

    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      wedding_id: user.wedding_id,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, secret || 'dev-secret-do-not-use-in-prod', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  },

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret && process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production environment');
      }

      console.log('🛡️ Attempting to verify token:', token ? `${token.substring(0, 10)}...` : 'NONE');
      const decoded = jwt.verify(token, secret || 'dev-secret-do-not-use-in-prod');
      console.log('🔓 Token decoded successfully for ID:', decoded.id);

      // Verify user still exists and is active
      const user = await SecureUserDB.getUserById(decoded.id);

      if (!user) {
        console.error('❌ User not found in DB for ID:', decoded.id);
        throw new Error('User not found');
      }

      if (!user.is_active) {
        console.error('❌ User is inactive:', user.username);
        throw new Error('User inactive');
      }

      return user;
    } catch (error) {
      console.error('❌ TokenManager Verify Error:', error.message);
      throw new Error('Invalid token');
    }
  }
};

/**
 * Middleware for authentication
 */
const authMiddleware = {
  /**
   * Verify JWT token middleware
   */
  async verifyToken(req, res, next) {
    try {
      if (req.method === 'OPTIONS') return next();

      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const user = await TokenManager.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      console.error('🛡️ Auth Middleware Error:', error.message);
      return res.status(403).json({
        message: 'Invalid or expired token',
        details: error.message,
        hint: 'Please try logging out and logging in again.'
      });
    }
  },

  /**
   * Role-based access control
   */
  requireRole(roles) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    };
  }
};

module.exports = {
  SecureUserDB,
  TokenManager,
  authMiddleware,
  // supabase // Removed Supabase export
};
