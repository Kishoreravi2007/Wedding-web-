/**
 * Photo Upload Service
 * 
 * Handles uploading photos to WeddingWeb API
 */

import axios, { AxiosProgressEvent } from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import FormData from 'form-data';

interface UploadConfig {
  apiKey: string;
  apiBaseUrl: string;
  eventId?: string;
  sister?: 'sister-a' | 'sister-b';
  compressImages?: boolean;
  maxRetries?: number;
}

interface UploadResult {
  success: boolean;
  photoId?: string;
  publicUrl?: string;
  error?: string;
}

export async function uploadPhoto(
  filePath: string,
  config: UploadConfig
): Promise<UploadResult> {
  const maxRetries = config.maxRetries || 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading ${path.basename(filePath)} (attempt ${attempt}/${maxRetries})...`);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read file
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);

      // Create form data
      const formData = new FormData();
      formData.append('photo', fileBuffer, {
        filename: fileName,
        contentType: getContentType(filePath),
      });

      if (config.eventId) {
        formData.append('eventId', config.eventId);
      }

      if (config.sister) {
        formData.append('sister', config.sister);
      }

      formData.append('timestamp', new Date().toISOString());

      // Upload
      const response = await axios.post(
        `${config.apiBaseUrl}/api/live/uploadPhoto`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${config.apiKey}`,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 60000, // 60 seconds
          onUploadProgress: (progressEvent: AxiosProgressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              console.log(`  Progress: ${percent}%`);
            }
          },
        }
      );

      console.log(`✅ Upload successful: ${response.data.photo.id}`);
      return {
        success: true,
        photoId: response.data.photo.id,
        publicUrl: response.data.photo.public_url,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`❌ Upload attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`  Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Upload failed after all retries',
  };
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.raw': 'image/x-raw',
    '.cr2': 'image/x-canon-cr2',
    '.nef': 'image/x-nikon-nef',
    '.arw': 'image/x-sony-arw',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

