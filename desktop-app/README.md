# WeddingWeb Desktop App

Desktop application for live photo sync from cameras to WeddingWeb. Automatically uploads photos as they are captured, enabling real-time photo galleries for wedding guests.

![WeddingWeb Desktop](https://via.placeholder.com/800x450?text=WeddingWeb+Desktop+App)

## Features

- **🔥 Hot Folder Watcher**: Automatically uploads photos from a watched folder
- **📤 Upload Queue**: Persistent queue with retry logic and offline support
- **📊 Real-time Stats**: Track uploads, pending items, and failures
- **🌐 Connection Status**: Visual indicator of server connectivity
- **💒 Wedding Selection**: Choose which wedding to upload photos to
- **🔑 API Key Auth**: Secure authentication with photographer API keys

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd desktop-app
npm install
```

### Development

```bash
npm run dev
```

This will:
1. Start the Vite dev server for React
2. Compile TypeScript for Electron
3. Launch the Electron app

### Build for Production

```bash
# Build for current platform
npm run pack

# Build for macOS
npm run build:mac

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux
```

## Configuration

1. **Open the app**
2. **Click the Settings (⚙️) button**
3. **Enter your API key** (get this from the Photographer Portal)
4. **Enter the API Base URL** (e.g., `https://your-backend.onrender.com`)
5. **Select a wedding** (if multiple are assigned)
6. **Browse and select a folder to watch**
7. **Click Start Watching**

## How It Works

### Hot Folder Mode

1. Configure your camera software (Lightroom, Capture One, or camera's tethering software) to save photos to a specific folder
2. Select that folder in the WeddingWeb Desktop app
3. Photos are automatically detected and uploaded as they appear
4. Guests see new photos in real-time on the wedding gallery

### Supported File Types

- JPEG, PNG, WebP, HEIC/HEIF
- RAW formats: CR2, NEF, ARW, RAF, ORF, RW2

## API Key

Get your API key from the Photographer Portal:

1. Log in to the Photographer Portal
2. Go to Settings → API Keys
3. Generate a new key for "Desktop App"
4. Copy the key (it's only shown once!)

## Troubleshooting

### Photos not uploading?

1. Check the connection status indicator (top right)
2. Verify your API key is valid (shows ✓ in settings)
3. Make sure a wedding is selected
4. Check if the folder path is correct

### Connection issues?

1. Verify the API Base URL is correct
2. Check your internet connection
3. The backend server might be down

### Failed uploads?

Click "Retry Failed" to attempt uploading failed photos again.

## Project Structure

```
desktop-app/
├── main.ts              # Electron main process
├── preload.ts           # Preload script (IPC bridge)
├── services/
│   ├── api.ts           # Backend API client
│   ├── config.ts        # Configuration management
│   ├── folderWatcher.ts # File system watcher
│   ├── uploadQueue.ts   # Upload queue with persistence
│   └── uploader.ts      # Photo upload logic
├── src/
│   ├── App.tsx          # Main React component
│   ├── index.css        # Global styles
│   └── types/           # TypeScript definitions
└── assets/              # App icons
```

## License

MIT
