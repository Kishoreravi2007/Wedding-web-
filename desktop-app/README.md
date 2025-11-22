# WeddingWeb Desktop App

Desktop application for live photo sync from cameras to WeddingWeb.

## Features

- **Hot Folder Watcher**: Automatically uploads photos from a watched folder
- **Camera SDK Support**: Placeholder for Canon/Nikon/Sony SDK integration
- **Real-time Upload**: Instant photo uploads to WeddingWeb
- **Offline Queue**: Retry failed uploads when connection is restored
- **Configuration UI**: Easy setup and configuration

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Build for specific platform
npm run build:mac
npm run build:win
npm run build:linux
```

## Configuration

1. Open the app
2. Enter your API key (from Photographer Portal)
3. Select event or sister
4. Choose camera mode:
   - **Hot Folder**: Watch a folder for new photos
   - **SDK Mode**: Direct camera connection (requires SDK)

## Camera SDK Integration

### Canon EDSDK

1. Download Canon EDSDK from Canon Developer website
2. Install SDK
3. Add native bindings to `services/cameraDetector.ts`

### Nikon MAID

1. Download Nikon MAID SDK
2. Install SDK
3. Add native bindings to `services/cameraDetector.ts`

### Sony Camera Remote SDK

1. Download Sony SDK
2. Install SDK
3. Add native bindings to `services/cameraDetector.ts`

## Hot Folder Mode

If SDK integration is not available, use Hot Folder mode:

1. Configure your camera software (Lightroom, Capture One, etc.) to save photos to a specific folder
2. Select that folder in the app
3. Photos will automatically upload as they are saved

## Build

The app uses Electron Builder for packaging:

- **macOS**: DMG and ZIP
- **Windows**: NSIS installer and portable
- **Linux**: AppImage and DEB

## License

MIT

