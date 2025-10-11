import { supabase } from '@/lib/supabase';

// File Upload Service for organizing wedding photos and music
export interface UploadedFile {
  id: string;
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
  'music': 'music'
};

// Generate unique filename
function generateFileName(originalName: string, eventType: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${eventType}_${timestamp}_${randomId}.${extension}`;
}

// Get directory path for event type, file category, and optional sister name
function getDirectoryPath(eventType: string, fileCategory: 'image' | 'music', sisterName?: string): string {
  let directory = EVENT_DIRECTORY_MAP[eventType] || 'other';
  const baseDirectory = CATEGORY_DIRECTORY_MAP[fileCategory] || 'wedding-photos'; // Default to wedding-photos

  // Add sister-specific directory if sisterName is provided
  if (sisterName) {
    directory = `${sisterName.toLowerCase()}/${directory}`;
  }

  return `uploads/${baseDirectory}/${directory}`;
}

// Determine file category from file type
function getFileCategory(file: File): 'image' | 'music' {
  if (file.type.startsWith('image/')) {
    return 'image';
  } else if (file.type.startsWith('audio/')) {
    return 'music';
  }
  throw new Error('Unsupported file type');
}

// Upload files to Firebase Storage and save metadata to Firestore
export async function uploadFiles(
  files: File[], 
  eventType: string = 'other',
  sisterName?: string // Add sisterName parameter
): Promise<UploadResult> {
  try {
    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      const fileCategory = getFileCategory(file);
      const directoryPath = getDirectoryPath(eventType, fileCategory, sisterName);
      const fileName = generateFileName(file.name, eventType);
      const filePath = `${directoryPath}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wedding-files') // You might need to create a bucket named 'wedding-files' in Supabase
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('wedding-files')
        .getPublicUrl(filePath);

      const uploadedFile: UploadedFile = {
        id: '', // Supabase will generate this
        originalName: file.name,
        fileName: fileName,
        filePath: filePath,
        publicUrl: publicUrlData.publicUrl,
        size: file.size,
        type: file.type,
        eventType: eventType,
        uploadedAt: new Date().toISOString(),
        fileCategory: fileCategory
      };

      // Save metadata to Supabase database
      const { data: docData, error: docError } = await supabase
        .from('uploadedFiles') // You might need to create a table named 'uploadedFiles' in Supabase
        .insert([uploadedFile])
        .select();

      if (docError) {
        throw docError;
      }
      uploadedFile.id = docData[0].id; // Update with Supabase generated ID

      uploadedFiles.push(uploadedFile);
    }

    return {
      success: true,
      files: uploadedFiles
    };

  } catch (error) {
    console.error('Error uploading files:', error);
    return {
      success: false,
      files: [],
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

// Get all uploaded files from Firestore
export async function getUploadedFiles(): Promise<UploadedFile[]> {
  try {
    const { data, error } = await supabase
      .from('uploadedFiles')
      .select('*');

    if (error) {
      throw error;
    }

    return data as UploadedFile[];
  } catch (error) {
    console.error('Error getting uploaded files:', error);
    return [];
  }
}

// Delete uploaded file from Firebase Storage and Firestore
export async function deleteUploadedFile(fileId: string, filePath: string): Promise<boolean> {
  try {
    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage
      .from('wedding-files')
      .remove([filePath]);

    if (storageError) {
      throw storageError;
    }

    // Delete metadata from Supabase database
    const { error: dbError } = await supabase
      .from('uploadedFiles')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      throw dbError;
    }

    console.log(`Deleting file with ID: ${fileId} and path: ${filePath}`);
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
