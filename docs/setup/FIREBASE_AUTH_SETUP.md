# 🔥 Firebase Authentication Setup Guide

This guide will help you implement Firebase Authentication for your wedding website with proper role-based access control.

## 🎯 Overview

The Firebase Authentication system includes:
- **Firebase Auth** for user management
- **Custom claims** for role-based access control
- **JWT tokens** for backend authentication
- **Role-based permissions** (admin, photographer, couple, user)
- **Email/password authentication**
- **User management** with Firebase Admin SDK

## 📋 Prerequisites

1. **Firebase Project** with Authentication enabled
2. **Firebase Admin SDK** service account key
3. **Node.js** environment with required packages
4. **Environment variables** properly configured

## 🚀 Step-by-Step Setup

### Step 1: Firebase Project Configuration

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Select your project** or create a new one
3. **Enable Authentication**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password** provider
   - Save changes

### Step 2: Get Service Account Key

1. **Go to Project Settings** → **Service accounts**
2. **Click "Generate new private key"**
3. **Download the JSON file**
4. **Place it in your backend folder** (e.g., `backend/firebase-service-account.json`)

### Step 3: Environment Configuration

Update your `backend/.env` file:

```env
# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./firebase-service-account.json
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080

# JWT Configuration (for custom tokens)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

Update your `frontend/.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id

# API Configuration
VITE_API_BASE_URL=http://localhost:5000
```

### Step 4: Install Dependencies

```bash
# Backend dependencies
cd backend
npm install firebase-admin jsonwebtoken

# Frontend dependencies
cd ../frontend
npm install firebase
```

### Step 5: Setup Firebase Authentication

```bash
# Run the Firebase auth setup
cd backend
node setup-firebase-auth.js
```

This will:
- ✅ Create default users with roles
- ✅ Test authentication
- ✅ Verify custom claims
- ✅ Set up role-based access

### Step 6: Update Server Configuration

Replace your current server with the Firebase version:

```bash
# Backup current server
mv server.js server-old.js

# Use Firebase auth server
mv server-firebase.js server.js
```

### Step 7: Update Frontend Authentication

1. **Wrap your app with FirebaseAuthProvider** in `main.tsx`:

```tsx
import { FirebaseAuthProvider } from './contexts/FirebaseAuthContext';

// Wrap your app
<FirebaseAuthProvider>
  <App />
</FirebaseAuthProvider>
```

2. **Update login components** to use Firebase Auth
3. **Replace authentication logic** with Firebase methods

### Step 8: Test the System

1. **Start the Firebase auth server**:
   ```bash
   node server.js
   ```

2. **Test authentication**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-token \
     -H "Content-Type: application/json" \
     -d '{"idToken":"your-firebase-id-token"}'
   ```

3. **Test photographer portal**:
   - Go to `http://localhost:8080/photographer-login`
   - Use credentials: `photographer@wedding.com` / `photo123`
   - Should login successfully! 🎉

## 🔒 Security Features

### Firebase Authentication
- **Email/password authentication**
- **Email verification** (auto-enabled for wedding users)
- **Password security** with Firebase's built-in protection
- **User management** with Firebase Admin SDK

### Role-Based Access Control
- **Custom claims** for user roles
- **Role-based permissions** (admin, photographer, couple, user)
- **Protected routes** based on user roles
- **Backend validation** of user roles

### Security Features
- **JWT tokens** for backend authentication
- **Token verification** with Firebase
- **Rate limiting** and security headers
- **CORS configuration** for cross-origin security

## 👥 Default Users Created

The setup script creates these default users:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| **Photographer** | photographer@wedding.com | photo123 | Photo uploads and management |
| **Admin** | admin@wedding.com | admin123 | User management and admin tasks |
| **Couple** | couple@wedding.com | couple123 | Couple's personal portal |

## 📊 User Management

### View Users in Firebase Console
1. Go to **Firebase Console** → **Authentication** → **Users**
2. See all registered users
3. View custom claims and roles
4. Manage user accounts

### Backend User Management
```bash
# List all users
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer your-firebase-id-token"

# Update user role (admin only)
curl -X POST http://localhost:5000/api/auth/update-role \
  -H "Authorization: Bearer your-firebase-id-token" \
  -H "Content-Type: application/json" \
  -d '{"uid":"user-uid","role":"photographer"}'
```

## 🛡️ Production Security Checklist

### Before Going Live:
- [ ] Change default passwords
- [ ] Update JWT_SECRET to strong random value
- [ ] Set CORS_ORIGIN to your domain
- [ ] Enable HTTPS only
- [ ] Configure Firebase Auth settings
- [ ] Set up monitoring alerts
- [ ] Review user permissions
- [ ] Test all authentication flows

### Security Best Practices:
- [ ] Use strong, unique passwords
- [ ] Enable email verification
- [ ] Regular security audits
- [ ] Monitor for suspicious activity
- [ ] Keep Firebase SDK updated
- [ ] Use environment variables for secrets

## 🔧 Troubleshooting

### Common Issues:

**1. "Firebase service account key not found" error**
```bash
# Check your .env file has FIREBASE_SERVICE_ACCOUNT_KEY_PATH
echo $FIREBASE_SERVICE_ACCOUNT_KEY_PATH
```

**2. "Firebase project not found" error**
```bash
# Check Firebase project ID in service account JSON
# Verify project is active in Firebase Console
```

**3. "Invalid Firebase ID token" error**
```bash
# Check Firebase configuration in frontend
# Verify Firebase project settings
```

**4. "User role not found" error**
```bash
# Check custom claims are set correctly
# Verify user has proper role assigned
```

### Debug Commands:

```bash
# Test Firebase connection
node -e "const {admin} = require('./lib/firebase-auth'); console.log('Connected:', !!admin);"

# Check authentication
node setup-firebase-auth.js

# View Firebase logs
# Check Firebase Console → Authentication → Users
```

## 📞 Support

If you encounter issues:

1. **Check Firebase Console** for user status
2. **Verify environment variables** are correct
3. **Test Firebase connection** with setup script
4. **Check custom claims** in Firebase Console
5. **Review authentication logs** in Firebase

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ **Firebase Authentication** working
- ✅ **Role-based access control**
- ✅ **User management** capabilities
- ✅ **Secure authentication** flow
- ✅ **Production-ready** system

Your wedding website now uses Firebase Authentication! 🔥✨

## 🔄 Migration from Supabase Auth

If you're migrating from Supabase Auth:

1. **Export users** from Supabase (if needed)
2. **Create equivalent users** in Firebase
3. **Update frontend** authentication logic
4. **Test all authentication flows**
5. **Update API calls** to use Firebase tokens

The Firebase system provides better integration with your existing Firebase setup and more robust user management features.
