/**
 * Face Detection Diagnostic Utility
 * 
 * This utility helps diagnose face detection issues and provides
 * troubleshooting information for the Photo Booth feature.
 */

import * as faceapi from 'face-api.js';

export interface DiagnosticResult {
  modelsLoaded: boolean;
  modelStatus: Record<string, boolean>;
  errors: string[];
  recommendations: string[];
}

export class FaceDetectionDiagnostic {
  private static instance: FaceDetectionDiagnostic;
  private diagnosticResult: DiagnosticResult | null = null;

  static getInstance(): FaceDetectionDiagnostic {
    if (!FaceDetectionDiagnostic.instance) {
      FaceDetectionDiagnostic.instance = new FaceDetectionDiagnostic();
    }
    return FaceDetectionDiagnostic.instance;
  }

  async runDiagnostic(): Promise<DiagnosticResult> {
    const result: DiagnosticResult = {
      modelsLoaded: false,
      modelStatus: {},
      errors: [],
      recommendations: []
    };

    try {
      console.log('🔍 Running Face Detection Diagnostic...');

      // Check if face-api is available
      if (!faceapi) {
        result.errors.push('face-api.js is not loaded');
        result.recommendations.push('Ensure face-api.js is properly imported');
        return result;
      }

      // Check model loading
      const models = [
        'tinyFaceDetector',
        'faceLandmark68Net',
        'faceRecognitionNet',
        'faceExpressionNet'
      ];

      for (const modelName of models) {
        try {
          const isLoaded = faceapi.nets[modelName as keyof typeof faceapi.nets].isLoaded;
          result.modelStatus[modelName] = isLoaded;
          
          if (!isLoaded) {
            result.errors.push(`${modelName} model is not loaded`);
          }
        } catch (error) {
          result.errors.push(`Error checking ${modelName}: ${error}`);
        }
      }

      // Check if all models are loaded
      result.modelsLoaded = Object.values(result.modelStatus).every(status => status);

      // Test face detection with a simple image
      if (result.modelsLoaded) {
        try {
          // Create a simple test canvas
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Draw a simple face-like shape for testing
            ctx.fillStyle = '#FFE4B5';
            ctx.fillRect(50, 50, 100, 120);
            
            // Draw eyes
            ctx.fillStyle = '#000';
            ctx.fillRect(70, 80, 10, 10);
            ctx.fillRect(120, 80, 10, 10);
            
            // Draw nose
            ctx.fillRect(95, 100, 10, 15);
            
            // Draw mouth
            ctx.fillRect(85, 130, 30, 5);
            
            // Test detection
            const detections = await faceapi.detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions({
              inputSize: 320,
              scoreThreshold: 0.1
            }));

            if (detections.length > 0) {
              console.log('✅ Face detection test successful');
            } else {
              result.errors.push('Face detection test failed - no faces detected in test image');
              result.recommendations.push('Try lowering the scoreThreshold in detection options');
            }
          }
        } catch (error) {
          result.errors.push(`Face detection test failed: ${error}`);
        }
      }

      // Generate recommendations
      if (!result.modelsLoaded) {
        result.recommendations.push('Load all required models before using face detection');
        result.recommendations.push('Check if model files are accessible at /models/');
      }

      if (result.errors.length > 0) {
        result.recommendations.push('Check browser console for detailed error messages');
        result.recommendations.push('Ensure good lighting and proper face positioning');
        result.recommendations.push('Try refreshing the page to reload models');
      }

      this.diagnosticResult = result;
      console.log('🔍 Diagnostic complete:', result);
      
    } catch (error) {
      result.errors.push(`Diagnostic failed: ${error}`);
      this.diagnosticResult = result;
    }

    return result;
  }

  getLastDiagnostic(): DiagnosticResult | null {
    return this.diagnosticResult;
  }

  // Helper method to get user-friendly error messages
  getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'face-api.js is not loaded': 'Face detection library is not loaded. Please refresh the page.',
      'tinyFaceDetector model is not loaded': 'Face detection model is not loaded. Please wait for models to load.',
      'Face detection test failed': 'Face detection is not working properly. Please check your setup.',
      'No faces detected': 'No faces were detected. Please ensure your face is visible and well-lit.'
    };

    return errorMessages[error] || error;
  }

  // Helper method to get troubleshooting steps
  getTroubleshootingSteps(): string[] {
    return [
      '1. Ensure your face is well-lit and visible',
      '2. Position your face in the center of the camera frame',
      '3. Make sure nothing is blocking your face',
      '4. Try adjusting your distance from the camera',
      '5. Check if camera permissions are granted',
      '6. Refresh the page if models fail to load',
      '7. Try using a different browser if issues persist'
    ];
  }
}

// Export singleton instance
export const faceDetectionDiagnostic = FaceDetectionDiagnostic.getInstance();
