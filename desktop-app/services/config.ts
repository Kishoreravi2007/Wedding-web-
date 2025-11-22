/**
 * Configuration Service
 * 
 * Manages app configuration (API key, event ID, etc.)
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

interface AppConfig {
  apiKey?: string;
  apiBaseUrl: string;
  eventId?: string;
  sister?: 'sister-a' | 'sister-b';
  watchedFolder?: string;
  compressImages: boolean;
  maxRetries: number;
  cameraMode?: 'sdk' | 'hot-folder';
  selectedCameraId?: string;
}

const CONFIG_FILE = path.join(app.getPath('userData'), 'config.json');

const DEFAULT_CONFIG: AppConfig = {
  apiBaseUrl: 'http://localhost:5001',
  compressImages: false,
  maxRetries: 3,
  cameraMode: 'hot-folder',
};

export function getConfig(): AppConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error reading config:', error);
  }
  return DEFAULT_CONFIG;
}

export function saveConfig(config: Partial<AppConfig>): void {
  try {
    const currentConfig = getConfig();
    const newConfig = { ...currentConfig, ...config };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    console.log('✅ Configuration saved');
  } catch (error) {
    console.error('Error saving config:', error);
    throw error;
  }
}

