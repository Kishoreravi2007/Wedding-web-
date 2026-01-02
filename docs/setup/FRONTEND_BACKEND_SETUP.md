# Frontend/Backend Setup Explanation

## Current Setup

Your backend server (`server.js`) is configured to **serve the frontend** from `backend/build/` directory. This is why you see the frontend on `localhost:5001` (the backend port).

### How It Works

```javascript
// backend/server.js (lines 57-60)
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));  // Serves frontend from backend/build/

// Fallback for SPA routing (lines 312-318)
if (req.method === 'GET' && !hasFileExtension) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
}
```

This is a **production setup** where:
- Backend serves both API (`/api/*`) and frontend (everything else)
- Frontend is pre-built and served as static files
- Single port (5001) for everything

## Development vs Production

### Option 1: Development Mode (Recommended for Development)

Run frontend and backend separately:

```bash
# Terminal 1: Backend (port 5001)
cd backend
npm start

# Terminal 2: Frontend Dev Server (port 5173)
cd frontend
npm run dev
```

Then access:
- **Frontend:** `http://localhost:5173` (Vite dev server with hot reload)
- **Backend API:** `http://localhost:5001/api/*`

**Benefits:**
- ✅ Hot module replacement (instant updates)
- ✅ Better error messages
- ✅ Faster development
- ✅ Separate ports for clarity

### Option 2: Production Mode (Current Setup)

Build frontend and serve from backend:

```bash
# Build frontend
cd frontend
npm run build

# Copy build to backend
cp -r dist/* ../backend/build/

# Start backend (serves frontend)
cd ../backend
npm start
```

Then access:
- **Everything:** `http://localhost:5001` (backend serves frontend + API)

**Benefits:**
- ✅ Single port
- ✅ Simulates production environment
- ✅ No CORS issues

## Which Should You Use?

### For Development:
Use **Option 1** (separate servers) for faster development with hot reload.

### For Testing Production:
Use **Option 2** (backend serves frontend) to test the production setup.

## Current Status

Based on your setup:
- ✅ Backend is running on `localhost:5001`
- ✅ Backend is serving frontend from `backend/build/`
- ⚠️ This is the production setup

If you want development mode:
1. Stop the backend
2. Run `cd frontend && npm run dev` (starts on port 5173)
3. Access frontend at `http://localhost:5173`

## DeepFace API Note

The DeepFace API runs separately on port 8002:
- Backend (Node.js): `localhost:5001`
- Frontend (Vite dev): `localhost:5173` (if running separately)
- DeepFace API (Python): `localhost:8002`

Make sure `VITE_DEEPFACE_API_URL=http://localhost:8002` is in `frontend/.env`

