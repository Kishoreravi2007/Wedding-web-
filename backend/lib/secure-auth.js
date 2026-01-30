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

      // Validate input
      if (!username || !password || !role) {
        throw new Error('Username, password, and role are required');
      }

      // Check if user already exists
      const checkQuery = 'SELECT id FROM users WHERE username = $1';
      const { rows: existingUsers } = await query(checkQuery, [username]);

      if (existingUsers.length > 0) {
        throw new Error('Username already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const insertQuery = `
        INSERT INTO users (username, password, role, is_active, email_offers_opt_in, created_at)
        VALUES ($1, $2, $3, true, $4, NOW())
        RETURNING id
      `;

      const { rows } = await query(insertQuery, [
        username,
        hashedPassword,
        role,
        userData.email_offers_opt_in || false
      ]);

      return {
        id: rows[0].id,
        username,
        role,
        email_offers_opt_in: userData.email_offers_opt_in || false
      };

    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Authenticate user with security checks
   */
  async authenticateUser(username, password) {
    try {
      // Get user data including security fields
      const { rows } = await query(
        'SELECT id, username, password, role, is_active, login_attempts, last_login_attempt, locked_until, is_2fa_enabled, two_factor_secret, email_offers_opt_in FROM users WHERE username = $1',
        [username]
      );

      const user = rows[0];

      if (!user) {
        // Log failed attempt (generic user_not_found)
        // await this.logAuthAttempt(null, 'login_failed', false, { username, reason: 'user_not_found' });
        throw new Error('Invalid credentials');
      }

      // Check if locked
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        throw new Error('Account is temporarily locked due to too many failed attempts');
      }

      if (!user.is_active) {
        await this.logAuthAttempt(user.id, 'login_failed', false, { username, reason: 'account_inactive' });
        throw new Error('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        // Increment login attempts and lock if necessary
        const newAttempts = (user.login_attempts || 0) + 1;
        let lockQuery = 'UPDATE users SET login_attempts = $1, last_login_attempt = NOW() WHERE id = $2';
        const params = [newAttempts, user.id];

        if (newAttempts >= 5) {
          // Lock for 15 minutes
          lockQuery = 'UPDATE users SET login_attempts = $1, last_login_attempt = NOW(), locked_until = NOW() + INTERVAL \'15 minutes\' WHERE id = $2';
        }
        await query(lockQuery, params);

        await this.logAuthAttempt(user.id, 'login_failed', false, { username, reason: 'invalid_password' });
        throw new Error('Invalid credentials');
      }

      // Success: Reset attempts and update login info
      await query(
        'UPDATE users SET login_attempts = 0, last_login_attempt = NOW(), locked_until = NULL WHERE id = $1',
        [user.id]
      );

      // Log successful login
      await this.logAuthAttempt(user.id, 'login_success', true, { username });

      return {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active,
        is_2fa_enabled: user.is_2fa_enabled,
        two_factor_secret: user.two_factor_secret,
        email_offers_opt_in: user.email_offers_opt_in
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
        'SELECT id, username, role, is_active, email_offers_opt_in FROM users WHERE id = $1',
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error getting user:', error);
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
        SELECT a.*, u.username, u.role
        FROM auth_audit_log a
        JOIN users u ON a.user_id = u.id
      `;
      const params = [];
      const conditions = [];

      if (filters.user_id) {
        conditions.push(`a.user_id = $${params.length + 1}`);
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
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod', {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  },

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-do-not-use-in-prod');

      // Verify user still exists and is active
      const user = await SecureUserDB.getUserById(decoded.id);

      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      return user;
    } catch (error) {
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
      console.log('Auth verification successful for user:', user.username);
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      return res.status(403).json({ message: 'Invalid or expired token', details: error.message });
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
