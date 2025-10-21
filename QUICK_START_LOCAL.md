# 🚀 Quick Start - Local Development

## Option 1: Use the Startup Script (EASIEST)

**Just double-click this file:**
```
start-servers.ps1
```

If Windows blocks it, right-click → "Run with PowerShell"

This will:
- ✅ Start backend server (port 5000)
- ✅ Start frontend server (port 8080)
- ✅ Open your browser automatically

---

## Option 2: Manual Start (if script doesn't work)

### Terminal 1 - Backend:
```powershell
cd backend
npm start
```

### Terminal 2 - Frontend (open a new terminal):
```powershell
cd frontend
npm run dev
```

### Then open browser:
```
http://localhost:8080
```

---

## ⚠️ Troubleshooting

### "npm not found" or similar errors:
Make sure you're in the correct directory:
- For backend commands: Must be in `backend` folder
- For frontend commands: Must be in `frontend` folder

### Port already in use:
Close any running servers first, then restart.

### Can't access website:
1. Check if servers are running (you should see output in the terminal windows)
2. Make sure you're going to `http://localhost:8080` (not 5000)
3. Check browser console (F12) for errors

---

## 🌐 Ready to Deploy for Real?

Follow these guides:
1. **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Complete step-by-step guide
2. **[DEPLOYMENT_BLANK_SCREEN_FIX.md](./DEPLOYMENT_BLANK_SCREEN_FIX.md)** - Fix common issues  
3. **[BLANK_SCREEN_FIX_SUMMARY.md](./BLANK_SCREEN_FIX_SUMMARY.md)** - Quick summary

### Key Points for Deployment:
- ✅ Create `frontend/.env` file with your actual credentials
- ✅ Set `VITE_API_BASE_URL` to your deployed backend URL (NOT localhost!)
- ✅ Add environment variables to your hosting platform (Netlify/Vercel/Render)
- ✅ Build and deploy!

Need help? Check the guides above!

