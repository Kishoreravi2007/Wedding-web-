/**
 * Users Management API
 * Admin-only endpoints for managing users
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { supabase } = require('./server');
const UserDB = require('./lib/user-db')(supabase);

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// GET all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await UserDB.findAll();
    // Don't send passwords
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      role: user.role,
      is_active: user.is_active !== false, // Default to true if undefined
      created_at: user.created_at
    }));
    res.json(sanitizedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
});

// GET single user (admin only)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await UserDB.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    // Don't send password
    const sanitizedUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      is_active: user.is_active !== false,
      created_at: user.created_at
    };
    res.json(sanitizedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user.' });
  }
});

// PATCH update user (admin only)
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { username, role, is_active, password } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await UserDB.update(req.params.id, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Don't send password
    const sanitizedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      role: updatedUser.role,
      is_active: updatedUser.is_active !== false,
      created_at: updatedUser.created_at
    };
    
    res.json({ message: 'User updated successfully', user: sanitizedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.' });
  }
});

// DELETE user (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account.' });
    }

    const result = await UserDB.delete(req.params.id);
    
    if (!result) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.' });
  }
});

module.exports = router;

