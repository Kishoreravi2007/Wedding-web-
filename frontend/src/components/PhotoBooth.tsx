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
import { Camera, RotateCcw, AlertCircle, CheckCircle, Users, Wrench, Search, Image as ImageIcon, Lightbulb } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api'; // Import API_BASE_URL

// Import DeepFace face detection utility
import { detectFaces as detectFacesWithDeepFace, loadFaceDetectionModels } from '../utils/faceDetection';
import { faceDetectionDiagnostic } from '../utils/faceDetectionDiagnostic';
import PhotoBoothDiagnostic from './PhotoBoothDiagnostic';
import FaceSearchResults from './FaceSearchResults';
import LiveModeIndicator from './LiveModeIndicator';
import { useLiveSync } from '../hooks/useLiveSync';

interface PhotoBoothProps {
  className?: string;
  primaryColor?: string;
  buttonClass?: string;
  overlayImageSrc?: string;
  sister?: 'a' | 'b'; // Auto-detect which wedding based on which page user is on
}

const MIN_VIDEO_DETECTION_SCORE = 0.15;
const MIN_DISPLAY_CONFIDENCE = 0.15;
const MIN_LOCK_CONFIDENCE = 0.2;

const getDetectionScore = (detection: any) =>
  detection?.detection?.score ?? detection?.score ?? 0;

const getDetectionBox = (detection: any) =>
  detection?.detection?.box ?? detection?.box;

