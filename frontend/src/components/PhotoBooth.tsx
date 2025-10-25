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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'; // Import Select components

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
  // weddingId?: string; // This prop will now be managed internally
}

const PhotoBooth: React.FC<PhotoBoothProps> = ({ 
  className = '', 
  primaryColor = '#3B82F6',
  buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white',
  overlayImageSrc,
  // weddingId // Remove from destructuring
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
  const [capturedFaceImage, setCapturedFaceImage] = useState<string | null>(null); // Store base64 image
  const [selectedWedding, setSelectedWedding] = useState<'sister_a' | 'sister_b'>('sister_a'); // New state for wedding selection
  const [isSearching, setIsSearching] = useState(false); // New state for search loader
  const [searchResults, setSearchResults] = useState<string[]>([]); // New state for search results
  const [searchError, setSearchError] = useState<string | null>(null); // New state for search errors
  
  // Add state for ultra-smooth detection
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [detectionHistory, setDetectionHistory] = useState<any[][]>([]);
  const [stableDetections, setStableDetections] = useState<any[]>([]);
  const [persistentDetection, setPersistentDetection] = useState<any[]>([]);
  const [detectionConfirmed, setDetectionConfirmed] = useState(false);

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
        setUserGuidance('Loading face detection models...');
        
        // Load models sequentially with progress feedback
        console.log('Loading TinyFaceDetector...');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        
        console.log('Loading FaceLandmark68Net...');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        
        console.log('Loading FaceRecognitionNet...');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        
        console.log('Loading FaceExpressionNet...');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');
        
        // Verify models are loaded
        const modelsLoaded = {
          tinyFaceDetector: faceapi.nets.tinyFaceDetector.isLoaded,
          faceLandmark68Net: faceapi.nets.faceLandmark68Net.isLoaded,
          faceRecognitionNet: faceapi.nets.faceRecognitionNet.isLoaded,
          faceExpressionNet: faceapi.nets.faceExpressionNet.isLoaded
        };
        
        console.log('Model loading status:', modelsLoaded);
        
        const allLoaded = Object.values(modelsLoaded).every(loaded => loaded);
        
        if (allLoaded) {
          console.log('✅ Photo Booth models loaded successfully');
          setIsModelLoaded(true);
          setUserGuidance('Models loaded! Click "Start Camera" to begin.');
          setDiagnosticInfo('All models loaded successfully');
        } else {
          throw new Error('Some models failed to load: ' + JSON.stringify(modelsLoaded));
        }
      } catch (error) {
        console.error('❌ Error loading Photo Booth models:', error);
        setUserGuidance('Failed to load face detection models. Check console for details.');
        setDetectionStatus('error');
        setDiagnosticInfo(`Model loading failed: ${error.message}`);
        
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
      // Use optimized detection options for better accuracy
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 416,
        scoreThreshold: 0.3
      });

      // Try multiple detection methods
      let detections = await faceapi.detectAllFaces(imageElement, options);
      
      // If no faces detected, try with more sensitive settings
      if (detections.length === 0) {
        console.log('No faces detected, trying with more sensitive settings...');
        const sensitiveOptions = new faceapi.TinyFaceDetectorOptions({
          inputSize: 320,
          scoreThreshold: 0.2
        });
        detections = await faceapi.detectAllFaces(imageElement, sensitiveOptions);
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

  // Draw detections with enhanced visualization and reduced flickering
  const drawDetections = useCallback((detections: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with slight fade effect to reduce harsh flickering
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each detection with smooth, stable styling
    detections.forEach((detection, index) => {
      const { x, y, width, height } = detection.box;
      const confidence = detection.score;

      // Only draw detections with ultra-high confidence to eliminate flickering
      if (confidence < 0.85) return;

      // Draw bounding box with smooth gradient
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#00aa00');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2; // Slightly thinner for less visual noise
      ctx.strokeRect(x, y, width, height);
      
      // Add subtle shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Draw confidence score with background (only for very high confidence)
      if (confidence > 0.8) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
        ctx.fillRect(x, y - 22, 90, 18);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(
          `${(confidence * 100).toFixed(0)}%`,
          x + 4,
          y - 8
        );
      }

      // Draw face number with subtle circle (less prominent)
      ctx.shadowColor = 'transparent'; // Reset shadow
      ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(x + width / 2, y + height / 2, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        `${index + 1}`,
        x + width / 2,
        y + height / 2 + 4
      );
    });
    
    // Reset text alignment for other canvas operations
    ctx.textAlign = 'left';
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

          // Skip detection if too soon (prevent excessive processing) 
          const now = Date.now();
          if (now - lastDetectionTime < 750) { // Minimum 750ms between detections for ultra-stability
            requestAnimationFrame(detectLoop);
            return;
          }
          setLastDetectionTime(now);

          // Detect faces with ultra-stable settings for video stream
          let detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({
              inputSize: 416,
              scoreThreshold: 0.7 // Ultra-high threshold for maximum stability
            }));

          // Filter detections by very high confidence to eliminate flickering
          detections = detections.filter(detection => detection.score > 0.8);

          // Add to detection history for smoothing
          setDetectionHistory(prev => {
            const newHistory = [...prev, detections].slice(-5); // Keep last 5 detections
            
            // Calculate ultra-stable detections (faces that appear very consistently)
            const stableCount = Math.max(3, Math.floor(newHistory.length * 0.8)); // Require 80% consistency
            const faceCountHistory = newHistory.map(dets => dets.length);
            const avgFaceCount = Math.round(faceCountHistory.reduce((a, b) => a + b, 0) / faceCountHistory.length);
            
            // Use ultra-stable detection count to completely eliminate flickering
            const stable = avgFaceCount > 0 && faceCountHistory.filter(count => count > 0).length >= stableCount
              ? detections.slice(0, Math.min(avgFaceCount, 1)) // Limit to max 1 face for maximum stability
              : [];
            
            setStableDetections(stable);
            return newHistory;
          });

          // Use ultra-stable detections with persistence for UI updates
          const displayDetections = stableDetections.length > 0 ? stableDetections : detections;
          
          // Apply persistence - keep showing last good detection for stability
          if (displayDetections.length > 0) {
            setPersistentDetection(displayDetections);
            setDetectionConfirmed(true);
            setDetectionResults(displayDetections);
            setDetectionStatus('success');
            setUserGuidance(`Perfect! Face detected and locked. Ready to take photo!`);
            drawDetections(displayDetections);
          } else if (detectionConfirmed && persistentDetection.length > 0) {
            // Keep showing the last confirmed detection for stability
            setDetectionResults(persistentDetection);
            setDetectionStatus('success');
            setUserGuidance(`Face locked and stable. Ready to take photo!`);
            drawDetections(persistentDetection);
          } else {
            setDetectionStatus('error');
            setUserGuidance('No face detected. Please position your face in the center and ensure good lighting.');
            
            // Only clear after a longer period of no detections
            if (detectionHistory.length > 5 && detectionHistory.slice(-5).every(dets => dets.length === 0)) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
              setPersistentDetection([]);
              setDetectionConfirmed(false);
            }
          }
        } catch (error) {
          console.error('Detection loop error:', error);
        }

        // Continue detection loop with ultra-stable frequency (eliminate flickering)
        setTimeout(() => {
          if (continueDetection) {
            requestAnimationFrame(detectLoop);
          }
        }, 500); // Increased to 500ms for ultra-maximum stability
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

  // Capture face for searching and send to backend
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

    if (detectionResults.length === 0) {
      setUserGuidance('No face detected. Please ensure your face is clearly visible before searching.');
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setSearchError(null);
    setUserGuidance('Searching your wedding memories...');

    try {
      // Create a temporary canvas to draw the detected face
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context.');
      }

      // Get the bounding box of the first detected face
      const { x, y, width, height } = detectionResults[0].box;

      // Set canvas dimensions to the detected face
      tempCanvas.width = width;
      tempCanvas.height = height;

      // Draw the detected face from the video onto the temporary canvas
      ctx.drawImage(video, x, y, width, height, 0, 0, width, height);

      // Get the image data as a base64 string
      const imageData = tempCanvas.toDataURL('image/jpeg');
      setCapturedFaceImage(imageData); // Store for potential display in search results modal

      // Convert base64 to Blob for FormData
      const byteString = atob(imageData.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/jpeg' });

      const formData = new FormData();
      formData.append('file', blob, 'face.jpg');
      formData.append('wedding_name', selectedWedding); // Send selected wedding name

      console.log('🔍 Calling Find My Photos API...');
      console.log('Wedding:', selectedWedding);
      console.log('Image size:', blob.size, 'bytes');
      
      // Use environment variable for API URL (works in both local and deployed)
      const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/recognize`, {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', response.status, errorText);
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response:', data);
      
      if (data.matches && data.matches.length > 0) {
        console.log('📸 Found photos:', data.matches);
        setSearchResults(data.matches);
        setShowFaceSearch(true);
        setUserGuidance(`Found ${data.matches.length} matching photos!`);
      } else {
        console.log('❌ No photos found in response');
        setSearchError('No matching photos found for this face in the selected wedding.');
        setUserGuidance('No matching photos found.');
      }

    } catch (error: any) {
      console.error('❌ Face search error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error?.message);
      
      const errorMsg = error?.message || 'Network error or API unavailable';
      setSearchError(errorMsg);
      setUserGuidance(`Search failed: ${errorMsg}`);
    } finally {
      setIsSearching(false);
    }
  }, [isModelLoaded, detectionResults, selectedWedding]);

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
          {/* Wedding Selection */}
          <div className="flex items-center gap-2">
            <label htmlFor="wedding-select" className="text-sm font-medium text-gray-700">
              Select Wedding:
            </label>
            <Select value={selectedWedding} onValueChange={(value: 'sister_a' | 'sister_b') => setSelectedWedding(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a wedding" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sister_a">Sister A's Wedding</SelectItem>
                <SelectItem value="sister_b">Sister B's Wedding</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
      {showFaceSearch && (
        <FaceSearchResults
          capturedFaceImage={capturedFaceImage} // Pass captured image
          searchResults={searchResults} // Pass search results
          onClose={() => {
            setShowFaceSearch(false);
            setCapturedFaceImage(null);
            setSearchResults([]);
            setSearchError(null);
            setUserGuidance('Face search closed. You can search again anytime!');
          }}
          weddingName={selectedWedding} // Pass selected wedding name
          searchError={searchError} // Pass search error
        />
      )}
    </div>
  );
};

export default PhotoBooth;
