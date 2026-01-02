// Supabase for storage (switched back from Firebase)
// import { supabase } from '@/lib/supabase';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

// Firebase imports (commented out - keeping for future migration)
// import { db, storage } from '@/lib/firebase';
// import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
// import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// File Upload Service for organizing wedding photos and music
export interface UploadedFile {
  id?: string; // Made optional as Firestore generates it
  originalName: string;
  fileName: string;
  filePath: string;
  publicUrl: string;
  size: number;
  type: string;
  eventType: string;
  uploadedAt: string;
  fileCategory: 'image' | 'music';
}

export interface UploadResult {
  success: boolean;
  files: UploadedFile[];
  error?: string;
}

// Event type to directory mapping
const EVENT_DIRECTORY_MAP: Record<string, string> = {
  'parvathy-wedding': 'ceremony',
  'sreedevi-wedding': 'ceremony',
  'wedding-ceremony': 'ceremony', // Keep existing for other portals if needed
  'ganapathi-kidal': 'ganapathikidal',
  'dakshina': 'dakshina',
  'muhurtham': 'muhurtham',
  'reception': 'reception',
  'mehendi': 'mehendi',
  'background': 'background',
  'other': 'other'
};

// File category to base directory mapping
const CATEGORY_DIRECTORY_MAP: Record<string, string> = {
  'image': 'wedding-photos',
  'music': 'music',
  'audio-wish': 'audio-wishes' // New category for audio wishes
};

// Generate unique filename
function generateFileName(originalName: string, type: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'webm'; // Default to webm for audio
  return `${type}_${timestamp}_${randomId}.${extension}`;
}

// Get directory path for event type, file category, and optional sister name
function getDirectoryPath(eventType: string, fileCategory: 'image' | 'music' | 'audio-wish', sisterName?: string): string {
  let directory = EVENT_DIRECTORY_MAP[eventType] || 'other';
  const baseDirectory = CATEGORY_DIRECTORY_MAP[fileCategory] || 'wedding-photos'; // Default to wedding-photos

  // Add sister-specific directory if sisterName is provided
  if (sisterName) {
    directory = `${sisterName.toLowerCase()}/${directory}`;
  }

  return `uploads/${baseDirectory}/${directory}`;
}

// Determine file category from file type
function getFileCategory(file: File): 'image' | 'music' | 'audio-wish' {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('audio/')) {
    return 'music'; // For general audio, but we'll use 'audio-wish' specifically
  }
  throw new Error('Unsupported file type');
}

// Upload files to the backend and save metadata to Firestore
export interface UploadOptions {
  eventType?: string;
  tags?: string[];
}

export async function uploadFiles(
  files: File[],
  sister: 'sister-a' | 'sister-b',
  faceData?: { faces: any[]; count: number } | null,
  options?: UploadOptions
): Promise<UploadResult> {
  try {
    const uploadedFiles: UploadedFile[] = [];

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please login to upload photos.');
    }

    // Upload files one by one
    for (const file of files) {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('sister', sister);

      if (options?.eventType) {
        formData.append('eventType', options.eventType);
      }

      if (options?.tags?.length) {
        formData.append('tags', JSON.stringify(options.tags));
      }

      // Add face descriptors if available
      if (faceData && faceData.faces && faceData.faces.length > 0) {
        formData.append('face_descriptors', JSON.stringify(faceData.faces));
        console.log(`📸 Uploading ${file.name} with ${faceData.count} face descriptor(s)`);
      } else {
        console.log('Uploading file:', file.name, 'to sister:', sister);
      }

      console.log('Using token:', token ? 'Token present' : 'No token');

      // Always use Firebase-backed photos endpoint
      const uploadEndpoint = `${API_BASE_URL}/api/photos`;

      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Upload error:', errorData);

        if (response.status === 401 || response.status === 403) {
          throw new Error('Authentication failed. Please login again.');
        }

        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful to Supabase:', result);
      uploadedFiles.push(result.photo || result);
    }

    return {
      success: true,
      files: uploadedFiles,
    };
  } catch (error) {
    console.error('Error uploading files:', error);
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// New function to upload audio blobs for wishes using Backend API
export async function uploadAudioWish(audioBlob: Blob, recipient: string): Promise<string> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio-wish.webm');
    formData.append('recipient', recipient);
    formData.append('type', 'audio-wish');

    // Use specific endpoint or generic upload? 
    // Assuming we extend /api/photos or create a new one. 
    // For now, let's assume /api/photos handles it if we send the right data, 
    // OR creates a new simple endpoint.
    // Let's use a new endpoint /api/wishes/audio which I might need to create, 
    // OR just use /api/photos if it fits. 
    // The previous code uploaded to 'wedding-photos' bucket. 
    // Let's rely on the generic upload endpoint but I need to make sure backend handles it.

    // Simplest: POST to /api/photos with a flag
    const response = await fetch(`${API_BASE_URL}/api/photos/audio-wish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload audio wish');
    }

    const data = await response.json();
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading audio wish:", error);
    throw error;
  }
}

// Get all uploaded files from Backend
export async function getUploadedFiles(): Promise<UploadedFile[]> {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/photos`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Error getting uploaded files from Backend');
      return [];
    }

    const data = await response.json();

    // Map Backend data to UploadedFile format
    // Backend returns objects that should align, but let's map safely
    return (data.photos || []).map((photo: any) => ({
      id: photo.id,
      originalName: photo.filename, // Backend sends filename
      fileName: photo.filename,
      filePath: photo.filename, // Using filename as path for now
      publicUrl: photo.publicUrl || photo.url, // Backend should return signed or public URL
      size: photo.size || 0,
      type: photo.mimetype || 'unknown',
      eventType: photo.event_type || 'other',
      uploadedAt: photo.created_at,
      fileCategory: (photo.mimetype && photo.mimetype.startsWith('image/')) ? 'image' : 'music'
    }));
  } catch (error) {
    console.error('Error getting uploaded files:', error);
    return [];
  }
}

// Delete uploaded file using Backend API
export async function deleteUploadedFile(fileId: string, filePath: string): Promise<boolean> {
  try {
    // Backend handles both DB and Storage deletion
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/photos/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete file');
    }

    console.log(`Deleted file with ID: ${fileId}`);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Get file statistics
export function getFileStats(files: UploadedFile[]) {
  const stats = {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    byEventType: {} as Record<string, number>,
    byDate: {} as Record<string, number>
  };

  files.forEach(file => {
    // Count by event type
    stats.byEventType[file.eventType] = (stats.byEventType[file.eventType] || 0) + 1;

    // Count by date
    const date = new Date(file.uploadedAt).toDateString();
    stats.byDate[date] = (stats.byDate[date] || 0) + 1;
  });

  return stats;
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate file type
export function validateFileType(file: File): boolean {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
  return allowedImageTypes.includes(file.type) || allowedAudioTypes.includes(file.type);
}

// Validate image file type
export function validateImageFileType(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
  return allowedTypes.includes(file.type);
}

// Validate music file type
export function validateMusicFileType(file: File): boolean {
  const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac'];
  return allowedTypes.includes(file.type);
}

// Validate file size (max 10MB)
export function validateFileSize(file: File, maxSizeMB: number = 10): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}
