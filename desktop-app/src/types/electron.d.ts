/**
 * Type definitions for Electron API
 */

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

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

