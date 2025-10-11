import * as faceapi from 'face-api.js';

const MODEL_URL = '/models'; // Path to the models directory in public

let modelsLoaded = false;

export async function loadFaceDetectionModels() {
  if (modelsLoaded) {
    return;
  }
  try {
    await faceapi.nets.tinyFaceDetector.load(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.load(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.load(MODEL_URL);
    await faceapi.nets.faceExpressionNet.load(MODEL_URL);
    modelsLoaded = true;
    console.log('Face detection models loaded successfully!');
  } catch (error) {
    console.error('Failed to load face detection models:', error);
  }
}

export async function detectFaces(imageElement: HTMLImageElement | HTMLVideoElement): Promise<Array<faceapi.FaceDetection & { landmarks: faceapi.FaceLandmarks68; expressions: faceapi.FaceExpressions; descriptor: Float32Array; }>> {
  if (!modelsLoaded) {
    console.warn('Face detection models not loaded. Loading now...');
    await loadFaceDetectionModels();
  }

  const detections = await faceapi.detectAllFaces(
    imageElement,
    new faceapi.TinyFaceDetectorOptions()
  ).withFaceLandmarks().withFaceExpressions().withFaceDescriptors();

  return detections;
}
