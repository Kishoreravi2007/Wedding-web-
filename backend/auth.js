const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('./server'); // Import the Supabase client
const UserDB = require('./lib/user-db')(supabase); // Initialize UserDB with the Supabase client

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Invalid token
    req.user = user;
    next();
  });
};

// Register a new user
router.post('/register', async (req, res) => {
  const { username, password, role } = req.body; // role can be 'admin', 'couple', 'photographer'

  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password, and role are required.' });
  }

  try {
    const existingUser = await UserDB.findByUsername(username);

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserDB.create({
      username,
      password: hashedPassword,
      role,
    });
    res.status(201).json({ id: newUser.id, username, role });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Fallback authentication for photographer (temporary solution)
    if (username === 'photographer' && password === 'photo123') {
      const accessToken = jwt.sign({ 
        id: 'photographer-1', 
        username: 'photographer', 
        role: 'photographer' 
      }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      console.log('✅ Photographer logged in successfully (fallback auth)');
      return res.json({ accessToken, role: 'photographer' });
    }
    
    // Try database authentication
    const user = await UserDB.findByUsername(username);

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const accessToken = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ accessToken, role: user.role });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in.' });
  }
});

// Password reset endpoint (for administrative use or a simplified flow)
router.post('/reset-password', async (req, res) => {
  const { username, newPassword } = req.body;

  if (!username || !newPassword) {
    return res.status(400).json({ message: 'Username and new password are required.' });
  }

  try {
    const user = await UserDB.findByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserDB.update(user.id, { password: hashedPassword });

    res.status(200).json({ message: 'Password reset successfully.' });

  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Error resetting password.' });
  }
});

module.exports = { router, authenticateToken };
