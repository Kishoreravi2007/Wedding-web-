const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory storage for users (not persistent across server restarts)
const users = [];
let userIdCounter = 1;

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
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: String(userIdCounter++),
      username,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
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
    const user = users.find(user => user.username === username);

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

module.exports = { router, authenticateToken };
