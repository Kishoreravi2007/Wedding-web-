# Starting the Wedding Website with Face Detection

## Quick Start

### Terminal 1 - Backend Server

```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/backend
node server.js
```

You should see:
```
📁 Serving static files from: /Users/kishoreravi/Desktop/projects/Wedding-web-1/uploads
📁 Serving backend files from: /Users/kishoreravi/Desktop/projects/Wedding-web-1/backend
✅ Backend server is running on http://localhost:5001
```

### Terminal 2 - Frontend Server

```bash
cd /Users/kishoreravi/Desktop/projects/Wedding-web-1/frontend
npm run dev
```

You should see:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

## Accessing the Application

Once both servers are running:

1. **Main Site**: http://localhost:5173/
2. **Sister A Gallery**: http://localhost:5173/parvathy
3. **Sister B Gallery**: http://localhost:5173/sreedevi
4. **Face Detection Admin**: http://localhost:5173/face-admin

## Testing Face Detection

### Method 1: Admin Panel
1. Navigate to http://localhost:5173/face-admin
2. Go to "Test Recognition" tab
3. Upload a photo with a face
4. Select Sister A or Sister B
5. Click "Find Matches"

### Method 2: Photo Booth
1. Navigate to http://localhost:5173/parvathy/photobooth (Sister A)
   OR http://localhost:5173/sreedevi/photobooth (Sister B)
2. Use the "Find My Photos" section
3. Upload a selfie
4. View matched photos

## Stopping the Servers

Press `Ctrl+C` in each terminal window to stop the servers.

## Troubleshooting

### Backend not starting
- Check if port 5001 is already in use: `lsof -i :5001`
- Kill any existing process: `kill -9 <PID>`
- Check .env file exists in backend/

### Frontend not starting
- Check if port 5173 is in use: `lsof -i :5173`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check if npm is installed: `npm --version`

### Face detection not working
- Verify reference images exist: `ls backend/reference_images/sister_a/`
- Check guest mapping files: `ls backend/guest_mapping_*.json`
- Review backend logs for errors

