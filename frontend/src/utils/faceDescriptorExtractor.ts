/**
 * Face Descriptor Extractor Utility
 * 
 * Extracts face descriptors from images during upload
 * using DeepFace + YOLOv8-face backend for fast and accurate face detection
 */

const DEEPFACE_API_URL = import.meta.env.VITE_DEEPFACE_API_URL || 'http://localhost:8080';

/**
 * Load DeepFace API (no client-side models needed)
 */
export async function loadFaceModels(): Promise<void> {
  // DeepFace runs on the backend, no models to load on frontend
  console.log('✅ Using DeepFace + YOLOv8-face backend API');
  return Promise.resolve();
}

/**
 * Extract face descriptors from an image file using DeepFace + YOLOv8-face
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
    console.log(`🔍 Extracting face descriptors using DeepFace + YOLOv8-face for ${file.name}`);

    // Create FormData to send file to DeepFace API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('return_landmarks', 'false');
    formData.append('return_age_gender', 'false');
    formData.append('enforce_detection', 'false');

    // Call DeepFace API
    const response = await fetch(`${DEEPFACE_API_URL}/api/faces/detect`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepFace API error:', errorText);
      throw new Error(`DeepFace API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    if (!result.faces || result.faces.length === 0) {
      console.log(`⚠️ No faces detected in ${file.name}`);
      return { faces: [], count: 0 };
    }

    console.log(`✅ Found ${result.faces.length} face(s) in ${file.name} using DeepFace + YOLOv8-face`);

    // Convert DeepFace response to our format
    // DeepFace returns bbox as [x, y, width, height]
    const faces = result.faces.map((face: any) => ({
      descriptor: face.embedding, // 512-dim embedding from VGG-Face
      boundingBox: {
        x: face.bbox[0],
        y: face.bbox[1],
        width: face.bbox[2],
        height: face.bbox[3]
      },
      confidence: face.det_score || 0.9
    }));

    return { faces, count: faces.length };

  } catch (error) {
    console.error('❌ Error extracting face descriptors with DeepFace:', error);
    // Return empty array instead of failing upload
    return { faces: [], count: 0 };
  }
}


/**
 * Check if models are loaded (always true for DeepFace API)
 */
export function areModelsLoaded(): boolean {
  return true; // DeepFace runs on backend, always available
}

