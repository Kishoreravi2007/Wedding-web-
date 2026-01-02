# Testing Wedding Photos on Other Devices 📱

## ✅ Fix Applied

The backend has been updated to generate photo URLs that work on any device. The issue where photos showed `localhost` URLs has been resolved.

## Your Network Information

**Your Computer's IP Address:** `172.20.10.3`

Use this IP address to access your wedding website from other devices on the same network.

## Quick Start Guide

### Step 1: Ensure Both Servers Are Running

**Backend (Already Running)** ✅
```powershell
# Backend is running on http://localhost:5000
# You can verify with: curl http://localhost:5000
```

**Frontend (Start if not running)**
```powershell
cd frontend
npm run dev
```

The frontend should start on `http://localhost:5173`

### Step 2: Access from Your Computer (Host)

Open your browser and go to:
- **Main site:** http://localhost:5173
- **Sister A Gallery:** http://localhost:5173/parvathy/gallery
- **Sister B Gallery:** http://localhost:5173/subhalakshmi/gallery

Photos should display normally ✅

### Step 3: Access from Other Devices (Phone/Tablet)

**Important:** Make sure the other device is on the same WiFi network!

On your phone or tablet, open the browser and go to:
- **Main site:** http://172.20.10.3:5173
- **Sister A Gallery:** http://172.20.10.3:5173/parvathy/gallery  
- **Sister B Gallery:** http://172.20.10.3:5173/subhalakshmi/gallery

**Photos should now be visible!** 🎉📸

## How the Fix Works

### Before (Broken)
```
Request from phone → Backend returns: http://localhost:5000/uploads/...
Phone tries to access → ❌ Fails (localhost means the phone itself)
```

### After (Fixed)
```
Request from phone (172.20.10.3) → Backend detects host and returns: http://172.20.10.3:5000/uploads/...
Phone tries to access → ✅ Works (correct IP address)
```

The backend now dynamically detects the hostname from each request and generates the correct photo URLs.

## Troubleshooting

### Photos Still Not Showing?

1. **Check Windows Firewall**
   ```powershell
   # Temporarily disable to test (re-enable after testing!)
   netsh advfirewall set allprofiles state off
   
   # Or add a rule for Node.js
   New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow
   ```

2. **Verify Backend is Accessible from Other Device**
   - On your phone's browser, visit: http://172.20.10.3:5000
   - You should see: "Backend is running!"

3. **Check Network Connection**
   - Ensure both devices are on the same WiFi
   - Your IP might change if you reconnect to WiFi
   - Run `ipconfig | Select-String "IPv4"` to check current IP

4. **Clear Browser Cache**
   - On phone: Settings → Clear browsing data
   - Or use incognito/private mode

5. **Check API Base URL in Frontend**
   - If you have `frontend/.env` file, ensure it's set to:
     ```env
     VITE_API_BASE_URL=http://172.20.10.3:5000
     ```
   - OR remove the file to use the default localhost (which will be auto-detected)

### Frontend Not Starting?

```powershell
# Kill any processes using port 5173
Get-Process node | Where-Object {$_.Path -like "*frontend*"} | Stop-Process -Force

# Clear cache and restart
cd frontend
npm run dev
```

### Backend Not Accessible?

```powershell
# Check if backend is running
curl http://localhost:5000 -UseBasicParsing

# Restart if needed
cd backend
npm start
```

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access website on host computer (localhost:5173)
- [ ] Can see photos on host computer
- [ ] Can access website from phone (172.20.10.3:5173)
- [ ] **Can see photos from phone** 📸✅

## Advanced Configuration

### Setting a Static Backend URL

If you want to override the auto-detection, create/edit `backend/.env`:

```env
# Use your computer's IP
BACKEND_URL=http://172.20.10.3:5000

# Or for production
# BACKEND_URL=https://your-backend.onrender.com
```

### Frontend Environment Variables

Create/edit `frontend/.env`:

```env
# Point to your backend
VITE_API_BASE_URL=http://172.20.10.3:5000

# Or for production
# VITE_API_BASE_URL=https://your-backend.onrender.com
```

## Production Deployment

When deploying to production (Netlify, Vercel, Render):

1. Set `BACKEND_URL` in backend environment to your deployed backend URL
2. Set `VITE_API_BASE_URL` in frontend build to your deployed backend URL
3. Ensure CORS is properly configured (already done in `backend/server.js`)

## Files Modified

- ✅ `backend/photos-local.js` - Dynamic hostname detection for photo URLs
- 📄 `PHOTO_ACCESS_FIX.md` - Detailed technical documentation
- 📄 `TEST_PHOTOS_ON_OTHER_DEVICES.md` - This testing guide

## Need Help?

If photos still aren't showing after following these steps:

1. Check the browser console for errors (F12 → Console tab)
2. Check backend logs for the URLs being generated
3. Verify your IP address hasn't changed
4. Test with Windows Firewall temporarily disabled

---

**Status:** ✅ Backend Fix Applied  
**Last Updated:** November 5, 2025  
**Your IP:** 172.20.10.3

