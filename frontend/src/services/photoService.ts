/**
 * Photo Service
 * 
 * Centralized service for photo-related API operations
 */

import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export interface PhotoUploadData {
  file: File;
  sister: 'sister-a' | 'sister-b';
  title?: string;
  description?: string;
  eventType?: string;
  tags?: string[];
  faces?: FaceData[];
}

export interface FaceData {
  descriptor: number[];
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  personId?: string;
  personName?: string;
}

export interface Photo {
  id: string;
  filename: string;
  publicUrl: string;
  size: number;
  mimetype: string;
  sister: 'sister-a' | 'sister-b';
  title: string;
  description: string;
  eventType: string;
  tags: string[];
  uploadedAt: string;
  faces: PhotoFace[];
}

export interface PhotoFace {
  id: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  isVerified: boolean;
  person: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export interface PhotoFilters {
  sister?: 'sister-a' | 'sister-b';
  eventType?: string;
  tags?: string[];
  personId?: string;
  limit?: number;
  offset?: number;
}

export interface PhotoListResponse {
  photos: Photo[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Upload a photo with metadata and face data
 */
export async function uploadPhoto(data: PhotoUploadData): Promise<Photo> {
  const formData = new FormData();
  formData.append('photo', data.file);
  formData.append('sister', data.sister);
  
  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.eventType) formData.append('eventType', data.eventType);
  if (data.tags) formData.append('tags', JSON.stringify(data.tags));
  if (data.faces) formData.append('faces', JSON.stringify(data.faces));
  
  const response = await fetch(`${API_BASE_URL}/api/photos`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Failed to upload photo');
  }
  
  return response.json();
}

/**
 * Get photos with optional filters
 */
export async function getPhotos(filters?: PhotoFilters): Promise<PhotoListResponse> {
  const params = new URLSearchParams();
  
  if (filters?.sister) params.append('sister', filters.sister);
  if (filters?.eventType) params.append('eventType', filters.eventType);
  if (filters?.tags) params.append('tags', JSON.stringify(filters.tags));
  if (filters?.personId) params.append('personId', filters.personId);
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  
  const response = await fetch(`${API_BASE_URL}/api/photos?${params}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch photos');
  }
  
  return response.json();
}

/**
 * Get a single photo by ID
 */
export async function getPhotoById(id: string): Promise<Photo> {
  const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch photo');
  }
  
  return response.json();
}

/**
 * Update photo metadata
 */
export async function updatePhoto(
  id: string,
  updates: Partial<Pick<Photo, 'title' | 'description' | 'eventType' | 'tags'>>
): Promise<Photo> {
  const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update photo');
  }
  
  return response.json();
}

/**
 * Delete a photo
 */
export async function deletePhoto(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/photos/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete photo');
  }
}

/**
 * Get faces detected in a photo
 */
export async function getPhotoFaces(photoId: string): Promise<PhotoFace[]> {
  const response = await fetch(`${API_BASE_URL}/api/photos/${photoId}/faces`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch photo faces');
  }
  
  const data = await response.json();
  return data.faces;
}

/**
 * Upload multiple photos in batch
 */
export async function uploadPhotos(
  photos: PhotoUploadData[],
  onProgress?: (completed: number, total: number) => void
): Promise<{ successful: Photo[]; failed: Array<{ file: File; error: string }> }> {
  const successful: Photo[] = [];
  const failed: Array<{ file: File; error: string }> = [];
  
  for (let i = 0; i < photos.length; i++) {
    try {
      const result = await uploadPhoto(photos[i]);
      successful.push(result);
    } catch (error) {
      failed.push({
        file: photos[i].file,
        error: error instanceof Error ? error.message : 'Upload failed',
      });
    }
    
    if (onProgress) {
      onProgress(i + 1, photos.length);
    }
  }
  
  return { successful, failed };
}

