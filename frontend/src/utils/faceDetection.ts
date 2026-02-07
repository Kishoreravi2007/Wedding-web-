/**
 * Face Detection Utility using DeepFace + YOLOv8-face
 * 
 * Provides face detection from image/video elements using DeepFace API with YOLOv8-face detector
 * Fast and accurate face detection with confidence threshold 0.25-0.3 and image size 1280+
 */

import { DEEPFACE_API_URL } from '@/lib/api';

let modelsLoaded = true; // DeepFace runs on backend, always available

export async function loadFaceDetectionModels() {
  // DeepFace runs on the backend, no models to load on frontend
  console.log('✅ Using DeepFace + YOLOv8-face backend API for face detection');
  modelsLoaded = true;
  return Promise.resolve();
}

export interface FaceDetectionResult {
  detection: {
    box: { x: number; y: number; width: number; height: number };
    score: number;
  };
  landmarks?: number[][];
  expressions?: { [key: string]: number };
  descriptor: number[]; // 512-dim DeepFace embedding
  box: { x: number; y: number; width: number; height: number };
}

/**
 * Convert image/video element to blob for API call
 */
async function elementToBlob(element: HTMLImageElement | HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = element instanceof HTMLVideoElement ? element.videoWidth : element.width;
  canvas.height = element instanceof HTMLVideoElement ? element.videoHeight : element.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  ctx.drawImage(element, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert element to blob'));
      }
    }, 'image/jpeg', 0.95);
  });
}

export async function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement): Promise<FaceDetectionResult[]> {
  if (!modelsLoaded) {
    console.warn('Face detection models not loaded. Loading now...');
    await loadFaceDetectionModels();
  }

  try {
    // Convert element to blob
    const blob = await elementToBlob(imageElement);
    const file = new File([blob], 'detection.jpg', { type: 'image/jpeg' });

    // Create FormData - only request what we need for speed
    const formData = new FormData();
    formData.append('file', file);
    formData.append('return_landmarks', 'false');  // Skip landmarks for speed
    formData.append('return_age_gender', 'false');  // Skip age/gender for speed
    formData.append('enforce_detection', 'false');

    // Call DeepFace API
    const response = await fetch(`${DEEPFACE_API_URL}/api/faces/detect`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepFace API error:', errorText);
      return [];
    }

    const result = await response.json();

    if (!result.faces || result.faces.length === 0) {
      return [];
    }

    // Map DeepFace response to our interface
    return result.faces.map((face: any) => ({
      detection: {
        box: {
          x: face.bbox[0],
          y: face.bbox[1],
          width: face.bbox[2],
          height: face.bbox[3]
        },
        score: face.det_score || 0.9
      },
      landmarks: face.landmark || undefined,
      expressions: undefined, // DeepFace doesn't provide expressions in this endpoint
      descriptor: face.embedding, // 512-dim embedding
      box: {
        x: face.bbox[0],
        y: face.bbox[1],
        width: face.bbox[2],
        height: face.bbox[3]
      }
    }));

  } catch (error) {
    console.error('❌ Error detecting faces with DeepFace:', error);
    return [];
  }
}
