# 🔐 Secure Authentication Setup Guide

This guide will help you implement proper authentication policies for your wedding website with enterprise-grade security.

## 🎯 Overview

The secure authentication system includes:
- **Row Level Security (RLS)** policies in Supabase
- **JWT token authentication** with proper validation
- **Password hashing** with bcrypt (12 rounds)
- **Login attempt tracking** and account lockout
- **Comprehensive audit logging**
- **Rate limiting** and security headers
- **Role-based access control**

## 📋 Prerequisites

1. **Supabase Project** with service role key
2. **Node.js** environment with required packages
3. **Environment variables** properly configured

## 🚀 Step-by-Step Setup

### Step 1: Environment Configuration

Create or update your `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=http://localhost:8080

# Firebase Configuration (for wishes)
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./your-service-account.json
FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
```

### Step 2: Run Database Migrations

1. **Open Supabase Dashboard**: Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. **Navigate to SQL Editor**
3. **Run the secure policies migration**:

```sql
-- Copy and paste the entire content of:
-- backend/supabase/migrations/003_secure_auth_policies.sql
```

This migration will:
- ✅ Create secure RLS policies
- ✅ Add audit logging tables
- ✅ Create security functions
- ✅ Set up proper permissions
- ✅ Add performance indexes

### Step 3: Install Dependencies

```bash
cd backend
npm install bcryptjs jsonwebtoken @supabase/supabase-js
```

### Step 4: Setup Secure Authentication

```bash
# Run the secure authentication setup
node setup-secure-auth.js
```

This will:
- ✅ Create the photographer user
- ✅ Test authentication
- ✅ Verify JWT tokens
- ✅ Check audit logging

### Step 5: Update Server Configuration

Replace your current server with the secure version:

```bash
# Backup current server
mv server.js server-old.js

# Use secure server
mv server-secure.js server.js
```

### Step 6: Test the System

1. **Start the secure server**:
   ```bash
   node server.js
   ```

2. **Test authentication**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"photographer","password":"photo123"}'
   ```

3. **Test photographer portal**:
   - Go to `http://localhost:8080/photographer-login`
   - Use credentials: `photographer` / `photo123`
   - Should login successfully! 🎉

## 🔒 Security Features

### Row Level Security (RLS)
- **Users table**: Only service role can create users
- **Users can only access their own data**
- **Audit logs**: Only service role can access
- **Photos**: Authenticated users only

### Authentication Security
- **Password hashing**: bcrypt with 12 rounds
- **JWT tokens**: Signed with secret key
- **Token expiration**: Configurable (default 7 days)
- **Account lockout**: After 5 failed attempts
- **Login tracking**: All attempts logged

### Audit Logging
- **All authentication events** logged
- **IP addresses** and user agents tracked
- **Success/failure** status recorded
- **Timestamps** for all events
- **Admin access** to audit logs

### Rate Limiting
- **100 requests per 15 minutes** per IP
- **Automatic blocking** of excessive requests
- **Configurable limits** in server code

## 📊 Monitoring & Maintenance

### View Audit Logs
```sql
-- In Supabase SQL Editor
SELECT 
  u.username,
  al.action,
  al.success,
  al.created_at,
  al.ip_address
FROM auth_audit_log al
JOIN users u ON al.user_id = u.id
ORDER BY al.created_at DESC
LIMIT 50;
```

### Check User Status
```sql
-- Check user accounts
SELECT username, role, is_active, last_login, login_attempts
FROM users
ORDER BY created_at DESC;
```

### Security Monitoring
- **Monitor failed login attempts**
- **Check for locked accounts**
- **Review audit logs regularly**
- **Update JWT secrets periodically**

## 🛡️ Production Security Checklist

### Before Going Live:
- [ ] Change default passwords
- [ ] Update JWT_SECRET to strong random value
- [ ] Set CORS_ORIGIN to your domain
- [ ] Enable HTTPS only
- [ ] Review and test all RLS policies
- [ ] Set up monitoring alerts
- [ ] Backup database regularly
- [ ] Update dependencies

### Security Best Practices:
- [ ] Use strong, unique passwords
- [ ] Enable 2FA for admin accounts
- [ ] Regular security audits
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets

## 🔧 Troubleshooting

### Common Issues:

**1. "Service role key required" error**
```bash
# Check your .env file has SUPABASE_SERVICE_ROLE_KEY
echo $SUPABASE_SERVICE_ROLE_KEY
```

**2. "RLS policy violation" error**
```bash
# Run the migration in Supabase dashboard
# Make sure all policies are created
```

**3. "Invalid token" error**
```bash
# Check JWT_SECRET is set correctly
# Verify token hasn't expired
```

**4. "Rate limit exceeded" error**
```bash
# Wait 15 minutes or restart server
# Check rate limiting configuration
```

### Debug Commands:

```bash
# Test database connection
node -e "const {supabaseService} = require('./lib/secure-auth'); console.log('Connected:', !!supabaseService);"

# Check authentication
node setup-secure-auth.js

# View server logs
tail -f logs/server.log
```

## 📞 Support

If you encounter issues:

1. **Check the logs** in Supabase dashboard
2. **Verify environment variables** are correct
3. **Test database connection** with setup script
4. **Review RLS policies** in Supabase
5. **Check audit logs** for error details

## 🎉 Success!

Once setup is complete, you'll have:
- ✅ **Enterprise-grade security**
- ✅ **Proper authentication**
- ✅ **Audit logging**
- ✅ **Role-based access**
- ✅ **Rate limiting**
- ✅ **Production-ready system**

Your wedding website is now secure and ready for production! 🔐✨
