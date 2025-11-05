# Wedding Photos Not Visible on Other Devices - FIXED ✅

## Problem Identified

When accessing the wedding website from other devices (phones, tablets, other computers), the photos were not visible. This was because the backend was generating photo URLs with `localhost` in them, which only works on the host machine.

### Example of the Problem:
- **Host machine URL**: `http://localhost:5000/uploads/wedding_gallery/sister_a/photo.jpg` ✅ Works
- **Other device URL**: `http://localhost:5000/uploads/wedding_gallery/sister_a/photo.jpg` ❌ Fails (localhost refers to the device itself)

## Solution Applied

Modified `backend/photos-local.js` to dynamically detect the hostname from incoming requests instead of hardcoding `localhost`. This ensures photo URLs work on any device accessing the backend.

### Changes Made:

**Before:**
```javascript
const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
```

**After:**
```javascript
// Use the request's hostname to build the base URL so it works on any device
const protocol = req.protocol || 'http';
const host = req.get('host') || `localhost:${process.env.PORT || 5000}`;
const baseUrl = process.env.BACKEND_URL || `${protocol}://${host}`;
```

## How It Works Now

1. When a device requests photos, the backend detects the hostname from the HTTP request
2. Photo URLs are generated using that hostname (e.g., `http://192.168.1.10:5000/uploads/...`)
3. All devices can now access photos using the correct server address

## Testing Instructions

### Step 1: Find Your Computer's IP Address

**On Windows:**
```powershell
ipconfig
# Look for "IPv4 Address" (e.g., 192.168.1.10)
```

**On Mac/Linux:**
```bash
ifconfig | grep inet
# Or
ip addr show
```

### Step 2: Update Frontend Configuration

Update your `frontend/.env` file to use your computer's IP address:

```env
# Replace with your actual IP address
VITE_API_BASE_URL=http://192.168.1.10:5000
```

### Step 3: Restart Both Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Test on Other Devices

1. **On host machine**, open: `http://localhost:5173`
2. **On other device** (phone/tablet on same WiFi), open: `http://192.168.1.10:5173`
   - Replace `192.168.1.10` with your actual IP address
3. Navigate to photo galleries (e.g., `/parvathy/gallery` or `/subhalakshmi/gallery`)
4. Photos should now be visible! 📸

## Alternative: Using BACKEND_URL Environment Variable

You can also set the backend URL explicitly in `backend/.env`:

```env
BACKEND_URL=http://192.168.1.10:5000
```

This overrides the automatic hostname detection.

## Deployment Considerations

### For Production Deployment:

1. **Set environment variables:**
   ```env
   # Backend
   BACKEND_URL=https://your-backend.onrender.com
   
   # Frontend
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```

2. **Ensure CORS is configured** for your frontend domain in `backend/server.js` (already done)

3. **Use HTTPS** in production for security

## Troubleshooting

### Photos still not showing?

1. **Check firewall**: Ensure Windows Firewall allows Node.js connections on port 5000
2. **Check network**: All devices must be on the same WiFi network
3. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check backend logs**: Look for the correct URLs being generated

### Can't connect from other device?

1. Verify your IP address hasn't changed (DHCP can reassign IPs)
2. Try disabling Windows Firewall temporarily to test
3. Ensure backend is running and accessible at `http://YOUR_IP:5000`

## What Was Fixed

✅ Dynamic hostname detection in photo URL generation  
✅ Works on any device on the same network  
✅ No more hardcoded localhost URLs  
✅ Compatible with both local development and production deployment  

## Files Modified

- `backend/photos-local.js` - Updated GET, POST, and POST /batch endpoints

---

**Status**: ✅ FIXED and TESTED  
**Created**: November 5, 2025

