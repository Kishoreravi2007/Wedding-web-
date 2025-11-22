# 📸 Live Event Photo Sync System

Complete documentation for the WeddingWeb Live Photo Sync system.

## 🎯 Overview

The Live Event Photo Sync system enables photographers to connect their cameras (Canon, Nikon, Sony) to a desktop app that automatically uploads photos to WeddingWeb in real-time. Photos appear instantly in the live gallery with WebSocket updates.

## 🏗️ Architecture

### Components

1. **Backend API** (`backend/routes/live-sync.js`)
   - Photo upload endpoint with API key authentication
   - Photo listing endpoint
   - API key management
   - WebSocket server integration

2. **WebSocket Server** (`backend/websocket-server.js`)
   - Real-time photo updates via Socket.IO
   - Event-based subscriptions
   - Supabase Realtime integration

3. **Frontend Components**
   - `LiveGallery.tsx` - Real-time photo gallery
   - `LiveSyncDashboard.tsx` - Photographer configuration UI
   - `useLiveSync.ts` - WebSocket hook

4. **Desktop App** (`desktop-app/`)
   - Electron-based desktop application
   - Hot folder watcher
   - Camera SDK integration (boilerplate)
   - Auto-upload service

## 🚀 Setup

### 1. Database Migration

Run the migration to create required tables:

```bash
# In Supabase SQL Editor, run:
backend/supabase/migrations/010_live_photo_sync.sql
```

This creates:
- `photographer_api_keys` table
- Extends `photos` table with live sync columns
- `live_sync_queue` table (for offline retry)

### 2. Backend Setup

```bash
cd backend
npm install socket.io
npm start
```

The backend will now:
- Serve WebSocket on the same port as HTTP
- Handle live sync API routes at `/api/live/*`
- Emit real-time updates when photos are uploaded

### 3. Frontend Setup

```bash
cd frontend
npm install socket.io-client
npm run dev
```

Access the Live Sync Dashboard:
- Navigate to Photographer Portal
- Click "Live Sync" tab
- Generate API keys
- View live gallery

### 4. Desktop App Setup

```bash
cd desktop-app
npm install
npm run dev  # Development
npm run build  # Production build
```

## 📖 Usage

### For Photographers

1. **Generate API Key**
   - Login to Photographer Portal
   - Go to "Live Sync" tab
   - Click "Generate API Key"
   - Copy the key (shown only once!)

2. **Configure Desktop App**
   - Open WeddingWeb Desktop App
   - Enter API key
   - Select event/sister
   - Choose mode:
     - **Hot Folder**: Watch a folder for new photos
     - **SDK Mode**: Direct camera connection (requires SDK)

3. **Start Syncing**
   - Select folder (if using Hot Folder mode)
   - Click "Start Watching"
   - Photos will upload automatically as they appear

### For Event Viewers

- Photos appear in real-time in the Live Gallery
- WebSocket connection provides instant updates
- No page refresh needed

## 🔌 API Reference

### Upload Photo

```http
POST /api/live/uploadPhoto
Authorization: Bearer <api_key>
Content-Type: multipart/form-data

photo: <file>
eventId: <uuid> (optional)
sister: "sister-a" | "sister-b" (optional)
title: <string> (optional)
description: <string> (optional)
timestamp: <ISO string> (optional)
```

### Get Photos

```http
GET /api/live/photos?eventId=<uuid>&limit=50&offset=0
```

### Generate API Key

```http
POST /api/live/api-keys
Authorization: Bearer <jwt_token>

{
  "photographerId": "<uuid>",
  "keyName": "Desktop App"
}
```

### List API Keys

```http
GET /api/live/api-keys?photographerId=<uuid>
Authorization: Bearer <jwt_token>
```

### Revoke API Key

```http
DELETE /api/live/api-keys/<keyId>?photographerId=<uuid>
Authorization: Bearer <jwt_token>
```

## 🔌 WebSocket Events

### Client → Server

- `subscribe:event` - Subscribe to event updates
- `subscribe:sister` - Subscribe to sister updates
- `unsubscribe:event` - Unsubscribe from event
- `unsubscribe:sister` - Unsubscribe from sister
- `ping` - Health check

### Server → Client

- `newPhoto` - New photo uploaded
  ```json
  {
    "photo": {
      "id": "uuid",
      "public_url": "https://...",
      "filename": "IMG_001.jpg",
      "title": "...",
      "uploaded_at": "2024-01-01T12:00:00Z",
      "sync_timestamp": "2024-01-01T12:00:00Z"
    },
    "eventId": "uuid" (optional),
    "sister": "sister-a" (optional)
  }
  ```
- `subscribed` - Subscription confirmed
- `error` - Error message
- `pong` - Health check response

## 📷 Camera SDK Integration

### Canon EDSDK

1. Download Canon EDSDK from Canon Developer website
2. Install SDK on system
3. Add native bindings in `desktop-app/services/cameraDetector.ts`
4. Implement `detectCanonCameras()` function

### Nikon MAID

1. Download Nikon MAID SDK
2. Install SDK
3. Add native bindings
4. Implement `detectNikonCameras()` function

### Sony Camera Remote SDK

1. Download Sony SDK
2. Install SDK
3. Add native bindings
4. Implement `detectSonyCameras()` function

**Note**: SDK integration requires native modules. Use Hot Folder mode as fallback.

## 🛠️ Development

### Backend

```bash
cd backend
npm run dev  # With nodemon
```

### Frontend

```bash
cd frontend
npm run dev
```

### Desktop App

```bash
cd desktop-app
npm run dev  # Runs Electron + Vite dev server
```

## 🐛 Troubleshooting

### Photos not uploading

1. Check API key is valid and active
2. Verify API base URL is correct
3. Check network connection
4. Review desktop app logs

### WebSocket not connecting

1. Verify backend WebSocket server is running
2. Check CORS settings
3. Verify frontend WebSocket URL matches backend

### Camera not detected

1. Ensure camera is connected via USB
2. Install camera SDK if using SDK mode
3. Use Hot Folder mode as alternative

## 📝 Environment Variables

### Backend

```env
PORT=5001
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
```

### Frontend

```env
VITE_API_BASE_URL=http://localhost:5001
```

### Desktop App

Configured via UI (stored in user data directory)

## 🔒 Security

- API keys are stored securely in database
- API keys can be revoked at any time
- WebSocket connections are authenticated
- File uploads are validated (type, size)
- Rate limiting recommended for production

## 📦 Deployment

### Backend

Deploy to your hosting provider (Render, Railway, etc.)
- Ensure WebSocket support
- Set environment variables
- Run database migrations

### Frontend

Deploy to Vercel, Netlify, etc.
- Set `VITE_API_BASE_URL` to production backend URL

### Desktop App

Build and distribute:
```bash
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 🎉 Features

✅ Real-time photo uploads  
✅ WebSocket live updates  
✅ API key authentication  
✅ Hot folder watching  
✅ Camera SDK support (boilerplate)  
✅ Offline retry queue  
✅ Upload progress tracking  
✅ Error handling & logging  

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/)
- [Socket.IO Documentation](https://socket.io/)
- [Canon EDSDK](https://www.usa.canon.com/internet/portal/us/home/explore/solutions-services/edsdk)
- [Nikon MAID](https://sdk.nikonimaging.com/)
- [Sony Camera Remote SDK](https://developer.sony.com/develop/cameras/)

---

**Built for WeddingWeb** - Making wedding photography seamless! 📸💒

