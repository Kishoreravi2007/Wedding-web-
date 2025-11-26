const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('./lib/supabase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

/**
 * Helper: Lookup a user by either username or email
 */
const findUserByField = async (field, value) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, password, role, email')
    .eq(field, value)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

router.post('/login', async (req, res) => {
  try {
    const identifier = (req.body.identifier || req.body.email || req.body.username || '').trim();
    const password = req.body.password;
    
    console.log('🔐 Login attempt for identifier:', identifier);
    
    if (!identifier || !password) {
      return res.status(400).json({ 
        message: 'Email/username and password are required' 
      });
    }
    
    let user = await findUserByField('username', identifier);
    if (!user) {
      user = await findUserByField('email', identifier);
    }

    if (!user) {
      console.log('❌ User not found:', identifier);
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    console.log('✅ User found:', user.username, '| Role:', user.role);
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', identifier);
      return res.status(401).json({ 
        message: 'Invalid credentials' 
      });
    }
    
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.cookie('weddingweb_token', token, cookieOptions);
    
    console.log('✅ Login successful for:', identifier);
    
    res.json({
      message: 'Login successful',
      accessToken: token,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email || null
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role = 'user', email } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password: hashedPassword,
          role,
          email: email || null
        }
      ])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.id,
        username: data.username,
        role: data.role
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
 * Middleware for authentication
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = {
  router,
  authenticateToken
};

