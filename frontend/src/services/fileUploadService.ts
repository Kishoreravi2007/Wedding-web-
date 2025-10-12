import { db, storage } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

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

      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, file);
      const publicUrl = await getDownloadURL(snapshot.ref);

      const uploadedFile: UploadedFile = {
        originalName: file.name,
        fileName: fileName,
        filePath: filePath,
        publicUrl: publicUrl,
        size: file.size,
        type: file.type,
        eventType: eventType,
        uploadedAt: new Date().toISOString(),
        fileCategory: fileCategory
      };

      // Save metadata to Firestore
      const docRef = await addDoc(collection(db, 'uploadedFiles'), uploadedFile);
      uploadedFile.id = docRef.id; // Update with Firestore generated ID

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
    const q = query(collection(db, 'uploadedFiles'), orderBy('uploadedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const files: UploadedFile[] = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() } as UploadedFile);
    });
    return files;
  } catch (error) {
    console.error('Error getting uploaded files:', error);
    return [];
  }
}

// Delete uploaded file from Firebase Storage and Firestore
export async function deleteUploadedFile(fileId: string, filePath: string): Promise<boolean> {
  try {
    // Delete from Firebase Storage
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);

    // Delete metadata from Firestore
    await deleteDoc(doc(db, 'uploadedFiles', fileId));

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
