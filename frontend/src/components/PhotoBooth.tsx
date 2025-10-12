"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, RefreshCw, Users, Heart, Download, Eye, VideoOff } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import * as faceapi from 'face-api.js';
import { loadFaceDetectionModels } from '@/utils/faceDetection';
import { Photo as PhotoType, Face as FaceType } from '@/types/photo';

// Force TypeScript re-evaluation
interface PhotoBoothProps {
  primaryColor: string;
  buttonClass: string;
  overlayImageSrc: string;
  weddingId: string;
  galleryPath: string;
}

const PhotoBooth = ({ primaryColor, buttonClass, overlayImageSrc, weddingId, galleryPath }: PhotoBoothProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLImageElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [personalizedPhotos, setPersonalizedPhotos] = useState<PhotoType[]>([]);
  const [showPersonalizedPhotos, setShowPersonalizedPhotos] = useState(false);
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [detectedFaceDescriptor, setDetectedFaceDescriptor] = useState<Float32Array | null>(null);
  const [isFaceApiLoaded, setIsFaceApiLoaded] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(true);
  const [faceQuality, setFaceQuality] = useState<'good' | 'poor' | 'none'>('none');
  const [retakeCount, setRetakeCount] = useState(0);
  const [showRetakePrompt, setShowRetakePrompt] = useState(false);
  const [lastDetectionResult, setLastDetectionResult] = useState<any>(null);
  const [cameraAccessDenied, setCameraAccessDenied] = useState(false);
  
  const [galleryPhotos, setGalleryPhotos] = useState<PhotoType[]>([
    {
      id: 'local-photo-1',
      url: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Local+Photo+1',
      thumbnail: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Local+Photo+1',
      title: 'Local Photo 1',
      description: 'A sample local photo.',
      tags: ['sample', 'local'],
      event: 'local',
      date: new Date().toISOString(),
      views: 0,
      downloads: 0,
      faces: [
        {
          box: { x: 10, y: 10, width: 50, height: 50 },
          descriptor: new Float32Array(128).fill(0.1),
          personName: 'John Doe',
        },
      ],
    },
    {
      id: 'local-photo-2',
      url: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Local+Photo+2',
      thumbnail: 'https://via.placeholder.com/150/0000FF/FFFFFF?text=Local+Photo+2',
      title: 'Local Photo 2',
      description: 'Another sample local photo.',
      tags: ['sample', 'local'],
      event: 'local',
      date: new Date().toISOString(),
      views: 0,
      downloads: 0,
      faces: [
        {
          box: { x: 20, y: 20, width: 60, height: 60 },
          descriptor: new Float32Array(128).fill(0.2),
          personName: 'Jane Doe',
        },
      ],
    },
  ]);

  const faceMatcher = useMemo(() => {
    if (!isFaceApiLoaded || galleryPhotos.length === 0) return null;

    const labeledDescriptors = galleryPhotos.flatMap((photo: PhotoType) =>
      photo.faces?.map((face: FaceType) => new faceapi.LabeledFaceDescriptors(photo.id, [face.descriptor!])) ?? []
    );
    return new faceapi.FaceMatcher(labeledDescriptors, 0.5);
  }, [isFaceApiLoaded, galleryPhotos]);

  const initializeFaceApi = async () => {
    try {
      await loadFaceDetectionModels();
      setIsFaceApiLoaded(true);
      console.log('Face API models loaded successfully');
    } catch (error) {
      console.error('Failed to load Face API models:', error);
      setIsFaceApiLoaded(false);
    } finally {
      setIsModelsLoading(false);
    }
  };

  const startCamera = async () => {
    setCameraAccessDenied(false);
    if (stream) stream.getTracks().forEach(track => track.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
            console.log('Video stream started successfully.');
          } catch (playErr) {
            console.warn("Autoplay prevented:", playErr);
            showError("Autoplay blocked. Please click 'Start Camera' to enable video.");
          }
        };
      }
      setStream(stream);
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showError("Camera access denied. Please enable camera permissions in your browser settings.");
        setCameraAccessDenied(true);
      } else {
        showError("Could not access camera. Please check your device and browser settings.");
      }
    }
  };

  useEffect(() => {
    initializeFaceApi();
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream) {
      console.log('Camera stream is active:', stream);
    } else {
      console.log('Camera stream is not active.');
    }
  }, [stream]);

  // New state for auto-capture
  const [goodFacePoseStart, setGoodFacePoseStart] = useState<number | null>(null);
  const [isPhotoBeingTaken, setIsPhotoBeingTaken] = useState(false);
  const POSE_HOLD_DURATION = 2000; // 2 seconds for countdown

  // Main detection and auto-capture loop
  useEffect(() => {
    if (!isFaceApiLoaded || !stream || !videoRef.current) return;

    let detectionInterval: NodeJS.Timeout;

    const handleContinuousDetection = async () => {
        if (videoRef.current && !videoRef.current.paused && !isPhotoBeingTaken) {
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
            ).withFaceLandmarks().withFaceExpressions(); // Add .withFaceExpressions()

            if (canvasRef.current && videoRef.current) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                const dims = faceapi.matchDimensions(canvas, video, true);
                const resizedDetections = faceapi.resizeResults(detections, dims);

                const context = canvas.getContext('2d');
                if (context) {
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    faceapi.draw.drawDetections(canvas, resizedDetections);
                    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
                    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
                }
            }

            const qualityResult = validateFaceQuality(detections);
            // We don't set faceQuality state here to avoid conflicting with the manual detection UI
            
            const isSmiling = detections.length > 0 && detections[0].expressions.happy > 0.9; // Check for happy expression
            
            if (qualityResult.quality === 'good' && isSmiling) { // Only proceed if face is good quality AND smiling
                if (goodFacePoseStart === null) {
                    setGoodFacePoseStart(Date.now());
                } else if (Date.now() - goodFacePoseStart > POSE_HOLD_DURATION) {
                    setIsPhotoBeingTaken(true);
                    takePhoto();
                    setGoodFacePoseStart(null);
                    // Reset photo taking state after a delay
                    setTimeout(() => setIsPhotoBeingTaken(false), 3000); // 3s cooldown
                }
            } else {
                setGoodFacePoseStart(null);
            }
        }
    };

    detectionInterval = setInterval(handleContinuousDetection, 200); // Detect 5 times per second

    return () => clearInterval(detectionInterval);
  }, [isFaceApiLoaded, stream, isPhotoBeingTaken, goodFacePoseStart]);

  const validateFaceQuality = (detections: any[]) => {
    if (detections.length === 0) {
      return { quality: 'none', message: 'No face detected' };
    }

    const detection = detections[0];
    const faceSize = detection.box.width * detection.box.height;
    const minFaceSize = 5000;
    
    const videoWidth = videoRef.current?.videoWidth || 640;
    const videoHeight = videoRef.current?.videoHeight || 480;
    const centerX = videoWidth / 2;
    const centerY = videoHeight / 2;
    const faceCenterX = detection.box.x + detection.box.width / 2;
    const faceCenterY = detection.box.y + detection.box.height / 2;
    
    const distanceFromCenter = Math.sqrt(
      Math.pow(faceCenterX - centerX, 2) + Math.pow(faceCenterY - centerY, 2)
    );
    const maxDistance = Math.min(videoWidth, videoHeight) * 0.4;
    
    if (faceSize < minFaceSize) {
      return { 
        quality: 'poor', 
        message: 'Face too small. Please move closer to the camera.' 
      };
    }
    
    if (distanceFromCenter > maxDistance) {
      return { 
        quality: 'poor', 
        message: 'Please center your face in the frame.' 
      };
    }
    
    const faceAreaRatio = faceSize / (videoWidth * videoHeight);
    if (faceAreaRatio > 0.5) {
      return { 
        quality: 'poor', 
        message: 'Face too close. Please move back a bit.' 
      };
    }
    
    return { 
      quality: 'good', 
      message: 'Face detected successfully!' 
    };
  };

  const detectFace = async () => {
    if (!videoRef.current) return null;
    
    setIsDetectingFace(true);
    setShowRetakePrompt(false);
    
    try {
      if (isFaceApiLoaded) {
        const detections = await faceapi.detectAllFaces(
          videoRef.current, 
          new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }) // Lower scoreThreshold
        ).withFaceLandmarks().withFaceExpressions(); // Add .withFaceExpressions()

        console.log('Face API detections:', detections);

        const qualityResult = validateFaceQuality(detections);
        console.log('Face quality result:', qualityResult);
        setFaceQuality(qualityResult.quality as 'good' | 'poor' | 'none');
        setLastDetectionResult(detections);
        
        if (qualityResult.quality === 'good') {
          const faceImages = await faceapi.extractFaces(videoRef.current, detections.map(d => d.detection));
          
          if (faceImages.length > 0) {
            const faceDescriptor = await faceapi.computeFaceDescriptor(faceImages[0]) as Float32Array;
            faceImages.forEach(canvas => (canvas as any).getContext('2d').clearRect(0, 0, canvas.width, canvas.height));

            setDetectedFaceDescriptor(faceDescriptor);
            setRetakeCount(0);
            showSuccess(`Face detected! Found ${detections.length} face(s). Finding your photos...`);
            
            const recognizedPhotos = recognizeFaces(faceDescriptor, galleryPhotos);
            setPersonalizedPhotos(recognizedPhotos);
            return detections[0];
          } else {
            showError("No face descriptor could be extracted.");
            return null;
          }
        } else {
          setRetakeCount(prev => prev + 1);
          setShowRetakePrompt(true);
          
          if (qualityResult.quality === 'none') {
            showError(qualityResult.message + " Please position your face in front of the camera.");
          } else {
            showError(qualityResult.message + " Please adjust your position and try again.");
          }
          
          if (retakeCount < 2) {
            setTimeout(() => {
              if (showRetakePrompt) {
                detectFace();
              }
            }, 3000);
          }
          
          return null;
        }
      } else {
        console.warn('Face API models not loaded, cannot perform real face detection/recognition.');
        showError("Face detection models not loaded. Cannot find personalized photos.");
        setFaceQuality('none');
        setShowRetakePrompt(true);
        return null;
      }
    } catch (error) {
      console.error("Face detection failed:", error);
      showError("Face detection failed. Please try again.");
      setFaceQuality('none');
      setShowRetakePrompt(true);
      return null;
    } finally {
      setIsDetectingFace(false);
    }
  };

  const recognizeFaces = (queryDescriptor: Float32Array, photosToSearch: PhotoType[]): PhotoType[] => {
    if (!faceMatcher) {
      console.warn("Face matcher not ready.");
      return [];
    }

    const matchedPhotos: PhotoType[] = [];
    const matchedLabels = new Set<string>();

    galleryPhotos.forEach(photo => {
      photo.faces?.forEach(face => {
        const distance = faceapi.euclideanDistance(queryDescriptor, face.descriptor);
        if (distance < 0.5 && !matchedLabels.has(photo.id)) {
          matchedPhotos.push(photo);
          matchedLabels.add(photo.id);
        }
      });
    });
    return matchedPhotos;
  };

  const retakeDetection = () => {
    setShowRetakePrompt(false);
    setRetakeCount(0);
    setFaceQuality('none');
    detectFace();
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const overlay = new Image();
        overlay.src = overlayImageSrc;
        overlay.crossOrigin = "anonymous";

        overlay.onload = () => {
          context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
          
          const dataUrl = canvas.toDataURL('image/png');
          setCapturedPhotos(prevPhotos => [dataUrl, ...prevPhotos]);
          showSuccess("Photo captured!");
        };

        overlay.onerror = () => {
          console.error("Failed to load overlay image for canvas.");
          showError("Could not apply photo frame. Saving photo without it.");
          const dataUrl = canvas.toDataURL('image/png');
          setCapturedPhotos(prevPhotos => [dataUrl, ...prevPhotos]);
        };
      }
    }
  };

  return (
    <div className="p-4 max-w-full mx-auto text-center relative">
      <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-r from-stone-300/20 to-transparent rounded-full blur-lg"></div>
      <div className="absolute bottom-16 left-8 w-32 h-32 bg-gradient-to-r from-stone-400/15 to-transparent rounded-full blur-lg"></div>

      <h1 className="font-heading text-5xl my-8 animate-fade-in bg-gradient-to-r from-stone-700 to-stone-500 bg-clip-text text-transparent">
        Live Photo Booth
      </h1>
      <div className="relative w-full aspect-video bg-gradient-to-br from-stone-200 to-stone-300 rounded-2xl overflow-hidden shadow-2xl mb-6 animate-bounce-in border-4 border-white/50">
        {cameraAccessDenied ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white p-4 text-center">
            <div className="flex flex-col items-center gap-4">
              <VideoOff className="w-12 h-12 text-red-400" />
              <p className="text-lg font-semibold">
                Camera access is denied. Please enable camera permissions in your browser settings to use the Photo Booth.
              </p>
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <img
              ref={overlayRef}
              src={overlayImageSrc}
              alt="Photo frame"
              className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none animate-fade-in"
              crossOrigin="anonymous"
            />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            {goodFacePoseStart !== null && !isPhotoBeingTaken && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200/50"
                      strokeWidth="5"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-green-500"
                      strokeWidth="5"
                      strokeDasharray="283"
                      strokeDashoffset={`calc(283 - (283 * ${Math.min(((Date.now() - goodFacePoseStart) / POSE_HOLD_DURATION) * 100, 100)}) / 100)`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="45"
                      cx="50"
                      cy="50"
                      style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.2s linear' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-3xl drop-shadow-lg">
                    {Math.max(1, Math.ceil((POSE_HOLD_DURATION - (Date.now() - goodFacePoseStart)) / 1000))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="absolute top-4 left-4 w-12 h-12 bg-red-500/20 rounded-full animate-pulse-glow"></div>
        <div className="absolute top-4 right-4 w-8 h-8 bg-green-500/20 rounded-full animate-pulse-glow" style={{animationDelay: '1s'}}></div>
      </div>
      <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-4 mb-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
        <Button
          onClick={takePhoto}
          className={`${buttonClass} font-semibold px-8 py-3 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
        >
          <Camera className="w-5 h-5 mr-2 animate-pulse" />
          Take Photo
        </Button>
        <Button
          onClick={detectFace}
          disabled={isDetectingFace || isModelsLoading || !stream}
          variant="outline"
          className="font-semibold px-6 py-3 hover:scale-105 transition-all duration-300 border-2 hover:border-stone-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isModelsLoading ? <div className="w-5 h-5 mr-2 border-2 border-stone-500 border-t-transparent rounded-full animate-spin"></div> : <Users className="w-5 h-5 mr-2" />}
          {isDetectingFace ? 'Detecting...' : 'Find My Photos'}
        </Button>
        <Button
          onClick={startCamera}
          variant="outline"
          className="font-semibold px-6 py-3 hover:scale-105 transition-all duration-300 border-2 hover:border-stone-400"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Restart Camera
        </Button>
      </div>

      {isDetectingFace && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-700 font-medium">Detecting your face and finding personalized photos...</span>
          </div>
        </div>
      )}

      {showRetakePrompt && !isDetectingFace && (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-lg animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              {faceQuality === 'none' ? 'No Face Detected' : 'Face Quality Issue'}
            </h3>
            <p className="text-amber-700 mb-4">
              {faceQuality === 'none' 
                ? 'Please position your face in front of the camera and try again.'
                : 'Please adjust your position for better face detection quality.'
              }
            </p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={retakeDetection}
                className={`${buttonClass} font-semibold px-6 py-2 hover:scale-105 transition-all duration-300`}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retake Detection
              </Button>
              <Button
                onClick={() => setShowRetakePrompt(false)}
                variant="outline"
                className="font-semibold px-6 py-2 hover:scale-105 transition-all duration-300 border-2 border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Cancel
              </Button>
            </div>
            {retakeCount > 0 && (
              <p className="text-sm text-amber-600 mt-3">
                Attempt {retakeCount + 1} of 3
              </p>
            )}
          </div>
        </div>
      )}

      {faceQuality !== 'none' && !showRetakePrompt && (
        <div className={`mb-6 p-4 rounded-lg animate-fade-in ${
          faceQuality === 'good' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center justify-center gap-3">
            <div className={`w-4 h-4 rounded-full ${
              faceQuality === 'good' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className={`font-medium ${
              faceQuality === 'good' ? 'text-green-700' : 'text-red-700'
            }`}>
              {faceQuality === 'good' ? 'Face detected successfully!' : 'Face quality needs improvement'}
            </span>
          </div>
        </div>
      )}

      {detectedFaceDescriptor && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="flex items-center justify-center gap-3">
            <Heart className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">We found {personalizedPhotos.length} photos with you in them.</span>
          </div>
        </div>
      )}

      {capturedPhotos.length > 0 && (
        <div className="animate-fade-in" style={{animationDelay: '0.7s'}}>
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-stone-700 to-stone-500 bg-clip-text text-transparent">
            Your Captured Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {capturedPhotos.map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-xl overflow-hidden shadow-lg cursor-hover hover:scale-105 transition-all duration-300 group animate-bounce-in"
                style={{animationDelay: `${0.8 + (index * 0.1)}s`}}
              >
                <img
                  src={photo}
                  alt={`Captured photo ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold text-stone-700">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="animate-fade-in" style={{animationDelay: '0.8s'}}>
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <h2 className="text-3xl font-heading mb-2" style={{ color: primaryColor }}>
              Photos with You
            </h2>
            <p className="text-gray-600 text-sm">Discover photos from the wedding where you appear</p>
          </div>
          <Button
            onClick={() => setShowPersonalizedPhotos(!showPersonalizedPhotos)}
            className={`${buttonClass} font-semibold px-6 py-3 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
          >
            <Users className="w-4 h-4 mr-2" />
            {showPersonalizedPhotos ? 'Hide' : 'Show'} Your Photos
          </Button>
        </div>

        {showPersonalizedPhotos && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personalizedPhotos.map((photo, index) => (
              <Card
                key={photo.id}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 animate-bounce-in border-2 border-transparent hover:border-stone-300 bg-white/95 backdrop-blur-sm"
                style={{
                  animationDelay: `${0.9 + (index * 0.1)}s`,
                  borderColor: `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.2)`
                }}
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={photo.thumbnail}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {photo.faces && photo.faces.some(face => face.personName === 'You') && (
                    <div 
                      className="absolute top-2 right-2 backdrop-blur-sm rounded-full p-2 shadow-lg"
                      style={{ backgroundColor: `${primaryColor}CC` }}
                    >
                      <Heart className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      className="bg-white/95 hover:bg-white text-stone-700 shadow-lg border border-stone-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        showSuccess("Photo download started!");
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1" style={{ color: primaryColor }}>
                      {photo.title}
                    </h3>
                    <Badge 
                      variant="secondary" 
                      className="text-xs ml-2"
                      style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                    >
                      {photo.faces?.length || 0} people
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{photo.description}</p>
                  
                  {photo.faces && photo.faces.length > 0 && (
                    <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: `${primaryColor}10` }}>
                      <div className="flex items-center gap-1 text-xs font-medium" style={{ color: primaryColor }}>
                        <Heart className="w-3 h-3" />
                        <span>You're in this photo!</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {photo.tags.slice(0, 2).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="outline" 
                        className="text-xs"
                        style={{ borderColor: `${primaryColor}40`, color: primaryColor }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showPersonalizedPhotos && personalizedPhotos.length === 0 && !isDetectingFace && (
          <div className="text-center py-12">
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Heart className="w-8 h-8" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: primaryColor }}>
              No personalized photos found
            </h3>
            <p className="text-gray-600">
              We couldn't find any photos matching your face in the gallery.
              Please ensure your face is clear and well-lit, and try again.
            </p>
            <Button
              onClick={detectFace}
              disabled={isDetectingFace}
              className={`${buttonClass} mt-4 font-semibold px-6 py-2`}
            >
              <Users className="w-4 h-4 mr-2" />
              Try Face Detection Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoBooth;
