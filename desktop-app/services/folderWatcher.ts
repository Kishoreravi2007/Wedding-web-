/**
 * Hot Folder Watcher Service
 * 
 * Watches a folder for new image files and triggers uploads
 */

import * as chokidar from 'chokidar';
import * as path from 'path';

let watcher: chokidar.FSWatcher | null = null;

const IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif',
  '.raw', '.cr2', '.nef', '.arw', '.raf', '.orf', '.rw2'
];

export function watchFolder(folderPath: string, onNewFile: (filePath: string) => void) {
  if (watcher) {
    stopWatching();
  }

  console.log(`📁 Watching folder: ${folderPath}`);

  watcher = chokidar.watch(folderPath, {
    ignored: /(^|[\/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't trigger for existing files
    awaitWriteFinish: {
      stabilityThreshold: 2000, // Wait 2 seconds after file stops changing
      pollInterval: 100,
    },
  });

  watcher.on('add', (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) {
      console.log(`📸 New image detected: ${filePath}`);
      onNewFile(filePath);
    }
  });

  watcher.on('error', (error) => {
    console.error('❌ Folder watcher error:', error);
  });

  watcher.on('ready', () => {
    console.log('✅ Folder watcher ready');
  });
}

export function stopWatching() {
  if (watcher) {
    watcher.close();
    watcher = null;
    console.log('🛑 Stopped watching folder');
  }
}

export function isWatching(): boolean {
  return watcher !== null;
}

