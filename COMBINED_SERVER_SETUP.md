# Combined Server Setup - Frontend + Backend

This document describes the combined server setup where both frontend and backend are served from a single Express server.

## Final Folder Structure

```
Wedding-web-1/
├── backend/
│   ├── server.js          ← Main server file (serves both API + frontend)
│   ├── package.json       ← Updated with build scripts
│   ├── build/            ← Frontend build output (created after npm run build)
│   │   ├── index.html
│   │   ├── assets/
│   │   └── ...
│   ├── lib/
│   ├── routes/
│   └── ...
├── frontend/
│   ├── src/
│   ├── vite.config.ts    ← Updated to output to ../backend/build
│   ├── package.json
│   └── ...
└── ...
```

## Key Changes Made

### 1. Backend Server (`backend/server.js`)

**Added static file serving:**
```javascript
// Serve static frontend files from build directory
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));
```

**Added catch-all route for SPA routing:**
```javascript
// Catch-all handler: serve React app for all non-API routes
// This must be last, after all API routes
app.get('*', (req, res) => {
  // Skip API routes - they should have been handled above
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve index.html for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, 'build', 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      res.status(500).send('Frontend build not found. Please run: npm run build');
    }
  });
});
```

**Updated CORS configuration:**
- Now handles same-origin requests (frontend served from same server)
- Still allows external origins for API access if needed

### 2. Frontend Vite Config (`frontend/vite.config.ts`)

**Updated build output:**
```typescript
build: {
  outDir: '../backend/build', // Output directly to backend/build directory
  emptyOutDir: true, // Clear the build directory before building
  // ...
}
```

**Updated API base URL:**
- Defaults to empty string (relative URLs) when served from same server
- Can be overridden with `VITE_API_BASE_URL` environment variable

### 3. Frontend API Configuration (`frontend/src/lib/api.ts`)

**Updated to support relative URLs:**
- Uses empty string for same-origin requests
- Falls back to `http://localhost:5001` for development if needed

### 4. Backend Package.json (`backend/package.json`)

**Added build scripts:**
```json
{
  "scripts": {
    "build": "cd ../frontend && npm install && npm run build",
    "build:frontend": "cd ../frontend && npm run build",
    "start": "node server.js",
    "build:start": "npm run build && npm start"
  }
}
```

## Steps to Run

### First Time Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

3. **Build the frontend:**
   ```bash
   cd ../backend
   npm run build
   ```
   This will:
   - Install frontend dependencies (if needed)
   - Build the frontend
   - Output to `backend/build/`

### Running the Server

**Option 1: Build and start separately**
```bash
cd backend
npm run build    # Build frontend
npm start        # Start server
```

**Option 2: Build and start in one command**
```bash
cd backend
npm run build:start
```

**Option 3: Just start (if already built)**
```bash
cd backend
npm start
```

### Access the Application

- **Frontend UI:** http://localhost:5001
- **Backend API:** http://localhost:5001/api/*
- **All routes work from:** http://localhost:5001

## How It Works

1. **API Routes:** All routes starting with `/api/*` are handled by Express API routes
2. **Static Files:** Files in `backend/build/` are served as static assets
3. **SPA Routing:** All other routes serve `index.html` (React Router handles client-side routing)
4. **CORS:** Configured to allow same-origin requests (no CORS issues)

## Important Notes

- The frontend build is automatically placed in `backend/build/` when you run `npm run build` from the backend directory
- The server serves the frontend on the same port (5001) as the API
- No separate frontend server needed
- CORS is configured but not needed for same-origin requests
- API calls from frontend use relative URLs (no need to specify full backend URL)

## Troubleshooting

**Frontend not loading:**
- Make sure you've run `npm run build` from the backend directory
- Check that `backend/build/index.html` exists

**API calls failing:**
- Check that API routes are defined before the catch-all route in `server.js`
- Verify CORS configuration if accessing from external origins

**Build errors:**
- Make sure frontend dependencies are installed: `cd frontend && npm install`
- Check that `vite.config.ts` has correct output path

## Environment Variables

The following environment variables can be set:

- `VITE_API_BASE_URL`: Override API base URL (empty string = same origin)
- `PORT`: Backend server port (default: 5001)
- `FRONTEND_URL`: External frontend URL for CORS (if needed)

