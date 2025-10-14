/**
 * Face Recognition Service
 * 
 * Frontend service for face detection and recognition operations
 */

import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { loadFaceDetectionModels, detectFaces, FaceDetectionResult } from '@/utils/faceDetection';

export interface Person {
  id: string;
  name: string;
  role: 'bride' | 'groom' | 'family' | 'friend' | 'vendor' | 'other';
  avatarUrl?: string | null;
  sister?: 'sister-a' | 'sister-b' | 'both' | null;
  photoCount?: number;
  descriptorCount?: number;
}

export interface FaceMatch {
  personId: string;
  personName: string;
  personRole: string;
  distance: number;
  confidence: number;
}

export interface FaceMatchResult {
  bestMatch: FaceMatch | null;
  matches: FaceMatch[];
  totalMatches: number;
}

export interface FaceStatistics {
  totalPeople: number;
  totalDescriptors: number;
  totalFaces: number;
  verifiedFaces: number;
  averageDescriptorsPerPerson: number;
}

/**
 * Detect faces in an image element
 */
export async function detectFacesInImage(
  imageElement: HTMLImageElement
): Promise<FaceDetectionResult[]> {
  await loadFaceDetectionModels();
  return detectFaces(imageElement);
}

/**
 * Detect faces in a file
 */
export async function detectFacesInFile(file: File): Promise<FaceDetectionResult[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      try {
        const faces = await detectFacesInImage(img);
        URL.revokeObjectURL(img.src);
        resolve(faces);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Match a face descriptor against known people
 */
export async function matchFace(
  descriptor: Float32Array | number[],
  threshold?: number
): Promise<FaceMatchResult> {
  const response = await fetch(`${API_BASE_URL}/api/faces/match`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      descriptor: Array.from(descriptor),
      threshold: threshold || 0.6,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to match face');
  }
  
  return response.json();
}

/**
 * Match multiple faces at once
 */
export async function matchFaces(
  descriptors: (Float32Array | number[])[],
  threshold?: number
): Promise<FaceMatchResult[]> {
  const response = await fetch(`${API_BASE_URL}/api/faces/match-batch`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      descriptors: descriptors.map(d => Array.from(d)),
      threshold: threshold || 0.6,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to match faces');
  }
  
  const data = await response.json();
  return data.results;
}

/**
 * Find photos with similar faces
 */
export async function findSimilarFaces(
  descriptor: Float32Array | number[],
  limit?: number,
  threshold?: number
): Promise<any[]> {
  const response = await fetch(`${API_BASE_URL}/api/faces/find-similar`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      descriptor: Array.from(descriptor),
      limit: limit || 10,
      threshold: threshold || 0.6,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to find similar faces');
  }
  
  const data = await response.json();
  return data.faces;
}

/**
 * Get face recognition statistics
 */
export async function getFaceStatistics(): Promise<FaceStatistics> {
  const response = await fetch(`${API_BASE_URL}/api/faces/statistics`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch statistics');
  }
  
  return response.json();
}

/**
 * Verify a face identification
 */
export async function verifyFace(
  faceId: string,
  personId?: string,
  isVerified?: boolean
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/faces/verify/${faceId}`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ personId, isVerified }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to verify face');
  }
}

/**
 * Get all people
 */
export async function getPeople(filters?: {
  sister?: 'sister-a' | 'sister-b' | 'both';
  role?: string;
}): Promise<Person[]> {
  const params = new URLSearchParams();
  if (filters?.sister) params.append('sister', filters.sister);
  if (filters?.role) params.append('role', filters.role);
  
  const response = await fetch(`${API_BASE_URL}/api/faces/people?${params}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch people');
  }
  
  const data = await response.json();
  return data.people;
}

/**
 * Get a person with their photos
 */
export async function getPerson(personId: string): Promise<{
  person: Person;
  descriptorCount: number;
  photoCount: number;
  photos: any[];
}> {
  const response = await fetch(`${API_BASE_URL}/api/faces/people/${personId}`, {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch person');
  }
  
  return response.json();
}

/**
 * Create a new person
 */
export async function createPerson(data: {
  name: string;
  role: Person['role'];
  sister?: Person['sister'];
  avatarUrl?: string;
  faceDescriptors?: number[][];
  photoIds?: string[];
}): Promise<Person> {
  const response = await fetch(`${API_BASE_URL}/api/faces/people`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to create person' }));
    throw new Error(error.message);
  }
  
  const result = await response.json();
  return result.person;
}

/**
 * Update a person
 */
export async function updatePerson(
  personId: string,
  updates: Partial<Pick<Person, 'name' | 'role' | 'sister' | 'avatarUrl'>>
): Promise<Person> {
  const response = await fetch(`${API_BASE_URL}/api/faces/people/${personId}`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update person');
  }
  
  const result = await response.json();
  return result.person;
}

/**
 * Delete a person
 */
export async function deletePerson(personId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/faces/people/${personId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete person');
  }
}

/**
 * Add face descriptors for a person
 */
export async function addPersonDescriptors(
  personId: string,
  descriptors: (Float32Array | number[])[],
  photoIds?: string[]
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/faces/people/${personId}/descriptors`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      descriptors: descriptors.map(d => Array.from(d)),
      photoIds,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add descriptors');
  }
}

/**
 * Process image for face detection and matching
 * Returns detected faces with matched people
 */
export async function processImageForFaces(
  file: File
): Promise<Array<{
  detection: FaceDetectionResult;
  match: FaceMatchResult;
}>> {
  // Detect faces
  const detections = await detectFacesInFile(file);
  
  // Match each face
  const results = [];
  for (const detection of detections) {
    const match = await matchFace(detection.descriptor);
    results.push({ detection, match });
  }
  
  return results;
}

