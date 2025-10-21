/**
 * Face Detection Component using face-api.js
 * 
 * This component provides real-time face detection with:
 * - Photo upload detection
 * - Webcam live detection
 * - Bounding boxes around faces
 * - Detection statistics
 * - Clean, minimal UI with Tailwind CSS
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Camera, Upload, Play, Square, Download, RotateCcw } from 'lucide-react';

// Import face-api.js
import * as faceapi from 'face-api.js';

interface DetectionResult {
  detection: faceapi.FaceDetection;
  landmarks?: faceapi.FaceLandmarks68;
  descriptor?: Float32Array;
}

interface FaceDetectionProps {
  className?: string;
}

const FaceDetection: React.FC<FaceDetectionProps> = ({ className = '' }) => {
  // Refs for canvas and video elements
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State management
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [detectionResults, setDetectionResults] = useState<DetectionResult[]>([]);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [detectionStats, setDetectionStats] = useState({
    faceCount: 0,
    averageConfidence: 0,
    processingTime: 0
  });

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Loading face-api.js models...');
        
        // Load all required models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        
        console.log('✅ Face-api.js models loaded successfully');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('❌ Error loading face-api.js models:', error);
        alert('Failed to load face detection models. Please check if model files are available.');
      }
    };

    loadModels();
  }, []);

  // Draw bounding boxes on canvas
  const drawDetections = useCallback((detections: faceapi.FaceDetection[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw bounding boxes and confidence scores
    detections.forEach((detection, index) => {
      const { x, y, width, height } = detection.box;
      const confidence = detection.score;

      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);

      // Draw confidence score
      ctx.fillStyle = '#00ff00';
      ctx.font = '14px Arial';
      ctx.fillText(
        `Face ${index + 1}: ${(confidence * 100).toFixed(1)}%`,
        x,
        y - 5
      );

      // Draw face number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(
        `${index + 1}`,
        x + width / 2 - 8,
        y + height / 2 + 6
      );
    });
  }, []);

  // Process image for face detection with enhanced error handling
  const processImage = useCallback(async (image: HTMLImageElement) => {
    if (!isModelLoaded) {
      alert('Face detection models are still loading. Please wait...');
      return;
    }

    setIsDetecting(true);
    const startTime = performance.now();

    try {
      // Set canvas dimensions to match image
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = image.width;
      canvas.height = image.height;

      // Try multiple detection approaches for better results
      let detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.3 // Lower threshold for better detection
      }));

      // If no faces detected, try with different settings
      if (detections.length === 0) {
        console.log('No faces detected, trying with different settings...');
        detections = await faceapi.detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({
          inputSize: 416,
          scoreThreshold: 0.2 // Even lower threshold
        }));
      }

      // If still no faces, try with landmarks for better detection
      if (detections.length === 0) {
        console.log('Trying with landmarks for better detection...');
        const detectionsWithLandmarks = await faceapi
          .detectAllFaces(image, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.25
          }))
          .withFaceLandmarks();
        detections = detectionsWithLandmarks.map(d => d.detection);
      }

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Update detection results
      setDetectionResults(detections);
      setCurrentImage(image);

      // Calculate statistics
      const faceCount = detections.length;
      const averageConfidence = faceCount > 0 
        ? detections.reduce((sum, det) => sum + det.score, 0) / faceCount 
        : 0;

      setDetectionStats({
        faceCount,
        averageConfidence,
        processingTime
      });

      // Draw detections on canvas
      drawDetections(detections);

      if (faceCount > 0) {
        console.log(`✅ Detected ${faceCount} faces in ${processingTime.toFixed(2)}ms`);
      } else {
        console.log('⚠️ No faces detected. Try adjusting lighting or position.');
        alert('No faces detected. Please ensure:\n• Good lighting on your face\n• Face is centered in the image\n• Nothing is blocking your face\n• Try a different angle or distance');
      }

    } catch (error) {
      console.error('❌ Face detection error:', error);
      alert('Face detection failed. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  }, [isModelLoaded, drawDetections]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Create image element and load file
    const img = new Image();
    img.onload = () => {
      processImage(img);
    };
    img.onerror = () => {
      alert('Failed to load image. Please try again.');
    };
    img.src = URL.createObjectURL(file);
  }, [processImage]);

  // Start webcam
  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      video.play();
      setIsWebcamActive(true);

      // Start continuous detection
      const detectFaces = async () => {
        if (!isWebcamActive || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
          requestAnimationFrame(detectFaces);
          return;
        }

        try {
          // Set canvas dimensions to match video
          const canvas = canvasRef.current;
          if (!canvas) return;

          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Detect faces in video frame with enhanced settings
          let detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.3 // Lower threshold for better detection
          }));

          // If no faces detected, try with different settings
          if (detections.length === 0) {
            detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.2 // Even lower threshold
            }));
          }

          // If still no faces, try with landmarks for better detection
          if (detections.length === 0) {
            const detectionsWithLandmarks = await faceapi
              .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.25
              }))
              .withFaceLandmarks();
            detections = detectionsWithLandmarks.map(d => d.detection);
          }

          // Update detection results
          setDetectionResults(detections);
          setDetectionStats({
            faceCount: detections.length,
            averageConfidence: detections.length > 0 
              ? detections.reduce((sum, det) => sum + det.detection.score, 0) / detections.length 
              : 0,
            processingTime: 0
          });

          // Draw detections
          drawDetections(detections.map(d => d.detection));

        } catch (error) {
          console.error('Webcam detection error:', error);
        }

        // Continue detection loop with reduced frequency for better performance
        if (isWebcamActive) {
          setTimeout(() => requestAnimationFrame(detectFaces), 100);
        }
      };

      detectFaces();

    } catch (error) {
      console.error('❌ Webcam access error:', error);
      alert('Failed to access webcam. Please check permissions.');
    }
  }, [isWebcamActive, drawDetections]);

  // Stop webcam
  const stopWebcam = useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    setIsWebcamActive(false);
    setDetectionResults([]);
  }, []);

  // Clear detections
  const clearDetections = useCallback(() => {
    setDetectionResults([]);
    setCurrentImage(null);
    setDetectionStats({
      faceCount: 0,
      averageConfidence: 0,
      processingTime: 0
    });

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Download detection results
  const downloadResults = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `face-detection-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Face Detection
          </CardTitle>
          <p className="text-gray-600">
            Upload a photo or use your webcam to detect faces in real-time
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Model Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              {isModelLoaded ? 'Models loaded' : 'Loading models...'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={!isModelLoaded || isDetecting}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </Button>
            
            <Button
              onClick={isWebcamActive ? stopWebcam : startWebcam}
              disabled={!isModelLoaded}
              variant={isWebcamActive ? 'destructive' : 'default'}
              className="flex items-center gap-2"
            >
              {isWebcamActive ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop Webcam
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Webcam
                </>
              )}
            </Button>
            
            <Button
              onClick={clearDetections}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Clear
            </Button>
            
            {detectionResults.length > 0 && (
              <Button
                onClick={downloadResults}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            )}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Detection Area */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {/* Video element for webcam */}
            <video
              ref={videoRef}
              className={`w-full h-auto ${isWebcamActive ? 'block' : 'hidden'}`}
              autoPlay
              muted
              playsInline
            />
            
            {/* Canvas for drawing detections */}
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full"
              style={{ display: detectionResults.length > 0 || isWebcamActive ? 'block' : 'none' }}
            />
            
            {/* Placeholder when no image/video */}
            {!currentImage && !isWebcamActive && (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload a photo or start webcam to begin face detection</p>
                </div>
              </div>
            )}
          </div>

          {/* Detection Statistics */}
          {detectionResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">Faces Detected</h3>
                <p className="text-2xl font-bold text-blue-600">
                  {detectionStats.faceCount}
                </p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900">Avg Confidence</h3>
                <p className="text-2xl font-bold text-green-600">
                  {(detectionStats.averageConfidence * 100).toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900">Processing Time</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {detectionStats.processingTime.toFixed(0)}ms
                </p>
              </div>
            </div>
          )}

          {/* Detection Details */}
          {detectionResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Detection Details</h3>
              <div className="space-y-2">
                {detectionResults.map((result, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Face {index + 1}</span>
                      <span className="text-sm text-gray-600">
                        Confidence: {(result.detection.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    
                    {/* Face expressions if available */}
                    {result.expressions && (
                      <div className="mt-2 text-sm">
                        <p className="text-gray-600">
                          Expressions: {Object.entries(result.expressions)
                            .filter(([_, value]) => value > 0.1)
                            .map(([emotion, value]) => `${emotion}: ${(value * 100).toFixed(1)}%`)
                            .join(', ') || 'Neutral'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isDetecting && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-gray-600">Detecting faces...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceDetection;
