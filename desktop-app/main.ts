/**
 * Electron Main Process
 * 
 * Handles window management, file watching, upload queue, and IPC
 */

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { watchFolder, stopWatching, isWatching } from './services/folderWatcher';
import { uploadPhoto } from './services/uploader';
import { detectCameras } from './services/cameraDetector';
import { getConfig, saveConfig } from './services/config';
import { validateApiKey, fetchWeddings, checkConnection } from './services/api';
import {
  initQueue,
  addToQueue,
  getQueue,
  getQueueStats,
  processQueue,
  retryFailed,
  clearCompleted,
  setProgressCallback
} from './services/uploadQueue';

// Debug logging 
const logFile = path.join(__dirname, 'app-debug.log');
function log(msg: string) {
  try {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
    process.stdout.write(`[${timestamp}] ${msg}\n`);
  } catch (e) {
    // ignore
  }
}

log('--- App Starting ---');
log(`Working Dir: ${process.cwd()}`);
log(`Entry Dir: ${__dirname}`);

// Handle dev mode user data path
if (!app.isPackaged || process.env.NODE_ENV === 'development') {
  const userDataPath = path.join(process.cwd(), 'temp-electron-data');
  try {
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    app.setPath('userData', userDataPath);
    log(`Set User Data Path: ${userDataPath}`);
  } catch (e: any) {
    log(`Failed to set User Data Path: ${e.message}`);
  }
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  try {
    log('Creating window...');
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
      icon: path.join(__dirname, 'assets', 'icon.png'),
      titleBarStyle: 'hiddenInset',
    });

    log(`Preload path: ${path.join(__dirname, 'preload.js')}`);

    // Load the app
    const isDev = !app.isPackaged || process.env.NODE_ENV === 'development';
    log(`Mode: ${isDev ? 'Development' : 'Production'}`);

    if (isDev) {
      log('Loading URL: http://localhost:5173');
      mainWindow.loadURL('http://localhost:5173').catch(err => log(`Load URL Error: ${err.message}`));
      mainWindow.webContents.openDevTools();
    } else {
      const filePath = path.join(__dirname, '../dist/index.html');
      log(`Loading File: ${filePath}`);
      mainWindow.loadFile(filePath).catch(err => log(`Load File Error: ${err.message}`));
    }

    mainWindow.on('closed', () => {
      log('Window closed');
      mainWindow = null;
    });

    // Initialize queue
    initQueue();

    // Set up queue progress callback
    setProgressCallback((item) => {
      mainWindow?.webContents.send('queue-update', {
        item,
        stats: getQueueStats(),
      });
    });
  } catch (err: any) {
    log(`Create Window Error: ${err.message}`);
  }
}

app.whenReady().then(() => {
  log('App ready');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}).catch(err => log(`App Ready Error: ${err.message}`));

app.on('window-all-closed', () => {
  stopWatching();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ============ IPC Handlers ============

// Configuration
ipcMain.handle('get-config', async () => {
  return getConfig();
});

ipcMain.handle('save-config', async (_, config) => {
  saveConfig(config);
  return { success: true };
});

// Folder selection
ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select Photo Folder to Watch',
  });

  return result.canceled ? null : result.filePaths[0];
});

// Camera detection
ipcMain.handle('detect-cameras', async () => {
  return detectCameras();
});

// Folder watching
ipcMain.handle('start-watching', async (_, folderPath: string) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };

  try {
    const config = getConfig();

    watchFolder(folderPath, (filePath: string) => {
      // Add to queue instead of direct upload
      const item = addToQueue(filePath);
      mainWindow?.webContents.send('queue-update', {
        item,
        stats: getQueueStats(),
      });

      // Start processing queue if apiKey is set
      if (config.apiKey) {
        processQueue(config as any);
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-watching', async () => {
  stopWatching();
  return { success: true };
});

ipcMain.handle('is-watching', async () => {
  return isWatching();
});

// API validation
ipcMain.handle('validate-api-key', async (_, baseUrl: string, apiKey: string) => {
  return validateApiKey(baseUrl, apiKey);
});

// Fetch weddings
ipcMain.handle('fetch-weddings', async (_, baseUrl: string, apiKey: string) => {
  return fetchWeddings(baseUrl, apiKey);
});

// Check connection
ipcMain.handle('check-connection', async (_, baseUrl: string) => {
  return checkConnection(baseUrl);
});

// Queue management
ipcMain.handle('get-queue', async () => {
  return getQueue();
});

ipcMain.handle('get-queue-stats', async () => {
  return getQueueStats();
});

ipcMain.handle('retry-failed', async () => {
  retryFailed();
  const config = getConfig();
  if (config.apiKey) {
    processQueue(config as any);
  }
  return { success: true };
});

ipcMain.handle('clear-completed', async () => {
  clearCompleted();
  return { success: true };
});

// Test upload
ipcMain.handle('test-upload', async (_, filePath: string) => {
  const config = getConfig();
  if (!config.apiKey) {
    return { success: false, error: 'API key not configured' };
  }
  try {
    const result = await uploadPhoto(filePath, config as any);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Open folder in system file manager
ipcMain.handle('open-folder', async (_, folderPath: string) => {
  shell.openPath(folderPath);
  return { success: true };
});

// Get app version
ipcMain.handle('get-version', async () => {
  return app.getVersion();
});
