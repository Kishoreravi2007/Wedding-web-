/**
 * Preload Script
 * 
 * Exposes safe APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<{ success: boolean }>;
  selectFolder: () => Promise<string | null>;
  detectCameras: () => Promise<any[]>;
  startWatching: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  stopWatching: () => Promise<{ success: boolean }>;
  testUpload: (filePath: string) => Promise<{ success: boolean; result?: any; error?: string }>;
  onUploadProgress: (callback: (data: any) => void) => void;
}

const electronAPI: ElectronAPI = {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  detectCameras: () => ipcRenderer.invoke('detect-cameras'),
  startWatching: (folderPath) => ipcRenderer.invoke('start-watching', folderPath),
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  testUpload: (filePath) => ipcRenderer.invoke('test-upload', filePath),
  onUploadProgress: (callback) => {
    ipcRenderer.on('upload-progress', (_, data) => callback(data));
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

