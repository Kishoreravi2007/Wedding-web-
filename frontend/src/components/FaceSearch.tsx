/**
 * Face Search Component
 * 
 * This component allows guests to upload a selfie and find matching photos
 * from the wedding event using face-api.js face recognition.
 * 
 * Features:
 * - Upload selfie for face detection
 * - Extract face embeddings using face-api.js
 * - Compare with stored event photo embeddings
 * - Display matching photos with confidence scores
 * - Responsive gallery layout
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Search, 
  Upload, 
  Camera, 
  Users, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Download,
  Eye
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

interface FaceMatch {
  id: string;
  photoUrl: string;
  confidence: number;
  metadata: {
    filename: string;
    uploadedAt: string;
    eventId?: string;
  };
}

interface FaceSearchProps {
  className?: string;
  eventId?: string;
}

const FaceSearch: React.FC<FaceSearchProps> = ({ 
  className = '', 
  eventId = 'wedding-event' 
}) => {
  // Refs for file input and canvas
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State management
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchResults, setSearchResults] = useState<FaceMatch[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedFace, setDetectedFace] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('🔄 Loading face-api.js models for face search...');
        
        // Load all required models for face recognition
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
          faceapi.nets.faceExpressionNet.loadFromUri('/models')
        ]);
        
        console.log('✅ Face search models loaded successfully');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('❌ Error loading face search models:', error);
        setError('Failed to load face detection models. Please refresh the page.');
      }
    };

    loadModels();
  }, []);

  // Extract face descriptor from image
  const extractFaceDescriptor = useCallback(async (imageElement: HTMLImageElement): Promise<Float32Array | null> => {
    if (!isModelLoaded) {
      setError('Face detection models are still loading. Please wait...');
      return null;
    }

    try {
      console.log('🔍 Extracting face descriptor...');
      
      // Detect face and extract descriptor
      const detection = await faceapi
        .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        console.log('✅ Face descriptor extracted successfully');
        return detection.descriptor;
      } else {
        console.log('⚠️ No face detected in the image');
        setError('No face detected in the uploaded image. Please ensure your face is clearly visible.');
        return null;
      }
    } catch (error) {
      console.error('❌ Error extracting face descriptor:', error);
      setError('Failed to extract face features. Please try again.');
      return null;
    }
  }, [isModelLoaded]);

  // Calculate face similarity using cosine similarity
  const calculateSimilarity = useCallback((descriptor1: Float32Array, descriptor2: Float32Array): number => {
    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < descriptor1.length; i++) {
      dotProduct += descriptor1[i] * descriptor2[i];
      norm1 += descriptor1[i] * descriptor1[i];
      norm2 += descriptor2[i] * descriptor2[i];
    }

    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    return Math.max(0, similarity); // Ensure non-negative similarity
  }, []);

  // Search for matching faces in stored photos
  const searchForMatches = useCallback(async (queryDescriptor: Float32Array) => {
    try {
      console.log('🔍 Searching for matching faces...');
      setIsSearching(true);
      setError('');
      setSuccess('');

      // Convert Float32Array to regular array
      const descriptorArray = Array.from(queryDescriptor);

      // Call backend API for face matching
      const response = await axios.post(`${BACKEND_URL}/api/faces/find-similar`, {
        descriptor: descriptorArray,
        limit: 50,
        threshold: 0.6
      });

      const { faces } = response.data;

      if (!faces || faces.length === 0) {
        setError('No matching photos found. Try uploading a clearer photo with your face clearly visible.');
        setSearchResults([]);
        return;
      }

      console.log(`✅ Found ${faces.length} matching photos from backend`);

      // Get photos for the matched faces
      const photoIds = [...new Set(faces.map((face: any) => face.photo_id))];
      
      // Fetch photo details
      const photoPromises = photoIds.map(async (photoId: string) => {
        try {
          const photoResponse = await axios.get(`${BACKEND_URL}/api/photos/${photoId}`);
          return photoResponse.data;
        } catch (error) {
          console.error(`Error fetching photo ${photoId}:`, error);
          return null;
        }
      });

      const photos = (await Promise.all(photoPromises)).filter(p => p !== null);

      // Map to FaceMatch format
      const matches: FaceMatch[] = photos.map((photo: any) => {
        // Find the face match for this photo
        const face = faces.find((f: any) => f.photo_id === photo.id);
        
        return {
          id: photo.id,
          photoUrl: photo.public_url,
          confidence: face?.similarity || 0.7,
          metadata: {
            filename: photo.filename,
            uploadedAt: photo.created_at || photo.uploaded_at,
            eventId: photo.sister
          }
        };
      });

      // Sort matches by confidence (highest first)
      matches.sort((a, b) => b.confidence - a.confidence);

      console.log(`✅ Displaying ${matches.length} matching photos`);
      setSearchResults(matches);
      
      if (matches.length > 0) {
        setSuccess(`Found ${matches.length} matching photos!`);
      } else {
        setError('No matching photos found. Try uploading a clearer photo of your face.');
      }

    } catch (error) {
      console.error('❌ Error during face search:', error);
      setError('Face search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [eventId, calculateSimilarity]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please select an image smaller than 10MB.');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');

      // Create image element
      const img = new Image();
      img.onload = async () => {
        try {
          // Display uploaded image
          const imageUrl = URL.createObjectURL(file);
          setUploadedImage(imageUrl);

          // Extract face descriptor
          const descriptor = await extractFaceDescriptor(img);
          
          if (descriptor) {
            setDetectedFace({ descriptor, image: img });
            setSuccess('Face detected! Click "Search Photos" to find matches.');
          }
        } catch (error) {
          console.error('❌ Error processing uploaded image:', error);
          setError('Failed to process the uploaded image. Please try again.');
        } finally {
          setIsUploading(false);
        }
      };

      img.onerror = () => {
        setError('Failed to load the uploaded image. Please try again.');
        setIsUploading(false);
      };

      img.src = URL.createObjectURL(file);

    } catch (error) {
      console.error('❌ Error handling file upload:', error);
      setError('Failed to upload image. Please try again.');
      setIsUploading(false);
    }
  }, [extractFaceDescriptor]);

  // Start face search
  const startSearch = useCallback(async () => {
    if (!detectedFace) {
      setError('Please upload a photo with your face first.');
      return;
    }

    await searchForMatches(detectedFace.descriptor);
  }, [detectedFace, searchForMatches]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setUploadedImage(null);
    setDetectedFace(null);
    setError('');
    setSuccess('');
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Download photo
  const downloadPhoto = useCallback(async (photoUrl: string, filename: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('❌ Error downloading photo:', error);
      setError('Failed to download photo. Please try again.');
    }
  }, []);

  return (
    <div className={`w-full max-w-6xl mx-auto p-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-6 h-6" />
            Find Your Photos
          </CardTitle>
          <p className="text-gray-600">
            Upload a selfie to find photos of yourself from the wedding event
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Model Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              {isModelLoaded ? 'Face recognition ready' : 'Loading face recognition models...'}
            </span>
          </div>

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="selfie-upload" className="text-base font-medium">
                Upload Your Selfie
              </Label>
              <Input
                ref={fileInputRef}
                id="selfie-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
                disabled={!isModelLoaded || isUploading}
              />
              <p className="text-sm text-gray-500">
                Upload a clear photo of your face. Supported formats: JPG, PNG, WebP (max 10MB)
              </p>
            </div>

            {/* Uploaded Image Preview */}
            {uploadedImage && (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Uploaded selfie"
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
                {detectedFace && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Face Detected
                  </div>
                )}
              </div>
            )}

            {/* Search Button */}
            {detectedFace && (
              <Button
                onClick={startSearch}
                disabled={isSearching}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching Photos...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Search Photos
                  </div>
                )}
              </Button>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-700 font-medium">Success</span>
              </div>
              <p className="text-green-600 mt-1">{success}</p>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Found {searchResults.length} Matching Photos
                </h3>
                <Button
                  onClick={clearSearch}
                  variant="outline"
                  size="sm"
                >
                  Clear Results
                </Button>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((match, index) => (
                  <Card key={match.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={match.photoUrl}
                        alt={`Match ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {(match.confidence * 100).toFixed(1)}% Match
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {match.metadata.filename}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(match.metadata.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => downloadPhoto(match.photoUrl, match.metadata.filename)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          
                          <Button
                            onClick={() => window.open(match.photoUrl, '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tips for Better Results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload a clear, well-lit photo of your face</li>
              <li>• Look directly at the camera</li>
              <li>• Ensure your face is centered in the image</li>
              <li>• Avoid sunglasses or face coverings</li>
              <li>• Use a recent photo for best matching</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceSearch;
