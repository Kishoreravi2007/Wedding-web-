# Render Environment Variables Setup

## 📋 Copy-Paste These to Render

Go to your Render service → **Environment** tab → Click **Add Environment Variable**

### Method 1: Manual Entry (Recommended)

Add these one by one:

```
Key: FIREBASE_SERVICE_ACCOUNT_KEY
Value: <paste entire JSON content from backend/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json>
```

```
Key: SUPABASE_URL
Value: <your Supabase project URL>
```

```
Key: SUPABASE_ANON_KEY
Value: <your Supabase anonymous key>
```

```
Key: PORT
Value: 5001
```

```
Key: FRONTEND_URL
Value: <your deployed frontend URL, e.g., https://your-site.netlify.app>
```

```
Key: BACKEND_URL
Value: <your Render backend URL, e.g., https://your-backend.onrender.com>
```

---

## 🔑 Where to Find Your Credentials

### 1. Firebase Service Account JSON
**Location**: `backend/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json`

**How to copy**:
```bash
# On Windows (PowerShell)
Get-Content backend\weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json | Set-Clipboard

# On Mac/Linux
cat backend/weddingweb-9421e-firebase-adminsdk-fbsvc-184b677d23.json | pbcopy
```

Or simply open the file and copy all content (Ctrl+A, Ctrl+C)

### 2. Supabase Credentials
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `SUPABASE_URL`
   - **anon/public key** → Use for `SUPABASE_ANON_KEY`

### 3. Backend URL (on Render)
1. Deploy your backend first
2. Render will give you a URL like: `https://wedding-backend-xyz.onrender.com`
3. Copy this URL → Use for `BACKEND_URL`

### 4. Frontend URL
- If deploying to Netlify: `https://your-site.netlify.app`
- If deploying to Vercel: `https://your-site.vercel.app`
- If using custom domain: `https://yourdomain.com`

---

## ⚙️ Method 2: Using .env File Upload (Easier)

Create a file named `render.env` with this content:

```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"weddingweb-9421e","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
PORT=5001
BACKEND_URL=https://your-backend.onrender.com
FRONTEND_URL=https://your-frontend.netlify.app
```

**Important**: 
- Replace all placeholder values with actual credentials
- The `FIREBASE_SERVICE_ACCOUNT_KEY` must be on ONE line with NO line breaks
- Use your actual Supabase and URL values

Then in Render:
1. Go to Environment tab
2. Click **Add from .env**
3. Paste the entire content
4. Click **Add Variables**

---

## 🧪 Verify Setup

After adding environment variables and deploying:

### Check Logs
Look for these success messages:
```
✅ Loaded Firebase service account from FIREBASE_SERVICE_ACCOUNT_KEY
✅ Backend server running on http://localhost:5001
```

### Test Endpoints
1. Root: `https://your-backend.onrender.com/`
   - Should show: "Backend is running!"

2. Photos: `https://your-backend.onrender.com/api/photos-local`
   - Should return JSON with photos array

---

## ⚠️ Security Notes

1. **Never commit** `.env` files to Git
2. **Never share** your Firebase service account key publicly
3. **Never expose** your Supabase service role key (only use anon key in frontend)
4. Use Render's **secret** variables (🔒 icon) for sensitive data

---

## 🚀 Quick Deploy Checklist

- [ ] Copy Firebase service account JSON content
- [ ] Get Supabase URL and anon key
- [ ] Add all environment variables to Render
- [ ] Deploy backend on Render
- [ ] Copy backend URL from Render
- [ ] Update `BACKEND_URL` variable with actual URL
- [ ] Redeploy if needed
- [ ] Check logs for success messages
- [ ] Test backend endpoints
- [ ] Deploy frontend with correct `VITE_API_BASE_URL`

---

## 🆘 Troubleshooting

### Error: "Error parsing FIREBASE_SERVICE_ACCOUNT_KEY"
✅ **Fix**: Ensure JSON is valid and properly formatted
- Use https://jsonlint.com/ to validate
- Make sure all line breaks in private key are `\n` (not actual line breaks)

### Error: "Neither FIREBASE_SERVICE_ACCOUNT_KEY nor FIREBASE_SERVICE_ACCOUNT_KEY_PATH is set"
✅ **Fix**: You didn't add the environment variable
- Go to Render → Environment → Add the variable

### Deployment works but photos don't upload
✅ **Fix**: Check SUPABASE_URL and SUPABASE_ANON_KEY are correct
- Verify in Supabase dashboard
- Check Render logs for connection errors

---

Done! Your backend should deploy successfully now. 🎉

