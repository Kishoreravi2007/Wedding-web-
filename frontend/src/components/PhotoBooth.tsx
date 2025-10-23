/**
 * Photo Booth Component with Enhanced Face Detection
 * 
 * This component provides a robust photo booth experience with:
 * - Improved face detection reliability
 * - Better error handling and user guidance
 * - Multiple detection attempts
 * - User positioning guidance
 * - Enhanced visual feedback
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, RotateCcw, AlertCircle, CheckCircle, Users, Wrench, Search, Image as ImageIcon } from 'lucide-react';

// Import face-api.js
import * as faceapi from 'face-api.js';
import { faceDetectionDiagnostic } from '../utils/faceDetectionDiagnostic';
import PhotoBoothDiagnostic from './PhotoBoothDiagnostic';
import FaceSearchResults from './FaceSearchResults';

interface PhotoBoothProps {
  className?: string;
  primaryColor?: string;
  buttonClass?: string;
  overlayImageSrc?: string;
  weddingId?: string;
}

const PhotoBooth: React.FC<PhotoBoothProps> = ({ 
  className = '', 
  primaryColor = '#3B82F6',
  buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white',
  overlayImageSrc,
  weddingId
}) => {
  // Refs for canvas and video elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // State management
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [detectionResults, setDetectionResults] = useState<any[]>([]);
  const [detectionAttempts, setDetectionAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  const [userGuidance, setUserGuidance] = useState('');
  const [detectionStatus, setDetectionStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showFaceSearch, setShowFaceSearch] = useState(false);
  const [capturedFaceDescriptor, setCapturedFaceDescriptor] = useState<Float32Array | null>(null);

  // Run diagnostic when models fail to load
  const runDiagnostic = useCallback(async () => {
    try {
      const diagnostic = await faceDetectionDiagnostic.runDiagnostic();
      
      if (diagnostic.errors.length > 0) {
        const errorMessage = diagnostic.errors[0];
        setDiagnosticInfo(faceDetectionDiagnostic.getErrorMessage(errorMessage));
        setUserGuidance(`Diagnostic: ${diagnosticInfo}`);
      } else {
        setDiagnosticInfo('All systems working correctly');
      }
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setDiagnosticInfo('Diagnostic failed to run');
    }
  }, [diagnosticInfo]);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Loading face-api.js models for Photo Booth...');
        
        // Load all required models with better error handling
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        
        console.log('✅ Photo Booth models loaded successfully');
        setIsModelLoaded(true);
        setUserGuidance('Models loaded! Click "Start Camera" to begin.');
        setDiagnosticInfo('Models loaded successfully');
      } catch (error) {
        console.error('❌ Error loading Photo Booth models:', error);
        setUserGuidance('Failed to load face detection models. Please refresh the page.');
        setDetectionStatus('error');
        setDiagnosticInfo('Model loading failed');
        
        // Run diagnostic to get more details
        setTimeout(runDiagnostic, 1000);
      }
    };

    loadModels();
  }, [runDiagnostic]);

  // Enhanced face detection with multiple attempts
  const detectFaces = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement) => {
    if (!isModelLoaded) {
      setUserGuidance('Models are still loading. Please wait...');
      return;
    }

    setIsDetecting(true);
    setDetectionStatus('detecting');
    setUserGuidance('Detecting faces... Please hold still.');

    try {
      // Use more sensitive detection options
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 512,
        scoreThreshold: 0.5
      });

      // Try multiple detection methods
      let detections = await faceapi.detectAllFaces(imageElement, options);
      
      // If no faces detected, try with different settings
      if (detections.length === 0) {
        console.log('No faces detected, trying with different settings...');
        const alternativeOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 512,
          scoreThreshold: 0.5
        });
        detections = await faceapi.detectAllFaces(imageElement, alternativeOptions);
      }

      // If still no faces, try with landmarks for better detection
      if (detections.length === 0) {
        console.log('Trying with landmarks...');
        const detectionsWithLandmarks = await faceapi
          .detectAllFaces(imageElement, options)
          .withFaceLandmarks();
        detections = detectionsWithLandmarks.map(d => d.detection);
      }

      if (detections.length > 0) {
        setDetectionResults(detections);
        setDetectionStatus('success');
        setUserGuidance(`Great! Found ${detections.length} face(s). You can now take a photo!`);
        setDetectionAttempts(0);
        drawDetections(detections);
      } else {
        setDetectionAttempts(prev => prev + 1);
        setDetectionStatus('error');
        
        if (detectionAttempts < maxAttempts - 1) {
          setUserGuidance(`No face detected (attempt ${detectionAttempts + 1}/${maxAttempts}). Please adjust your position and try again.`);
        } else {
          setUserGuidance('No face detected after multiple attempts. Please check your lighting and position.');
        }
      }

    } catch (error) {
      console.error('Face detection error:', error);
      setDetectionStatus('error');
      setUserGuidance('Face detection failed. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  }, [isModelLoaded, detectionAttempts, maxAttempts]);

  // Draw detections with enhanced visualization
  const drawDetections = useCallback((detections: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each detection with enhanced styling
    detections.forEach((detection, index) => {
      const { x, y, width, height } = detection.box;
      const confidence = detection.score;

      // Draw bounding box with gradient
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#00cc00');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, width, height);

      // Draw confidence score with background
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.fillRect(x, y - 25, 120, 20);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.fillText(
        `Face ${index + 1}: ${(confidence * 100).toFixed(1)}%`,
        x + 5,
        y - 8
      );

      // Draw face number with circle
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, 15, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${index + 1}`,
        x + width / 2,
        y + height / 2 + 6
      );
    });
  }, []);

  // Start webcam with enhanced error handling
  const startWebcam = useCallback(async () => {
    console.log('startWebcam called');
    try {
      setUserGuidance('Starting camera... Please allow camera access.');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      console.log('getUserMedia success');

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      await video.play();
      setIsWebcamActive(true);
      setUserGuidance('Camera started! Position your face in the center of the frame.');

      // Use a ref to track if detection should continue
      let continueDetection = true;

      // Start continuous detection with better timing
      const detectLoop = async () => {
        if (!continueDetection || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          if (continueDetection) {
            requestAnimationFrame(detectLoop);
          }
          return;
        }

        try {
          // Set canvas dimensions to match video
          const canvas = canvasRef.current;
          if (!canvas) {
            requestAnimationFrame(detectLoop);
            return;
          }

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Detect faces with multiple attempts for better accuracy
          let detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
              inputSize: 512,
              scoreThreshold: 0.5
            }));

          // If no faces, try with lower threshold
          if (detections.length === 0) {
            detections = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 512,
                scoreThreshold: 0.5
              }));
          }

          setDetectionResults(detections);
          
          if (detections.length > 0) {
            setDetectionStatus('success');
            setUserGuidance(`Perfect! ${detections.length} face(s) detected. Ready to take photo!`);
            drawDetections(detections);
          } else {
            setDetectionStatus('error');
            setUserGuidance('No face detected. Please position your face in the center and ensure good lighting.');
            
            // Clear canvas if no detections
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
          }

        } catch (error) {
          console.error('Detection loop error:', error);
        }

        // Continue detection loop with reduced frequency
        setTimeout(() => {
          if (continueDetection) {
            requestAnimationFrame(detectLoop);
          }
        }, 100);
      };

      // Store cleanup function
      (video as any).stopDetection = () => {
        continueDetection = false;
      };

      // Start detection after a short delay
      setTimeout(() => {
        if (video.readyState >= video.HAVE_CURRENT_DATA) {
          detectLoop();
        } else {
          video.addEventListener('loadeddata', () => detectLoop(), { once: true });
        }
      }, 500);

    } catch (error) {
      console.error('Webcam access error:', error);
      setUserGuidance('Failed to access camera. Please check permissions and try again.');
      setDetectionStatus('error');
    }
  }, [drawDetections]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      // Stop detection loop
      if ((video as any).stopDetection) {
        (video as any).stopDetection();
      }
      
      // Stop video stream
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    setIsWebcamActive(false);
    setDetectionResults([]);
    setDetectionStatus('idle');
    setUserGuidance('Camera stopped. Click "Start Camera" to begin again.');
  }, []);

  // Capture face for searching
  const captureFaceForSearch = useCallback(async () => {
    const video = videoRef.current;
    if (!video) {
      setUserGuidance('Camera not available. Please start the camera first.');
      return;
    }

    if (!isModelLoaded) {
      setUserGuidance('Face detection models are still loading. Please wait...');
      return;
    }

    try {
      setUserGuidance('Capturing your face for search...');
      
      // Detect face and extract descriptor
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        setCapturedFaceDescriptor(detection.descriptor);
        setShowFaceSearch(true);
        setUserGuidance('Face captured! Searching for your photos in the gallery...');
      } else {
        setUserGuidance('No face detected. Please ensure your face is clearly visible and try again.');
      }
    } catch (error) {
      console.error('❌ Error capturing face:', error);
      setUserGuidance('Failed to capture face. Please try again.');
    }
  }, [isModelLoaded]);

  // Take photo
  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video) {
      setUserGuidance('Camera not available. Please start the camera first.');
      setDetectionStatus('error');
      return;
    }

    try {
      // Create a new canvas for the final photo
      const photoCanvas = document.createElement('canvas');
      const photoCtx = photoCanvas.getContext('2d');
      if (!photoCtx) {
        setUserGuidance('Unable to create photo canvas. Please try again.');
        setDetectionStatus('error');
        return;
      }

      // Set photo canvas size
      photoCanvas.width = video.videoWidth;
      photoCanvas.height = video.videoHeight;

      // Draw video frame
      photoCtx.drawImage(video, 0, 0);

      // Draw detections on photo if any faces were detected
      if (detectionResults.length > 0) {
        const detections = detectionResults;
        detections.forEach((detection, index) => {
          const { x, y, width, height } = detection.box;
          const confidence = detection.score;

          // Draw bounding box
          photoCtx.strokeStyle = '#00ff00';
          photoCtx.lineWidth = 3;
          photoCtx.strokeRect(x, y, width, height);

          // Draw confidence
          photoCtx.fillStyle = 'rgba(0, 255, 0, 0.8)';
          photoCtx.fillRect(x, y - 25, 120, 20);
          
          photoCtx.fillStyle = '#ffffff';
          photoCtx.font = 'bold 14px Arial';
          photoCtx.fillText(
            `Face ${index + 1}: ${(confidence * 100).toFixed(1)}%`,
            x + 5,
            y - 8
          );
        });
        
        setUserGuidance(`Photo saved successfully! Found ${detections.length} face(s). You can take another photo.`);
      } else {
        // No faces detected, but still save the photo
        setUserGuidance('Photo saved! No faces detected, but photo captured successfully.');
      }

      // Download photo
      const link = document.createElement('a');
      link.download = `photo-booth-${Date.now()}.png`;
      link.href = photoCanvas.toDataURL();
      link.click();

      setDetectionStatus('success');
      
      console.log(`✅ Photo saved with ${detectionResults.length} face(s) detected`);
      
    } catch (error) {
      console.error('❌ Error taking photo:', error);
      setUserGuidance('Failed to take photo. Please try again.');
      setDetectionStatus('error');
    }
  }, [detectionResults]);

  // Reset detection
  const resetDetection = useCallback(() => {
    setDetectionResults([]);
    setDetectionAttempts(0);
    setDetectionStatus('idle');
    setUserGuidance('Detection reset. Position your face and try again.');
    
      const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Photo Booth
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Important Notice */}
          {isWebcamActive && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Camera is Active</p>
                  <p className="text-sm text-blue-700 mt-1">
                    You can now take photos! Face detection is optional - the "Take Photo" button works with or without detected faces.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status and Guidance */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {detectionStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {detectionStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              {detectionStatus === 'detecting' && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
              <span className="font-medium">
                {detectionStatus === 'success' && 'Face Detected!'}
                {detectionStatus === 'error' && 'No Face Detected'}
                {detectionStatus === 'detecting' && 'Detecting...'}
                {detectionStatus === 'idle' && 'Ready'}
              </span>
            </div>
            <p className="text-sm text-gray-600">{userGuidance}</p>
            {detectionAttempts > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                Attempt {detectionAttempts}/{maxAttempts}
              </p>
            )}
          </div>

          {/* Camera Feed */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className={`w-full h-auto ${isWebcamActive ? 'block' : 'hidden'}`}
              autoPlay
              muted
              playsInline
            />
            
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ display: isWebcamActive ? 'block' : 'none' }}
            />
            
            {!isWebcamActive && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Click "Start Camera" to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            {!isWebcamActive ? (
              <Button
                onClick={startWebcam}
                disabled={!isModelLoaded}
                className={buttonClass}
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <>
                <Button
                  onClick={takePhoto}
                  disabled={false}
                  className={buttonClass}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo {detectionResults.length === 0 && '(No Face Detected)'}
                </Button>
                
                <Button
                  onClick={captureFaceForSearch}
                  disabled={!isModelLoaded}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find My Photos
                </Button>
                
                <Button
                  onClick={resetDetection}
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Detection
                </Button>
                
                <Button
                  onClick={runDiagnostic}
                  variant="outline"
                  className="text-sm"
                >
                  🔍 Run Diagnostic
                </Button>
                
              <Button
                  onClick={() => setShowDiagnostic(!showDiagnostic)}
                variant="outline"
                  className="text-sm"
                >
                  <Wrench className="w-4 h-4 mr-1" />
                  {showDiagnostic ? 'Hide' : 'Show'} Diagnostic
                </Button>
                
                <Button
                  onClick={stopWebcam}
                  variant="destructive"
                >
                  Stop Camera
              </Button>
              </>
            )}
          </div>

          {/* Detection Results */}
          {detectionResults.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  {detectionResults.length} Face(s) Detected
            </span>
          </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {detectionResults.map((detection, index) => (
                  <div key={index} className="bg-white p-3 rounded">
                    <div className="font-medium">Face {index + 1}</div>
                    <div className="text-gray-600">
                      Confidence: {(detection.score * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

          {/* Diagnostic Information */}
          {diagnosticInfo && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">System Status:</h4>
              <p className="text-sm text-yellow-800">{diagnosticInfo}</p>
                    </div>
                  )}
                  
          {/* Diagnostic Component */}
          {showDiagnostic && (
            <div className="mt-6">
              <PhotoBoothDiagnostic />
                    </div>
                  )}
                  
          {/* Tips for Better Detection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tips for Better Face Detection:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Position your face in the center of the frame</li>
              <li>• Look directly at the camera</li>
              <li>• Avoid backlighting or shadows</li>
              <li>• Keep your face at a reasonable distance (not too close or far)</li>
            </ul>
                  </div>
        </CardContent>
      </Card>

      {/* Face Search Results Modal */}
      {showFaceSearch && capturedFaceDescriptor && (
        <FaceSearchResults
          faceDescriptor={capturedFaceDescriptor}
          onClose={() => {
            setShowFaceSearch(false);
            setCapturedFaceDescriptor(null);
            setUserGuidance('Face search closed. You can search again anytime!');
          }}
          eventId={weddingId}
        />
      )}
    </div>
  );
};

export default PhotoBooth;
