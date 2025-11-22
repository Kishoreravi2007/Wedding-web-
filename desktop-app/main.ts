/**
 * Electron Main Process
 * 
 * Handles window management, camera detection, and file watching
 */

import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { watchFolder, stopWatching } from './services/folderWatcher';
import { uploadPhoto } from './services/uploader';
import { detectCameras } from './services/cameraDetector';
import { getConfig, saveConfig } from './services/config';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'dist/preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../assets/icon.png'), // Add icon later
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Get configuration
ipcMain.handle('get-config', async () => {
  return getConfig();
});

// Save configuration
ipcMain.handle('save-config', async (_, config) => {
  saveConfig(config);
  return { success: true };
});

// Select folder dialog
ipcMain.handle('select-folder', async () => {
  if (!mainWindow) return null;
  
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  
  return result.canceled ? null : result.filePaths[0];
});

// Detect cameras
ipcMain.handle('detect-cameras', async () => {
  return detectCameras();
});

// Start watching folder
ipcMain.handle('start-watching', async (_, folderPath: string) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  try {
    const config = getConfig();
    watchFolder(folderPath, (filePath: string) => {
      // Upload photo when new file is detected
      uploadPhoto(filePath, config)
        .then((result) => {
          // Send notification to renderer
          mainWindow?.webContents.send('upload-progress', {
            file: path.basename(filePath),
            status: 'success',
            result,
          });
        })
        .catch((error) => {
          mainWindow?.webContents.send('upload-progress', {
            file: path.basename(filePath),
            status: 'error',
            error: error.message,
          });
        });
    });
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Stop watching folder
ipcMain.handle('stop-watching', async () => {
  stopWatching();
  return { success: true };
});

// Test upload
ipcMain.handle('test-upload', async (_, filePath: string) => {
  const config = getConfig();
  try {
    const result = await uploadPhoto(filePath, config);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

