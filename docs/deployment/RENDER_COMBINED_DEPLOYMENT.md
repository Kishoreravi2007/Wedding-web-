# Render Deployment - Combined Server Setup

## The Issue

Render is trying to deploy the frontend as a separate static site looking for `frontend/dist`, but we've combined everything into one server that serves from `backend/build`.

## Solution: Update Render Configuration

### Option 1: Use render.yaml (Recommended)

The `render.yaml` file has been updated to deploy only the combined backend service. 

**Steps:**

1. **Delete the old frontend static site service** (if it exists):
   - Go to Render Dashboard
   - Find the "wedding-frontend" static site service
   - Delete it (we don't need it anymore)

2. **Update the backend service** to use the new build command:
   - Go to your backend service in Render Dashboard
   - Go to **Settings** → **Build & Deploy**
   - Update **Build Command** to:
     ```
     cd frontend && npm install && cd ../backend && npm install && npm run build
     ```
   - Make sure **Start Command** is:
     ```
     cd backend && npm start
     ```
   - Save changes

3. **Redeploy:**
   - Go to **Events** tab
   - Click **Manual Deploy** → **Deploy latest commit**

### Option 2: Manual Dashboard Configuration

If you prefer to configure in the dashboard:

1. **Backend Service Settings:**
   - **Build Command:** `cd frontend && npm install && cd ../backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm start`
   - **Environment:** Node
   - **Root Directory:** (leave empty or set to project root)

2. **Delete Frontend Static Site:**
   - If you have a separate frontend static site service, delete it
   - Everything is now served from the backend

## What Changed

- ✅ Frontend builds to `backend/build/` (not `frontend/dist/`)
- ✅ Backend serves both API (`/api/*`) and frontend (all other routes)
- ✅ Single service deployment (no separate frontend service needed)
- ✅ CORS configured for same-origin requests

## Build Process

The build command does:
1. Install frontend dependencies (`cd frontend && npm install`)
2. Install backend dependencies (`cd ../backend && npm install`)
3. Build frontend (outputs to `backend/build/`)
4. Start server (serves from `backend/build/`)

## Verification

After deployment, test:
- **Frontend:** `https://your-backend.onrender.com/`
- **API:** `https://your-backend.onrender.com/api/...`
- **SPA Routes:** `https://your-backend.onrender.com/any-route` (should serve index.html)

## Troubleshooting

**"Publish directory dist does not exist" error:**
- This means Render is still trying to deploy a static site
- Delete the frontend static site service in Render dashboard
- Make sure only the backend service exists

**Build fails:**
- Check that both frontend and backend have `package.json` files
- Verify the build command in Render dashboard matches the one above
- Check build logs for specific errors

**Frontend not loading:**
- Verify `backend/build/index.html` exists after build
- Check server logs to see if static files are being served
- Make sure the catch-all route is working in `server.js`