const PhotoBooth: React.FC<PhotoBoothProps> = ({
  className = '',
  primaryColor = '#3B82F6',
  buttonClass = 'bg-blue-500 hover:bg-blue-600 text-white',
  overlayImageSrc,
  sister = 'a' // Default to Parvathy's wedding
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
  // Auto-set wedding based on sister prop (no manual selection needed)
  // Backend expects hyphenated identifiers
  const selectedWedding = sister === 'a' ? 'sister-a' : 'sister-b';
  const [isSearching, setIsSearching] = useState(false); // New state for search loader
  const [searchResults, setSearchResults] = useState<string[]>([]); // New state for search results
  const [searchError, setSearchError] = useState<string | null>(null); // New state for search errors
  const [showFacePreview, setShowFacePreview] = useState(false); // Show detected face preview before searching

  // Live Mode state
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [storedEmbedding, setStoredEmbedding] = useState<number[] | null>(null);
  const [liveMatchedPhotos, setLiveMatchedPhotos] = useState<string[]>([]);
  const [newPhotoNotification, setNewPhotoNotification] = useState<string | null>(null);

  // Live sync WebSocket hook
  const {
    isConnected: isWebSocketConnected,
    matchingPhotoCount,
    matchingPhotos: livePhotos
  } = useLiveSync({
    sister: selectedWedding as 'sister-a' | 'sister-b',
    enabled: isLiveMode && !!storedEmbedding,
    faceEmbedding: storedEmbedding,
    onNewMatchingPhoto: (photo, score) => {
      console.log('🎉 New matching photo found!', photo.filename, score);
      setNewPhotoNotification(`New photo of you found! (${(score * 100).toFixed(0)}% match)`);
      setLiveMatchedPhotos(prev => [photo.public_url, ...prev]);

      // Clear notification after 5 seconds
      setTimeout(() => setNewPhotoNotification(null), 5000);
    }
  });

  // Add state for ultra-smooth detection
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [detectionHistory, setDetectionHistory] = useState<any[][]>([]);
  const [stableDetections, setStableDetections] = useState<any[]>([]);
  const [persistentDetection, setPersistentDetection] = useState<any[]>([]);
  const [detectionConfirmed, setDetectionConfirmed] = useState(false);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState(0);

  useEffect(() => {
    if (selectedFaceIndex >= detectionResults.length) {
      setSelectedFaceIndex(detectionResults.length > 0 ? detectionResults.length - 1 : 0);
    }
  }, [detectionResults, selectedFaceIndex]);

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

  // Load DeepFace API (no models to load, API is always available)
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Initializing DeepFace + YOLOv8-face API for Photo Booth...');
        setUserGuidance('Connecting to face detection service...');

        // Load DeepFace API (just verifies connection)
        await loadFaceDetectionModels();

        console.log('✅ DeepFace + YOLOv8-face API ready');
        setIsModelLoaded(true);
        setUserGuidance('Face detection ready! Click "Start Camera" to begin.');
        setDiagnosticInfo('DeepFace + YOLOv8-face API connected');
      } catch (error: any) {
        console.error('❌ Error connecting to DeepFace API:', error);
        setUserGuidance('Failed to connect to face detection service. Check console for details.');
        setDetectionStatus('error');
        setDiagnosticInfo(`API connection failed: ${error.message || 'Unknown error'}`);
      }
    };

    loadModels();
  }, []);

  // Enhanced face detection with DeepFace + YOLOv8-face
  const detectFaces = useCallback(async (imageElement: HTMLImageElement | HTMLVideoElement) => {
    if (!isModelLoaded) {
      setUserGuidance('Face detection service is still connecting. Please wait...');
      return;
    }

    setIsDetecting(true);
    setDetectionStatus('detecting');
    setUserGuidance('Detecting faces... Please hold still.');

    try {
      // Use DeepFace + YOLOv8-face API for detection
      console.log('🔍 Starting face detection...');
      const faceResults = await detectFacesWithDeepFace(imageElement);
      console.log(`✅ Face detection complete: ${faceResults.length} face(s) found`);

      if (faceResults.length > 0) {
        // Convert to format expected by PhotoBooth - IMPORTANT: Include descriptor!
        const detections = faceResults.map((result, index) => {
          if (!result.descriptor) {
            console.warn(`⚠️ Face ${index} missing descriptor`);
          }
          return {
            detection: {
              box: result.box,
              score: result.detection.score
            },
            descriptor: result.descriptor, // Include the descriptor for face matching
            box: result.box,
            landmarks: result.landmarks
          };
        });

        console.log(`✅ Processed ${detections.length} detection(s) with descriptors`);

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
      console.error('❌ Face detection error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      setDetectionStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Face detection failed';
      setUserGuidance(`Face detection failed: ${errorMsg}. Please check if DeepFace API is running.`);
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
      // Handle both old format (detection.box) and new format (detection.detection.box)
      const box = getDetectionBox(detection);
      const confidence = getDetectionScore(detection);
      const { x, y, width, height } = box;

      // Only draw detections with ultra-high confidence to eliminate flickering
      if (confidence < MIN_DISPLAY_CONFIDENCE) return;

      // Draw bounding box with smooth gradient
      const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
      if (index === selectedFaceIndex) {
        gradient.addColorStop(0, '#00c0ff');
        gradient.addColorStop(1, '#0077ff');
      } else {
        gradient.addColorStop(0, '#00ff00');
        gradient.addColorStop(1, '#00aa00');
      }

      ctx.strokeStyle = gradient;
      ctx.lineWidth = index === selectedFaceIndex ? 3 : 2; // Highlight selected face
      ctx.strokeRect(x, y, width, height);

      // Add subtle shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      // Draw confidence score with background (only for sufficiently high confidence)
      if (confidence >= MIN_DISPLAY_CONFIDENCE) {
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
      ctx.fillStyle = index === selectedFaceIndex ? 'rgba(0, 160, 255, 0.8)' : 'rgba(0, 255, 0, 0.8)';
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
  }, [selectedFaceIndex]);

  useEffect(() => {
    if (detectionResults.length > 0) {
      drawDetections(detectionResults);
    }
  }, [selectedFaceIndex, detectionResults, drawDetections]);

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

          // Detect faces with DeepFace + YOLOv8-face API
          const faceResults = await detectFacesWithDeepFace(video);
          console.log(`🔍 Face detection result: ${faceResults.length} face(s) detected`);

          if (faceResults.length === 0) {
            console.log('⚠️ No faces detected in video frame');
          }

          // Convert to format expected by PhotoBooth - IMPORTANT: Include all required properties!
          let detections = faceResults.map((result, index) => {
            if (!result.descriptor) {
              console.warn(`⚠️ Face ${index} missing descriptor`);
            }
            return {
              detection: {
                box: result.box,
                score: result.detection.score
              },
              box: result.box, // Top-level box for drawing
              landmarks: result.landmarks,
              descriptor: result.descriptor // Include descriptor for face matching
            };
          });

          // Filter detections by very high confidence to eliminate flickering
          detections = detections.filter(detection => getDetectionScore(detection) >= MIN_VIDEO_DETECTION_SCORE);

          // Add to detection history for smoothing
          setDetectionHistory(prev => {
            const newHistory = [...prev, detections].slice(-5); // Keep last 5 detections

            // Calculate ultra-stable detections (faces that appear very consistently)
            const stableCount = Math.max(3, Math.floor(newHistory.length * 0.8)); // Require 80% consistency
            const faceCountHistory = newHistory.map(dets => dets.length);
            const avgFaceCount = Math.round(faceCountHistory.reduce((a, b) => a + b, 0) / faceCountHistory.length);

            // Use ultra-stable detection count to completely eliminate flickering
            const stable = avgFaceCount > 0 && faceCountHistory.filter(count => count > 0).length >= stableCount
              ? detections.slice(0, Math.min(avgFaceCount, detections.length)) // Keep as many consistent faces as detected
              : [];

            setStableDetections(stable);
            return newHistory;
          });

          // Use ultra-stable detections with persistence for UI updates
          const displayDetections = stableDetections.length > 0 ? stableDetections : detections;

          // Apply persistence - keep showing last good detection for stability
          if (displayDetections.length > 0) {
            const faceLabel = displayDetections.length === 1 ? 'face' : 'faces';
            const lockableDetections = displayDetections.filter(det => getDetectionScore(det) >= MIN_LOCK_CONFIDENCE);

            setDetectionResults(displayDetections);
            setDetectionStatus('success');
            drawDetections(displayDetections);

            if (lockableDetections.length > 0) {
              setPersistentDetection(displayDetections);
              setDetectionConfirmed(true);
              const lockLabel = lockableDetections.length === 1 ? 'face locked' : 'faces locked';
              setUserGuidance(`Perfect! ${lockLabel}. Ready to take photo!`);
            } else if (detectionConfirmed && persistentDetection.length > 0) {
              setDetectionResults(persistentDetection);
              setDetectionStatus('success');
              const lockLabel = persistentDetection.length === 1 ? 'Face' : 'Faces';
              setUserGuidance(`${lockLabel} locked and stable. Ready to take photo!`);
              drawDetections(persistentDetection);
            } else {
              setUserGuidance(`${faceLabel.charAt(0).toUpperCase()}${faceLabel.slice(1)} detected. Hold steady for best results.`);
            }
          } else if (detectionConfirmed && persistentDetection.length > 0) {
            // Keep showing the last confirmed detection for stability
            setDetectionResults(persistentDetection);
            setDetectionStatus('success');
            setUserGuidance(`Faces locked and stable. Ready to take photo!`);
            drawDetections(persistentDetection);
          } else {
            setDetectionStatus('error');
            setUserGuidance('No face detected. Please position your face in the center and ensure good lighting.');
            console.log('⚠️ No faces detected in video frame');

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
          console.error('❌ Detection loop error:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
          // Don't stop detection loop, just log the error
          // This allows detection to continue even if one frame fails
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
    setSelectedFaceIndex(0);
  }, []);

  // Capture face for searching and send to backend
  const captureFaceForSearch = useCallback(async () => {
    console.log('🔍 captureFaceForSearch called');
    console.log('Video ref:', videoRef.current ? 'Available' : 'Not available');
    console.log('Models loaded:', isModelLoaded);
    console.log('Detection results:', detectionResults.length, 'selected index:', selectedFaceIndex);

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

    console.log('✅ All checks passed, proceeding with face capture...');
    setIsSearching(true);
    setSearchResults([]);
    setSearchError(null);
    setUserGuidance('Capturing your face...');

    try {
      // Create a temporary canvas to draw the detected face
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not create canvas context.');
      }

      // Use the currently selected face (fallback to first if out of range)
      const faceToCapture = detectionResults[selectedFaceIndex] || detectionResults[0];

      const box = getDetectionBox(faceToCapture);
      const { x, y, width, height } = box;

      // Add some padding to the face crop for better results
      const padding = Math.floor(Math.min(width, height) * 0.2);
      const cropX = Math.max(0, x - padding);
      const cropY = Math.max(0, y - padding);
      const cropWidth = Math.min(video.videoWidth - cropX, width + padding * 2);
      const cropHeight = Math.min(video.videoHeight - cropY, height + padding * 2);

      // Set canvas dimensions to the detected face with padding
      tempCanvas.width = cropWidth;
      tempCanvas.height = cropHeight;

      // Draw the detected face from the video onto the temporary canvas
      ctx.drawImage(video, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

      // Get the image data as a base64 string
      const imageData = tempCanvas.toDataURL('image/jpeg', 0.9);
      setCapturedFaceImage(imageData); // Store for display

      console.log('✅ Face captured - showing preview modal');
      console.log('Captured face image size:', imageData.length, 'bytes');

      setShowFacePreview(true); // Show preview for user confirmation
      setUserGuidance('Is this your face? Click "Confirm & Search" or "Retry" if wrong.');

      // Don't search yet - wait for user to confirm via the preview modal

    } catch (error) {
      console.error('❌ Face capture error:', error);
      setSearchError(error instanceof Error ? error.message : 'Failed to capture face');
      setUserGuidance('Failed to capture face. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [isModelLoaded, detectionResults, selectedWedding, selectedFaceIndex]);

  // Confirm and search with the captured face
  const confirmAndSearch = useCallback(async () => {
    if (!capturedFaceImage) {
      console.error('No captured face image');
      return;
    }

    setIsSearching(true);
    setShowFacePreview(false);
    setUserGuidance('Extracting face features...');

    try {
      // STEP 1: Use the face descriptor from the selected detected face
      const faceToSearch = detectionResults[selectedFaceIndex] || detectionResults[0];

      if (!faceToSearch || !faceToSearch.descriptor) {
        throw new Error('No face descriptor available. Please ensure face is detected before searching.');
      }

      // Get the face descriptor from the stored detection
      let faceDescriptor = faceToSearch.descriptor;

      // Handle different descriptor formats
      if (Array.isArray(faceDescriptor)) {
        // If it's already an array, use it directly
        faceDescriptor = Array.from(faceDescriptor);
      } else if (faceDescriptor && typeof faceDescriptor === 'object') {
        // If it's an object, try to extract the array
        faceDescriptor = Array.from(faceDescriptor.values || []);
      }

      // Validate descriptor
      if (!faceDescriptor || faceDescriptor.length === 0) {
        throw new Error('Face descriptor is empty or invalid');
      }

      // If descriptor is too long (concatenated), extract the correct portion
      // For 512-dim descriptors, if we have 4096 (8 faces), extract the selected face
      if (faceDescriptor.length === 4096 && selectedFaceIndex < 8) {
        console.warn(`⚠️  Descriptor appears concatenated (4096 dims). Extracting face ${selectedFaceIndex}...`);
        const startIndex = selectedFaceIndex * 512;
        faceDescriptor = faceDescriptor.slice(startIndex, startIndex + 512);
        console.log(`✅ Extracted 512-dim descriptor for face ${selectedFaceIndex}`);
      } else if (faceDescriptor.length > 512 && faceDescriptor.length % 512 === 0) {
        // Multiple 512-dim faces concatenated
        const numFaces = faceDescriptor.length / 512;
        const faceIndex = Math.min(selectedFaceIndex, numFaces - 1);
        const startIndex = faceIndex * 512;
        faceDescriptor = faceDescriptor.slice(startIndex, startIndex + 512);
        console.log(`✅ Extracted 512-dim descriptor from ${numFaces} concatenated faces (using face ${faceIndex})`);
      } else if (faceDescriptor.length > 128 && faceDescriptor.length % 128 === 0) {
        // Multiple 128-dim faces concatenated
        const numFaces = faceDescriptor.length / 128;
        const faceIndex = Math.min(selectedFaceIndex, numFaces - 1);
        const startIndex = faceIndex * 128;
        faceDescriptor = faceDescriptor.slice(startIndex, startIndex + 128);
        console.log(`✅ Extracted 128-dim descriptor from ${numFaces} concatenated faces (using face ${faceIndex})`);
      }

      console.log('✅ Using face descriptor:', faceDescriptor.length, 'dimensions');

      // Store the face embedding for live mode feature
      setStoredEmbedding(faceDescriptor);
      console.log('💾 Face embedding stored for live mode');

      setUserGuidance('Searching for matching faces in wedding photos...');


      // STEP 2: Send face descriptor to backend for matching
      const formData = new FormData();
      formData.append('wedding_name', selectedWedding);
      formData.append('face_descriptor', JSON.stringify(faceDescriptor));

      console.log('🔍 Calling Find My Photos API with face descriptor...');
      console.log('Wedding:', selectedWedding);
      console.log('Descriptor length:', faceDescriptor.length);

      // Use API_BASE_URL from config (works in both local and deployed)
      const response = await fetch(`${API_BASE_URL}/api/recognize`, {
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
      console.log('Matches:', data.matches);
      console.log('Total:', data.total ?? data.matches?.length ?? 0);

      // Normalize matches into array of URLs for the results modal
      const normalizedMatches = Array.isArray(data.matches)
        ? data.matches
          .map((match: any) => {
            if (!match) return null;
            if (typeof match === 'string') return match;
            return match.url || match.public_url || match.publicUrl || match.photo_url || null;
          })
          .filter((url: string | null): url is string => typeof url === 'string' && url.length > 0)
        : [];

      console.log('🔁 Normalized match URLs:', normalizedMatches);

      // Always show results modal (even if no matches)
      if (normalizedMatches.length > 0) {
        console.log('📸 Found photos:', normalizedMatches);
        setSearchResults(normalizedMatches);
        setShowFaceSearch(true);
        setUserGuidance(`Found ${normalizedMatches.length} matching photos!`);
      } else {
        console.log('❌ No photos found in response');
        setSearchResults([]);
        setSearchError(data.message || 'No matching photos found for this face in the selected wedding.');
        setShowFaceSearch(true); // Show modal even with no results
        setUserGuidance('No matching photos found.');
      }

      console.log('🖼️ Results modal state:', {
        showFaceSearch: true,
        resultsCount: data.matches?.length || 0,
        hasError: !!data.message
      });

    } catch (error: any) {
      console.error('❌ Face search error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error message:', error?.message);

      const errorMsg = error?.message || 'Network error or API unavailable';
      setSearchError(errorMsg);
      setUserGuidance(`Search failed: ${errorMsg}`);
      setShowFaceSearch(true); // Show modal with error
    } finally {
      setIsSearching(false);
    }
  }, [capturedFaceImage, selectedWedding, detectionResults, selectedFaceIndex]);

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
          const box = getDetectionBox(detection);
          const { x, y, width, height } = box;

          // Draw bounding box only (no text labels for clean photos)
          photoCtx.strokeStyle = '#00ff00';
          photoCtx.lineWidth = 3;
          photoCtx.strokeRect(x, y, width, height);
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
    setSelectedFaceIndex(0);

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
      {/* Model Loading Screen */}
      {!isModelLoaded && (
        <Card className="mb-6">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Loading Face Detection Models...
                </h3>
                <p className="text-lg text-gray-600 mb-4">
                  ⏱️ Please wait up to <span className="font-bold text-blue-600">1 minute</span>
                </p>
                <p className="text-sm text-gray-500">
                  We're loading advanced AI models for accurate face detection.
                  This is a one-time process.
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Make sure you have a stable internet connection.
                  The models are being downloaded in the background.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Photo Booth
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">



          {/* Face Detection Status - Prominent Visual Indicator */}
          {isWebcamActive && (
            <div className={`p-6 rounded-lg border-3 transition-all duration-300 ${detectionResults.length > 0
              ? 'bg-green-50 border-green-500 shadow-lg shadow-green-200'
              : 'bg-amber-50 border-amber-400'
              }`}>
              <div className="flex items-center justify-center gap-4">
                {detectionResults.length > 0 ? (
                  <>
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-700 mb-1">
                        ✓ Face Detected!
                      </p>
                      <p className="text-sm text-green-600">
                        {detectionResults.length} face(s) detected • Ready to capture photo
                      </p>
                      <p className="text-xs text-green-500 mt-1">
                        Confidence: {(getDetectionScore(detectionResults[selectedFaceIndex] || detectionResults[0]) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center animate-bounce">
                      <AlertCircle className="w-10 h-10 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-amber-700 mb-1">
                        Looking for Face...
                      </p>
                      <p className="text-sm text-amber-600">
                        {userGuidance || 'Move closer and face the camera directly'}
                      </p>
                      {detectionAttempts > 0 && (
                        <p className="text-xs text-amber-500 mt-1">
                          Attempt {detectionAttempts} of {maxAttempts}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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
                  onClick={captureFaceForSearch}
                  disabled={!isModelLoaded}
                  className={`${buttonClass} text-lg py-6 px-8`}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find My Photos
                </Button>

                <Button
                  onClick={resetDetection}
                  variant="outline"
                  className="py-6"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Detection
                </Button>

                <Button
                  onClick={stopWebcam}
                  variant="destructive"
                  className="py-6"
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
                {detectionResults.map((detection, index) => {
                  const confidence = getDetectionScore(detection);
                  const isSelected = index === selectedFaceIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedFaceIndex(index)}
                      className={`text-left bg-white p-3 rounded border transition-all ${isSelected
                        ? 'border-blue-500 shadow-md shadow-blue-100'
                        : 'border-transparent hover:border-blue-200 hover:shadow-sm'
                        }`}
                    >
                      <div className="font-medium flex items-center gap-2">
                        Face {index + 1}
                        {isSelected && (
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className="text-gray-600">
                        Confidence: {(confidence * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Click to search with this face
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tips for Better Detection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Tips for Better Results
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Position your face in the center of the frame</li>
              <li>• Look directly at the camera</li>
              <li>• Avoid backlighting or shadows</li>
              <li>• Keep your face at a reasonable distance</li>
            </ul>
          </div>

          {/* Live Mode Section */}
          {storedEmbedding && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-purple-900 flex items-center gap-2">
                  📡 Real-Time Photo Updates
                </h4>
                <LiveModeIndicator
                  isActive={isLiveMode}
                  isConnected={isWebSocketConnected}
                  photoCount={searchResults.length + liveMatchedPhotos.length}
                  newPhotoNotification={newPhotoNotification}
                  onToggle={() => setIsLiveMode(!isLiveMode)}
                />
              </div>

              {isLiveMode && (
                <div className="space-y-3">
                  <p className="text-sm text-purple-700">
                    Keep this page open! When photographers upload new photos, we'll automatically
                    check if you appear in them and notify you.
                  </p>

                  {/* Live matched photos preview */}
                  {liveMatchedPhotos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-purple-800 mb-2">
                        🆕 New Photos Found ({liveMatchedPhotos.length}):
                      </p>
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {liveMatchedPhotos.slice(0, 5).map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`New photo ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg border-2 border-green-400 shadow-md"
                          />
                        ))}
                        {liveMatchedPhotos.length > 5 && (
                          <div className="w-20 h-20 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 font-medium">
                            +{liveMatchedPhotos.length - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!isLiveMode && (
                <p className="text-sm text-purple-600">
                  Click "Go Live" to get real-time notifications when new photos of you are uploaded!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Face Preview Confirmation Modal */}
      {(() => {
        console.log('🖼️ Modal render check:', {
          showFacePreview,
          hasCapturedImage: !!capturedFaceImage,
          imageLength: capturedFaceImage?.length || 0
        });
        return null;
      })()}

      {showFacePreview && capturedFaceImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Is This Your Face?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Show captured face */}
              <div className="flex justify-center">
                <img
                  src={capturedFaceImage}
                  alt="Captured face"
                  className="rounded-lg border-4 border-blue-500 max-w-full h-auto"
                  style={{ maxHeight: '300px' }}
                  onError={() => console.error('Image failed to render')}
                  onLoad={() => console.log('✅ Preview image loaded successfully')}
                />
              </div>

              <p className="text-center text-gray-600">
                Verify this is your face before searching for photos
              </p>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    setShowFacePreview(false);
                    setCapturedFaceImage(null);
                    setUserGuidance('Face preview cancelled. Try capturing again.');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button
                  onClick={confirmAndSearch}
                  disabled={isSearching}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Confirm & Search
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Face Search Results Modal */}
      {(() => {
        console.log('🔍 Results modal render check:', {
          showFaceSearch,
          resultsCount: searchResults.length,
          hasError: !!searchError,
          capturedImage: !!capturedFaceImage
        });
        return null;
      })()}

      {showFaceSearch && (
        <div>
          {console.log('✅ Rendering FaceSearchResults component')}
          <FaceSearchResults
            capturedFaceImage={capturedFaceImage} // Pass captured image
            searchResults={searchResults} // Pass search results
            onClose={() => {
              console.log('🚪 Closing results modal');
              setShowFaceSearch(false);
              setCapturedFaceImage(null);
              setSearchResults([]);
              setSearchError(null);
              setUserGuidance('Face search closed. You can search again anytime!');
            }}
            weddingName={selectedWedding} // Pass selected wedding name
            searchError={searchError} // Pass search error
          />
        </div>
      )}
    </div>
  );
};

export default PhotoBooth;
