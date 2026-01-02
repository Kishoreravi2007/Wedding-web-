/**
 * Preload Script
 * 
 * Exposes safe APIs to the renderer process
 */

import { contextBridge, ipcRenderer } from 'electron';

export interface QueueItem {
  id: string;
  filePath: string;
  fileName: string;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retries: number;
  error?: string;
  addedAt: string;
  completedAt?: string;
}

export interface QueueStats {
  total: number;
  pending: number;
  uploading: number;
  completed: number;
  failed: number;
}

export interface Wedding {
  id: string;
  wedding_code: string;
  bride_name: string;
  groom_name: string;
  wedding_date?: string;
}

export interface ElectronAPI {
  // Config
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<{ success: boolean }>;

  // Folder
  selectFolder: () => Promise<string | null>;
  openFolder: (folderPath: string) => Promise<{ success: boolean }>;

  // Watching
  startWatching: (folderPath: string) => Promise<{ success: boolean; error?: string }>;
  stopWatching: () => Promise<{ success: boolean }>;
  isWatching: () => Promise<boolean>;

  // Cameras
  detectCameras: () => Promise<any[]>;

  // API
  validateApiKey: (baseUrl: string, apiKey: string) => Promise<{ valid: boolean; error?: string }>;
  fetchWeddings: (baseUrl: string, apiKey: string) => Promise<Wedding[]>;
  checkConnection: (baseUrl: string) => Promise<boolean>;

  // Queue
  getQueue: () => Promise<QueueItem[]>;
  getQueueStats: () => Promise<QueueStats>;
  retryFailed: () => Promise<{ success: boolean }>;
  clearCompleted: () => Promise<{ success: boolean }>;

  // Other
  testUpload: (filePath: string) => Promise<{ success: boolean; result?: any; error?: string }>;
  getVersion: () => Promise<string>;

  // Events
  onUploadProgress: (callback: (data: any) => void) => void;
  onQueueUpdate: (callback: (data: { item: QueueItem; stats: QueueStats }) => void) => void;
}

const electronAPI: ElectronAPI = {
  // Config
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),

  // Folder
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),

  // Watching
  startWatching: (folderPath) => ipcRenderer.invoke('start-watching', folderPath),
  stopWatching: () => ipcRenderer.invoke('stop-watching'),
  isWatching: () => ipcRenderer.invoke('is-watching'),

  // Cameras
  detectCameras: () => ipcRenderer.invoke('detect-cameras'),

  // API
  validateApiKey: (baseUrl, apiKey) => ipcRenderer.invoke('validate-api-key', baseUrl, apiKey),
  fetchWeddings: (baseUrl, apiKey) => ipcRenderer.invoke('fetch-weddings', baseUrl, apiKey),
  checkConnection: (baseUrl) => ipcRenderer.invoke('check-connection', baseUrl),

  // Queue
  getQueue: () => ipcRenderer.invoke('get-queue'),
  getQueueStats: () => ipcRenderer.invoke('get-queue-stats'),
  retryFailed: () => ipcRenderer.invoke('retry-failed'),
  clearCompleted: () => ipcRenderer.invoke('clear-completed'),

  // Other
  testUpload: (filePath) => ipcRenderer.invoke('test-upload', filePath),
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Events
  onUploadProgress: (callback) => {
    ipcRenderer.on('upload-progress', (_, data) => callback(data));
  },
  onQueueUpdate: (callback) => {
    ipcRenderer.on('queue-update', (_, data) => callback(data));
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
