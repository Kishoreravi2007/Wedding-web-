/**
 * Face Descriptor Extractor Utility
 * 
 * Extracts face descriptors from images during upload
 * for automatic face detection
 */

import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load face-api models (only once)
 */
export async function loadFaceModels(): Promise<void> {
  if (modelsLoaded) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      console.log('🔄 Loading face-api models for upload processing...');
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models')
      ]);
      
      modelsLoaded = true;
      console.log('✅ Face-api models loaded for upload');
    } catch (error) {
      console.error('❌ Failed to load face-api models:', error);
      throw error;
    }
  })();

  return loadingPromise;
}

/**
 * Extract face descriptors from an image file
 */
export async function extractFaceDescriptors(file: File): Promise<{
  faces: Array<{
    descriptor: number[];
    boundingBox: { x: number; y: number; width: number; height: number };
    confidence: number;
  }>;
  count: number;
}> {
  try {
    // Ensure models are loaded
    await loadFaceModels();

    // Create image element from file
    const img = await createImageFromFile(file);

    // Detect faces and extract descriptors
    const detections = await faceapi
      .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416 }))
      .withFaceLandmarks()
      .withFaceDescriptors();

    console.log(`Found ${detections.length} face(s) in ${file.name}`);

    if (detections.length === 0) {
      return { faces: [], count: 0 };
    }

    // Convert to plain objects for JSON serialization
    const faces = detections.map(detection => ({
      descriptor: Array.from(detection.descriptor),
      boundingBox: {
        x: detection.detection.box.x,
        y: detection.detection.box.y,
        width: detection.detection.box.width,
        height: detection.detection.box.height
      },
      confidence: detection.detection.score
    }));

    return { faces, count: faces.length };

  } catch (error) {
    console.error('Error extracting face descriptors:', error);
    // Return empty array instead of failing upload
    return { faces: [], count: 0 };
  }
}

/**
 * Create an Image element from a File
 */
function createImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Check if models are loaded
 */
export function areModelsLoaded(): boolean {
  return modelsLoaded;
}

