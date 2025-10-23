# ✅ Wedding Website Deployment Checklist

Use this checklist to ensure a successful deployment without blank screens or errors.

## Pre-Deployment Setup

### 1. Backend Configuration
- [ ] Backend is deployed and accessible (test the URL)
- [ ] Backend `.env` file configured with:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `JWT_SECRET`
  - [ ] `FIREBASE_SERVICE_ACCOUNT_KEY_PATH`
  - [ ] `CORS_ORIGIN` includes your frontend URL
- [ ] Backend is responding to health checks
- [ ] Backend URL noted (e.g., `https://wedding-backend.onrender.com`)

### 2. Frontend Configuration
- [ ] Created `frontend/.env` file (not committed to git)
- [ ] Set `VITE_API_BASE_URL` to deployed backend URL (NOT localhost)
- [ ] Set Firebase credentials:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] Set Supabase credentials:
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] Feature flags configured as needed

### 3. Test Locally
```bash
cd frontend
npm install
npm run build
npm run preview
```
- [ ] Build completes without errors
- [ ] Preview shows the website correctly (http://localhost:4173)
- [ ] No console errors in browser
- [ ] All pages load correctly
- [ ] API calls work (check Network tab)

## Deployment Steps

### Option A: Deploy to Netlify
1. [ ] Push code to GitHub
2. [ ] Go to [Netlify](https://netlify.com)
3. [ ] Click "Add new site" → "Import existing project"
4. [ ] Connect to GitHub and select repository
5. [ ] Configure build settings:
   - Base directory: `frontend`
   - Build command: `npm install && npm run build`
   - Publish directory: `frontend/dist`
6. [ ] Add environment variables in Netlify dashboard
7. [ ] Deploy site
8. [ ] Test deployed URL

### Option B: Deploy to Vercel
1. [ ] Push code to GitHub
2. [ ] Go to [Vercel](https://vercel.com)
3. [ ] Click "Add New" → "Project"
4. [ ] Import your GitHub repository
5. [ ] Configure project:
   - Framework: Vite
   - Root Directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
6. [ ] Add environment variables in Vercel dashboard
7. [ ] Deploy
8. [ ] Test deployed URL

### Option C: Deploy to Render (Static Site)
1. [ ] Push code to GitHub
2. [ ] Go to [Render](https://render.com)
3. [ ] Click "New" → "Static Site"
4. [ ] Connect to GitHub repository
5. [ ] Configure:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
6. [ ] Add environment variables
7. [ ] Create Static Site
8. [ ] Test deployed URL

## Post-Deployment Verification

### Basic Functionality
- [ ] Website loads (no blank screen!)
- [ ] Navigation works
- [ ] Images load correctly
- [ ] Music player works
- [ ] Language switcher works

### Pages Check
- [ ] Home page loads
- [ ] Parvathy's pages load
- [ ] Sreedevi's pages load
- [ ] Wishes page works
- [ ] Photo gallery works
- [ ] Admin login accessible
- [ ] Photographer portal accessible
- [ ] Couple dashboard accessible

### Browser Console Check (F12)
- [ ] No critical errors (some warnings are okay)
- [ ] API calls succeeding (check Network tab)
- [ ] No CORS errors
- [ ] No "Failed to fetch" errors

### API Integration
- [ ] Wishes can be submitted
- [ ] Photos can be uploaded (photographer portal)
- [ ] Photos display in gallery
- [ ] Face recognition works (if enabled)

### Mobile Testing
- [ ] Website works on mobile browsers
- [ ] Layout is responsive
- [ ] Touch interactions work
- [ ] Images load on mobile data

## Troubleshooting

### Blank Screen After Deployment?
See: [DEPLOYMENT_BLANK_SCREEN_FIX.md](./DEPLOYMENT_BLANK_SCREEN_FIX.md)

### Common Issues

**Issue: API calls fail**
- Check: `VITE_API_BASE_URL` is set to deployed backend (not localhost)
- Check: Backend is running and accessible
- Check: CORS is configured correctly on backend

**Issue: Firebase errors**
- Check: All Firebase credentials are correct
- Check: Firebase project is active
- Check: Firebase rules allow read/write

**Issue: Supabase errors**
- Check: Supabase URL and anon key are correct
- Check: Supabase RLS policies are configured
- Check: Tables exist in database

**Issue: 404 on page refresh**
- Check: `_redirects` file exists in `frontend/public/`
- Check: Hosting platform is configured for SPA routing

**Issue: Assets not loading**
- Check: `vite.config.ts` base path is set to `/`
- Check: Images are in `frontend/public/` folder
- Check: Build output includes all assets

## Environment Variables Quick Reference

### Backend (.env)
```
PORT=5000
NODE_ENV=production
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
JWT_SECRET=xxx
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=./path-to-firebase-json
FIREBASE_STORAGE_BUCKET=xxx.appspot.com
CORS_ORIGIN=https://your-frontend-url.com
```

### Frontend (.env)
```
VITE_API_BASE_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_ENABLE_FACE_RECOGNITION=true
VITE_ENABLE_AUTO_FACE_DETECTION=true
```

## Final Checks Before Going Live

- [ ] Test website on multiple devices
- [ ] Test all user flows (guest, photographer, admin)
- [ ] Verify photo upload works
- [ ] Verify wishes submission works
- [ ] Check page load times
- [ ] Test with friends/family before sharing widely
- [ ] Have backup plan (keep old site running if updating)

## Support

If issues persist after following this checklist:
1. Check browser console for specific errors
2. Check hosting platform logs
3. Check backend logs
4. Review [DEPLOYMENT_BLANK_SCREEN_FIX.md](./DEPLOYMENT_BLANK_SCREEN_FIX.md)
5. Email: help.weddingweb@gmail.com

---

**Remember**: The most common issue is `VITE_API_BASE_URL` pointing to localhost instead of your deployed backend URL!

Good luck with your deployment! 🎉

