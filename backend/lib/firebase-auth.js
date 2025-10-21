/**
 * Firebase Authentication System
 * 
 * This module provides secure authentication using Firebase Auth
 * with custom claims for role-based access control.
 */

const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK
let firebaseApp;
try {
  firebaseApp = admin.app();
} catch (error) {
  // Initialize if not already initialized
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH;
  if (!serviceAccountPath) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set');
  }
  
  const serviceAccount = require(serviceAccountPath);
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id
  });
}

/**
 * Firebase Authentication Helper
 */
const FirebaseAuth = {
  /**
   * Create a custom user with role
   */
  async createUser(userData) {
    try {
      const { email, password, displayName, role = 'user' } = userData;
      
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName,
        emailVerified: true // Auto-verify for wedding website
      });
      
      // Set custom claims for role-based access
      await admin.auth().setCustomUserClaims(userRecord.uid, {
        role: role,
        created_at: new Date().toISOString()
      });
      
      // Log user creation
      console.log(`✅ User created: ${email} with role: ${role}`);
      
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: role,
        emailVerified: userRecord.emailVerified
      };
      
    } catch (error) {
      console.error('Error creating Firebase user:', error);
      throw error;
    }
  },

  /**
   * Verify Firebase ID token
   */
  async verifyToken(idToken) {
    try {
      // Verify the Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Get user record to check if user is still active
      const userRecord = await admin.auth().getUser(decodedToken.uid);
      
      if (userRecord.disabled) {
        throw new Error('User account is disabled');
      }
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        role: decodedToken.role || 'user',
        emailVerified: decodedToken.email_verified
      };
      
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid or expired token');
    }
  },

  /**
   * Generate custom JWT for backend operations
   */
  generateCustomToken(user) {
    const payload = {
      uid: user.uid,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000)
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
  },

  /**
   * Update user role
   */
  async updateUserRole(uid, newRole) {
    try {
      await admin.auth().setCustomUserClaims(uid, {
        role: newRole,
        updated_at: new Date().toISOString()
      });
      
      console.log(`✅ User role updated: ${uid} -> ${newRole}`);
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  },

  /**
   * Get user by UID
   */
  async getUser(uid) {
    try {
      const userRecord = await admin.auth().getUser(uid);
      return {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims
      };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  /**
   * List all users (admin only)
   */
  async listUsers(maxResults = 100) {
    try {
      const listUsersResult = await admin.auth().listUsers(maxResults);
      return listUsersResult.users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        disabled: user.disabled,
        customClaims: user.customClaims,
        creationTime: user.metadata.creationTime
      }));
    } catch (error) {
      console.error('Error listing users:', error);
      throw error;
    }
  },

  /**
   * Disable user account
   */
  async disableUser(uid) {
    try {
      await admin.auth().updateUser(uid, {
        disabled: true
      });
      console.log(`✅ User disabled: ${uid}`);
      return true;
    } catch (error) {
      console.error('Error disabling user:', error);
      throw error;
    }
  },

  /**
   * Enable user account
   */
  async enableUser(uid) {
    try {
      await admin.auth().updateUser(uid, {
        disabled: false
      });
      console.log(`✅ User enabled: ${uid}`);
      return true;
    } catch (error) {
      console.error('Error enabling user:', error);
      throw error;
    }
  },

  /**
   * Delete user account
   */
  async deleteUser(uid) {
    try {
      await admin.auth().deleteUser(uid);
      console.log(`✅ User deleted: ${uid}`);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

/**
 * Middleware for Firebase Authentication
 */
const authMiddleware = {
  /**
   * Verify Firebase ID token
   */
  async verifyFirebaseToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const idToken = authHeader && authHeader.split(' ')[1];
      
      if (!idToken) {
        return res.status(401).json({ message: 'Firebase ID token required' });
      }
      
      const user = await FirebaseAuth.verifyToken(idToken);
      req.user = user;
      next();
    } catch (error) {
      return res.status(403).json({ message: 'Invalid or expired Firebase token' });
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
  },

  /**
   * Admin only access
   */
  requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  }
};

module.exports = {
  FirebaseAuth,
  authMiddleware,
  admin
};
