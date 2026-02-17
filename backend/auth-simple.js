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
    console.error('Registration Error:', error);
    res.status(400).json({
      message: error.message || 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/google
 * specific login for Google Auth
 */
router.post('/google', async (req, res) => {
  try {
    const { idToken, user: userInfo } = req.body; // user info from client (optional fallback)

    if (!idToken) {
      return res.status(400).json({ message: 'ID Token required' });
    }

    // Dynamic import to avoid issues if firebase lib has trouble
    const { admin } = require('./lib/firebase');

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyError) {
      console.error('Firebase token verification failed:', verifyError);
      // Fallback: If verification fails (e.g. dev environment clock skew), 
      // check if we have userInfo trusted from client (ONLY FOR DEV/PROTOTYPE)
      // In production, you'd fail here.
      if (process.env.NODE_ENV === 'development' && userInfo && userInfo.email) {
        console.warn('⚠️  Falling back to client-provided info (DEV ONLY)');
        decodedToken = userInfo;
      } else {
        return res.status(401).json({ message: 'Invalid token' });
      }
    }

    const email = decodedToken.email;
    const name = decodedToken.name || decodedToken.picture || 'Google User';

    console.log('🔐 Google Login for:', email);

    // Check if user exists
    let user = await findUserByField('email', email);

    if (!user) {
      console.log('✨ Creating new user for Google login:', email);
      // Create new user
      // Password is random string, they will login via Google
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const username = email; // Use email as username

      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username,
            password: hashedPassword, // Dummy password
            role: 'client', // Default role
            email: email
          }
        ])
        .select()
        .single();

      if (error) {
        // If username exists (handle conflict), try appending random number
        if (error.code === '23505') { // Unique violation
          // Try one more time with random suffix
          const suffix = Math.floor(Math.random() * 1000);
          const { data: retryData, error: retryError } = await supabase
            .from('users')
            .insert([{
              username: `${username}_${suffix}`,
              password: hashedPassword,
              role: 'client',
              email: email
            }])
            .select().single();
          if (retryError) throw retryError;
          user = retryData;
        } else {
          throw error;
        }
      } else {
        user = data;
      }
    }

    // Generate JWT
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

    res.json({
      message: 'Login successful',
      accessToken: token,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ message: 'Google Authentication failed', error: error.message });
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

/**
 * GET /api/auth/client/wedding
 * Get wedding details for the logged-in user
 */
router.get('/client/wedding', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔗 Fetching wedding for user ID: ${userId}`);

    const { data: wedding, error } = await supabase
      .from('weddings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!wedding) {
      console.log(`✨ No wedding found for user ${userId}, returning default template`);
      return res.json({
        success: true,
        wedding: {
          groomName: '',
          brideName: '',
          weddingDate: '',
          weddingTime: '10:00',
          venue: '',
          guestCount: 0,
          showCountdown: true,
          customizations: {},
          theme: 'default'
        }
      });
    }

    // Ensure customizations is an object
    if (!wedding.customizations) wedding.customizations = {};

    // Map to the structure frontend expects if needed (though the query above gets everything)
    // frontend expects groomName, brideName, weddingDate, venue, etc.
    // The table columns are likely groom_name, bride_name, etc.
    // Let's add camelCase mapping for convenience
    const formattedWedding = {
      ...wedding,
      groomName: wedding.groom_name,
      brideName: wedding.bride_name,
      weddingDate: wedding.wedding_date,
      weddingTime: wedding.wedding_time,
      guestCount: wedding.guest_count,
      showCountdown: wedding.show_countdown,
      slug: wedding.wedding_code, // VisualEditor expects slug
    };

    res.json({ success: true, wedding: formattedWedding });
  } catch (error) {
    console.error('❌ Error fetching client wedding:', error);
    res.status(500).json({ message: 'Failed to fetch wedding details', error: error.message });
  }
});

/**
 * PUT /api/auth/client/wedding
 * Update wedding details for the logged-in user
 */
router.put('/client/wedding', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weddingData } = req.body;

    if (!weddingData) {
      return res.status(400).json({ message: 'Wedding data is required' });
    }

    console.log(`💾 Updating wedding for user ID: ${userId}`);

    // Map frontend camelCase to database snake_case
    const dbUpdate = {
      groom_name: weddingData.groomName,
      bride_name: weddingData.brideName,
      wedding_date: weddingData.weddingDate,
      venue: weddingData.venue,
      wedding_time: weddingData.weddingTime,
      guest_count: weddingData.guestCount,
      show_countdown: weddingData.showCountdown,
      theme: weddingData.theme,
      customizations: weddingData.customizations,
      updated_at: new Date().toISOString()
    };

    // Remove undefined values
    Object.keys(dbUpdate).forEach(key => dbUpdate[key] === undefined && delete dbUpdate[key]);

    // Add user_id to ensure it's tracked even on first creation
    dbUpdate.user_id = userId;

    const { data, error } = await supabase
      .from('weddings')
      .upsert(dbUpdate, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Wedding updated successfully', wedding: data });
  } catch (error) {
    console.error('❌ Error updating client wedding:', error);
    res.status(500).json({ message: 'Failed to update wedding details', error: error.message });
  }
});

module.exports = {
  router,
  authenticateToken
};


