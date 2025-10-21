/**
 * Secure Authentication System
 * 
 * This module provides secure authentication using Supabase service role
 * with proper RLS policies and audit logging.
 */

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize Supabase client with service role for backend operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for secure authentication');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        throw new Error('Username already exists');
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Use the secure function to create user
      const { data, error } = await supabase.rpc('create_user', {
        p_username: username,
        p_password: hashedPassword,
        p_role: role
      });
      
      if (error) throw error;
      
      return { id: data, username, role };
      
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
      // Check if user is locked
      const { data: isLocked } = await supabase.rpc('is_user_locked', {
        username
      });
      
      if (isLocked) {
        throw new Error('Account is temporarily locked due to too many failed attempts');
      }
      
      // Get user data
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('id, username, password, role, is_active, login_attempts')
        .eq('username', username)
        .single();
      
      if (fetchError || !user) {
        // Log failed attempt
        await this.logAuthAttempt(null, 'login_failed', false, { username, reason: 'user_not_found' });
        throw new Error('Invalid credentials');
      }
      
      if (!user.is_active) {
        await this.logAuthAttempt(user.id, 'login_failed', false, { username, reason: 'account_inactive' });
        throw new Error('Account is deactivated');
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        // Increment login attempts
        await supabase.rpc('increment_login_attempts', { username });
        await this.logAuthAttempt(user.id, 'login_failed', false, { username, reason: 'invalid_password' });
        throw new Error('Invalid credentials');
      }
      
      // Update login info
      await supabase.rpc('update_login_info', { user_id: user.id });
      
      // Log successful login
      await this.logAuthAttempt(user.id, 'login_success', true, { username });
      
      return {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      };
      
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  },

  /**
   * Log authentication attempts
   */
  async logAuthAttempt(userId, action, success, details = {}) {
    try {
      await supabase
        .from('auth_audit_log')
        .insert({
          user_id: userId,
          action,
          success,
          details,
          ip_address: details.ip_address || null,
          user_agent: details.user_agent || null
        });
    } catch (error) {
      console.error('Error logging auth attempt:', error);
      // Don't throw - logging failures shouldn't break authentication
    }
  },

  /**
   * Get user by ID (for token verification)
   */
  async getUserById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, role, is_active')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
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
      // Only allow safe fields to be updated
      const allowedFields = ['username'];
      const safeUpdates = {};
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          safeUpdates[key] = value;
        }
      }
      
      if (Object.keys(safeUpdates).length === 0) {
        throw new Error('No valid fields to update');
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(safeUpdates)
        .eq('id', id)
        .select('id, username, role, is_active')
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Get audit logs (admin only)
   */
  async getAuditLogs(filters = {}) {
    try {
      let query = supabase
        .from('auth_audit_log')
        .select(`
          *,
          users!inner(username, role)
        `)
        .order('created_at', { ascending: false });
      
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      
      if (filters.action) {
        query = query.eq('action', filters.action);
      }
      
      if (filters.success !== undefined) {
        query = query.eq('success', filters.success);
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
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
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  },

  /**
   * Verify JWT token
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
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
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }
      
      const user = await TokenManager.verifyToken(token);
      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired token' });
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
  supabase
};
