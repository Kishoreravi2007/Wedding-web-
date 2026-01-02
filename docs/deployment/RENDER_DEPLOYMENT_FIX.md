# Render Deployment Fix - Firebase Service Account

## Problem Fixed

The deployment was failing with this error:
```
Error: Cannot find module '."/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json"'
```

This happened because:
1. The environment variable had quotes in the value
2. The service account JSON file doesn't exist in the deployed environment
3. The code was trying to `require()` a file that wasn't deployed

## Solution Applied

Updated `backend/server.js` to support **two ways** of loading Firebase credentials:

### Option 1: For Deployment (Recommended)
Use `FIREBASE_SERVICE_ACCOUNT_KEY` with the **entire JSON content** as a string

### Option 2: For Local Development
Use `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` with the file path

---

## 🚀 How to Deploy to Render

### Step 1: Get Your Firebase Service Account JSON

1. Go to your local project
2. Find the file: `backend/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json`
3. Open it and **copy the entire content** (it should look like this):

```json
{
  "type": "service_account",
  "project_id": "weddingweb-9421e",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@weddingweb-9421e.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

### Step 2: Set Environment Variables on Render

Go to your Render dashboard → Your service → Environment:

#### Required Environment Variables:

1. **FIREBASE_SERVICE_ACCOUNT_KEY** (for deployment)
   - Value: Paste the **entire JSON content** from step 1
   - ⚠️ **Important**: Paste it as a single line or use Render's "Add from .env" feature
   - Example: `{"type":"service_account","project_id":"weddingweb-9421e",...}`

2. **SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://your-project.supabase.co`

3. **SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Find it in: Supabase Dashboard → Settings → API

4. **PORT**
   - Value: `5001` (or leave empty, Render will set it automatically)

5. **FRONTEND_URL** (optional)
   - Your deployed frontend URL
   - Example: `https://your-frontend.netlify.app`

6. **BACKEND_URL** (optional but recommended)
   - Your deployed backend URL on Render
   - Example: `https://your-backend.onrender.com`

### Step 3: Deploy

After setting the environment variables:
1. Go to your Render service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or just push to your GitHub repo (auto-deploy)

The server should now start successfully! ✅

---

## 🧪 Testing After Deployment

1. Check the deployment logs - you should see:
   ```
   ✅ Loaded Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY
   ✅ Backend server running on http://localhost:5001
   ```

2. Visit your backend URL (e.g., `https://your-backend.onrender.com`)
   - You should see: "Backend is running!"

3. Test the API endpoint:
   ```
   https://your-backend.onrender.com/api/photos-local
   ```

---

## 🔧 Local Development vs Deployment

### Local (.env file):
```bash
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./backend/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### Render (Environment Variables):
```bash
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.netlify.app
```

---

## ⚠️ Common Issues

### Issue 1: "Error parsing FIREBASE_SERVICE_ACCOUNT_KEY"
- **Cause**: Invalid JSON format
- **Fix**: Make sure you copied the entire JSON content correctly
- **Tip**: Use an online JSON validator to check if it's valid JSON

### Issue 2: "Neither FIREBASE_SERVICE_ACCOUNT_KEY nor FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set"
- **Cause**: Environment variable not set
- **Fix**: Add the `FIREBASE_SERVICE_ACCOUNT_KEY` in Render dashboard

### Issue 3: Quotes in the path error
- **Cause**: Using `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` with quotes
- **Fix**: For deployment, use `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON content) instead

---

## 📝 Changes Made to Code

File: `backend/server.js`

- ✅ Added support for `FIREBASE_SERVICE_ACCOUNT_KEY` (JSON string)
- ✅ Added support for `FIREBASE_SERVICE_ACCOUNT_KEY_PATH` (file path)
- ✅ Automatically removes quotes from file paths
- ✅ Better error messages for troubleshooting
- ✅ Logs which method was used to load credentials

---

## Next Steps

1. **Set the environment variables** on Render (see Step 2 above)
2. **Redeploy** your service
3. **Check the logs** to confirm successful startup
4. **Update your frontend** to use the deployed backend URL

---

## 🎯 Summary

The fix allows you to:
- ✅ Deploy to Render without including the service account file
- ✅ Keep your credentials secure as environment variables
- ✅ Use file paths for local development
- ✅ Use JSON strings for production deployment

Your deployment should now work! 🎉

