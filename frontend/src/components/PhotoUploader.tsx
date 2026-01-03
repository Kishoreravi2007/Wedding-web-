/**
 * Photo Uploader Component for Photographers
 * 
 * This component allows photographers to upload event photos
 * and automatically extract face embeddings for the face search feature.
 * 
 * Features:
 * - Batch photo upload to Supabase storage
 * - Automatic face detection and embedding extraction
 * - Metadata storage in database
 * - Progress tracking and error handling
 */

import React, { useRef, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Users,
  Database
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const DEEPFACE_API_URL = import.meta.env.VITE_DEEPFACE_API_URL || 'http://localhost:8002';

interface UploadProgress {
  filename: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  faceCount?: number;
  photoId?: string;
}

interface PhotoUploaderProps {
  eventId?: string;
  className?: string;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  eventId = 'wedding-event',
  className = ''
}) => {
  // Refs and state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [totalProgress, setTotalProgress] = useState(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // DeepFace models are handled on the server
  React.useEffect(() => {
    setIsModelLoaded(true);
  }, []);

  // Extract face embeddings from image using DeepFace API
  const extractFaceEmbeddings = useCallback(async (file: File): Promise<any[]> => {
    try {
      console.log('🔍 Extracting face embeddings via DeepFace API...');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('detector_backend', 'yolov8');

      const response = await axios.post(`${DEEPFACE_API_URL}/api/faces/detect`, formData);
      const { faces } = response.data;

      console.log(`✅ Extracted ${faces?.length || 0} face embeddings`);
      return faces || [];
    } catch (error) {
      console.error('❌ Error extracting face embeddings:', error);
      throw error;
    }
  }, []);

  // Process a single photo
  const processPhoto = useCallback(async (file: File, index: number): Promise<void> => {
    const filename = file.name;

    try {
      // Update progress to uploading
      setUploadProgress(prev => prev.map((item, i) =>
        i === index ? { ...item, status: 'uploading', progress: 0 } : item
      ));

      // Update progress to processing
      setUploadProgress(prev => prev.map((item, i) =>
        i === index ? { ...item, status: 'processing', progress: 25 } : item
      ));

      // Extract face embeddings via DeepFace API
      const detectedFaces = await extractFaceEmbeddings(file);

      // Update progress
      setUploadProgress(prev => prev.map((item, i) =>
        i === index ? { ...item, progress: 50 } : item
      ));

      // Upload to backend API with face descriptors
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('sister', eventId === 'sister-a' ? 'sister-a' : 'sister-b');
      formData.append('title', filename);
      formData.append('eventType', 'wedding');
      formData.append('tags', JSON.stringify([]));

      // Add face descriptors if any
      if (detectedFaces.length > 0) {
        const faceDescriptors = detectedFaces.map((face: any) => ({
          descriptor: face.embedding,
          boundingBox: {
            x: face.bbox[0],
            y: face.bbox[1],
            width: face.bbox[2],
            height: face.bbox[3]
          },
          confidence: face.det_score
        }));
        formData.append('faces', JSON.stringify(faceDescriptors));
      }

      // Get authentication token
      const token = localStorage.getItem('accessToken');

      const response = await axios.post(`${BACKEND_URL}/api/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const photoData = response.data;

      // Update progress to completed
      setUploadProgress(prev => prev.map((item, i) =>
        i === index ? {
          ...item,
          status: 'completed',
          progress: 100,
          faceCount: faceEmbeddings.length,
          photoId: photoData.id
        } : item
      ));

      console.log(`✅ Successfully processed ${filename} with ${faceEmbeddings.length} faces`);

    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error);

      setUploadProgress(prev => prev.map((item, i) =>
        i === index ? {
          ...item,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } : item
      ));
    }
  }, [eventId, extractFaceEmbeddings]);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        errors.push(`${file.name}: File too large (max 10MB)`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(`Validation errors:\n${errors.join('\n')}`);
    }

    if (validFiles.length === 0) return;

    // Initialize progress tracking
    const progress: UploadProgress[] = validFiles.map(file => ({
      filename: file.name,
      status: 'pending',
      progress: 0
    }));

    setUploadProgress(progress);
    setError('');
    setSuccess('');
  }, []);

  // Start upload process
  const startUpload = useCallback(async () => {
    if (uploadProgress.length === 0) return;

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const files = fileInputRef.current?.files;
      if (!files) return;

      const fileArray = Array.from(files);

      // Process files sequentially to avoid overwhelming the system
      for (let i = 0; i < fileArray.length; i++) {
        await processPhoto(fileArray[i], i);

        // Update total progress
        const completed = uploadProgress.filter(p => p.status === 'completed').length + 1;
        setTotalProgress((completed / fileArray.length) * 100);
      }

      const completedCount = uploadProgress.filter(p => p.status === 'completed').length;
      const errorCount = uploadProgress.filter(p => p.status === 'error').length;

      if (completedCount > 0) {
        setSuccess(`Successfully processed ${completedCount} photos! ${errorCount > 0 ? `${errorCount} failed.` : ''}`);
      }

      if (errorCount > 0 && completedCount === 0) {
        setError('All photos failed to process. Please check the errors and try again.');
      }

    } catch (error) {
      console.error('❌ Upload process failed:', error);
      setError('Upload process failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [uploadProgress, processPhoto]);

  // Clear uploads
  const clearUploads = useCallback(() => {
    setUploadProgress([]);
    setTotalProgress(0);
    setError('');
    setSuccess('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={`w-full max-w-4xl mx-auto p-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Upload Event Photos
          </CardTitle>
          <p className="text-gray-600">
            Upload wedding photos to enable face search for guests
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Model Status */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isModelLoaded ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-sm">
              {isModelLoaded ? 'Face detection ready' : 'Loading face detection models...'}
            </span>
          </div>

          {/* File Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="photo-upload" className="text-base font-medium">
                Select Photos to Upload
              </label>
              <input
                ref={fileInputRef}
                id="photo-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="w-full p-2 border border-gray-300 rounded-lg cursor-pointer"
                disabled={!isModelLoaded || isUploading}
              />
              <p className="text-sm text-gray-500">
                Select multiple photos (JPG, PNG, WebP). Max 10MB per file.
              </p>
            </div>

            {/* Upload Controls */}
            {uploadProgress.length > 0 && (
              <div className="flex gap-3">
                <Button
                  onClick={startUpload}
                  disabled={!isModelLoaded || isUploading}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isUploading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Start Upload
                    </div>
                  )}
                </Button>

                <Button
                  onClick={clearUploads}
                  variant="outline"
                  disabled={isUploading}
                >
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Progress Tracking */}
          {uploadProgress.length > 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{Math.round(totalProgress)}%</span>
                </div>
                <Progress value={totalProgress} className="w-full" />
              </div>

              {/* Individual File Progress */}
              <div className="space-y-2">
                {uploadProgress.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {item.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                      {item.status === 'processing' && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
                      {item.status === 'uploading' && <Upload className="w-5 h-5 text-blue-500" />}
                      {item.status === 'pending' && <ImageIcon className="w-5 h-5 text-gray-400" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{item.filename}</span>
                        <span className="text-sm text-gray-600">{Math.round(item.progress)}%</span>
                      </div>

                      <div className="mt-1">
                        <Progress value={item.progress} className="w-full h-2" />
                      </div>

                      {item.faceCount !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <Users className="w-3 h-3 text-green-500" />
                          <span className="text-xs text-green-600">
                            {item.faceCount} face{item.faceCount !== 1 ? 's' : ''} detected
                          </span>
                        </div>
                      )}

                      {item.error && (
                        <p className="text-xs text-red-600 mt-1">{item.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-700 font-medium">Error</span>
              </div>
              <p className="text-red-600 mt-1 whitespace-pre-line">{error}</p>
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

          {/* Tips */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Tips for Best Results:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload high-quality photos with clear faces</li>
              <li>• Include photos from different angles and lighting</li>
              <li>• Process photos in batches for better performance</li>
              <li>• Ensure good lighting in the original photos</li>
              <li>• Photos will be automatically processed for face detection</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhotoUploader;
