/**
 * Enhanced Photo Upload Component with Automatic Face Detection
 * 
 * Provides robust photo upload functionality with:
 * - Automatic face detection using face-api.js
 * - Batch upload support
 * - Real-time processing feedback
 * - Quality validation
 * - Error handling and retry logic
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  Loader2,
  ImageIcon,
  FileWarning
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { showSuccess, showError } from '@/utils/toast';

interface PhotoUploadEnhancedProps {
  sister: 'sister-a' | 'sister-b';
  onUploadComplete?: (results: any) => void;
  enableBatchUpload?: boolean;
  maxFiles?: number;
}

interface FileWithPreview extends File {
  preview?: string;
  faceData?: {
    descriptors: any[];
    detectedCount: number;
    error?: string;
  };
  uploadStatus?: 'pending' | 'detecting' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

const MODEL_URL = '/models';
let modelsLoaded = false;

const PhotoUploadEnhanced: React.FC<PhotoUploadEnhancedProps> = ({
  sister,
  onUploadComplete,
  enableBatchUpload = true,
  maxFiles = 20
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [eventType, setEventType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load face detection models
  useEffect(() => {
    const loadModels = async () => {
      if (modelsLoaded) {
        setModelsReady(true);
        return;
      }
      
      setModelsLoading(true);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.load(MODEL_URL),
          faceapi.nets.faceLandmark68Net.load(MODEL_URL),
          faceapi.nets.faceRecognitionNet.load(MODEL_URL),
          faceapi.nets.faceExpressionNet.load(MODEL_URL)
        ]);
        modelsLoaded = true;
        setModelsReady(true);
        console.log('Face detection models loaded successfully');
      } catch (error) {
        console.error('Error loading face detection models:', error);
        showError('Failed to load face detection models');
      } finally {
        setModelsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (selectedFiles.length + files.length > maxFiles) {
      showError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const validFiles = selectedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        showError(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 20 * 1024 * 1024) {
        showError(`${file.name} is too large (max 20MB)`);
        return false;
      }
      return true;
    });

    const filesWithPreviews: FileWithPreview[] = validFiles.map(file => {
      const preview = URL.createObjectURL(file);
      return Object.assign(file, { 
        preview,
        uploadStatus: 'pending' as const
      });
    });

    setFiles(prev => [...prev, ...filesWithPreviews]);
    
    // Auto-detect faces
    if (modelsReady) {
      detectFacesInFiles(filesWithPreviews);
    }
  };

  // Detect faces in uploaded images
  const detectFacesInFiles = async (filesToDetect: FileWithPreview[]) => {
    setDetecting(true);
    
    for (const file of filesToDetect) {
      try {
        file.uploadStatus = 'detecting';
        setFiles(prev => [...prev]);

        const img = await createImageFromFile(file);
        
        const detections = await faceapi
          .detectAllFaces(img, new faceapi.TinyFaceDetectorOptions({ 
            scoreThreshold: 0.3 
          }))
          .withFaceLandmarks()
          .withFaceDescriptors();

        console.log(`Detected ${detections.length} faces in ${file.name}`);

        // Validate and extract face data
        const faceDescriptors = detections.map((detection, index) => {
          const box = detection.detection.box;
          
          // Calculate face size relative to image
          const faceArea = (box.width * box.height) / (img.width * img.height);
          
          return {
            descriptor: Array.from(detection.descriptor),
            boundingBox: {
              x: (box.x / img.width) * 100,
              y: (box.y / img.height) * 100,
              width: (box.width / img.width) * 100,
              height: (box.height / img.height) * 100
            },
            quality: faceArea >= 0.02 ? 'good' : 'poor',
            landmarks: detection.landmarks,
            detection: detection.detection
          };
        });

        file.faceData = {
          descriptors: faceDescriptors,
          detectedCount: detections.length
        };
        
        file.uploadStatus = 'pending';
        setFiles(prev => [...prev]);

      } catch (error) {
        console.error(`Error detecting faces in ${file.name}:`, error);
        file.faceData = {
          descriptors: [],
          detectedCount: 0,
          error: error instanceof Error ? error.message : 'Detection failed'
        };
        file.uploadStatus = 'pending';
        setFiles(prev => [...prev]);
      }
    }
    
    setDetecting(false);
  };

  // Helper to create image from file
  const createImageFromFile = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  // Remove file from list
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // Upload files
  const handleUpload = async () => {
    if (files.length === 0) {
      showError('Please select at least one photo');
      return;
    }

    if (!eventType) {
      showError('Please select an event type');
      return;
    }

    setUploading(true);
    setProgress(0);

    const results = {
      successful: 0,
      failed: 0,
      details: [] as any[]
    };

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      file.uploadStatus = 'uploading';
      setFiles(prev => [...prev]);

      try {
        const formData = new FormData();
        formData.append('photo', file);
        formData.append('sister', sister);
        formData.append('eventType', eventType);
        formData.append('title', file.name);
        
        // Add face descriptors if available
        if (file.faceData && file.faceData.descriptors.length > 0) {
          formData.append('faceDescriptors', JSON.stringify(file.faceData.descriptors));
        }

        const response = await fetch(`${API_BASE_URL}/api/photos-enhanced/upload`, {
          method: 'POST',
          headers: getAuthHeaders(false), // Don't include Content-Type for FormData
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Upload failed');
        }

        const data = await response.json();
        
        file.uploadStatus = 'success';
        results.successful++;
        results.details.push({
          filename: file.name,
          success: true,
          photoId: data.photo.id,
          facesDetected: file.faceData?.detectedCount || 0,
          faceProcessing: data.faceProcessing
        });

      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        file.uploadStatus = 'error';
        file.uploadError = error instanceof Error ? error.message : 'Upload failed';
        results.failed++;
        results.details.push({
          filename: file.name,
          success: false,
          error: file.uploadError
        });
      }

      setFiles(prev => [...prev]);
      setProgress(((i + 1) / files.length) * 100);
    }

    setUploading(false);

    // Show results
    if (results.successful > 0) {
      showSuccess(`Successfully uploaded ${results.successful} photo(s)`);
    }
    if (results.failed > 0) {
      showError(`Failed to upload ${results.failed} photo(s)`);
    }

    // Callback
    if (onUploadComplete) {
      onUploadComplete(results);
    }

    // Clear successful uploads
    setFiles(prev => prev.filter(f => f.uploadStatus === 'error'));
    if (results.failed === 0) {
      setEventType('');
    }
  };

  // Retry failed uploads
  const retryFailed = () => {
    const failedFiles = files.filter(f => f.uploadStatus === 'error');
    failedFiles.forEach(f => {
      f.uploadStatus = 'pending';
      f.uploadError = undefined;
    });
    setFiles(prev => [...prev]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Enhanced Photo Upload with Face Detection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Model Loading Status */}
        {modelsLoading && (
          <Alert>
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>
              Loading face detection models...
            </AlertDescription>
          </Alert>
        )}

        {modelsReady && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Face detection ready - photos will be automatically analyzed
            </AlertDescription>
          </Alert>
        )}

        {/* Event Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="eventType">Event Type *</Label>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger id="eventType">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="engagement">Engagement</SelectItem>
              <SelectItem value="mehendi">Mehendi</SelectItem>
              <SelectItem value="sangeet">Sangeet</SelectItem>
              <SelectItem value="ceremony">Wedding Ceremony</SelectItem>
              <SelectItem value="reception">Reception</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Select Photos</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              multiple={enableBatchUpload}
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading || detecting}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || detecting}
              className="mx-auto"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {enableBatchUpload ? 'Select Photos' : 'Select Photo'}
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              {enableBatchUpload 
                ? `Upload up to ${maxFiles} photos at once`
                : 'Upload one photo'
              }
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Max file size: 20MB • Supported: JPG, PNG, WEBP
            </p>
          </div>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Photos ({files.length})</Label>
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Preview */}
                  {file.preview && (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* Face Detection Status */}
                    {file.faceData && (
                      <div className="flex items-center gap-2 mt-1">
                        <Users className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-600">
                          {file.faceData.detectedCount} face(s) detected
                        </span>
                      </div>
                    )}
                    
                    {file.faceData?.error && (
                      <div className="flex items-center gap-2 mt-1">
                        <AlertCircle className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-orange-600">
                          {file.faceData.error}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    {file.uploadStatus === 'detecting' && (
                      <Badge variant="outline" className="text-blue-600">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Detecting
                      </Badge>
                    )}
                    {file.uploadStatus === 'uploading' && (
                      <Badge variant="outline" className="text-purple-600">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Uploading
                      </Badge>
                    )}
                    {file.uploadStatus === 'success' && (
                      <Badge className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Success
                      </Badge>
                    )}
                    {file.uploadStatus === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Failed
                      </Badge>
                    )}

                    {/* Remove Button */}
                    {!uploading && file.uploadStatus !== 'uploading' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Upload Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || detecting || !eventType}
            className="flex-1"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {files.length > 0 && `(${files.length})`}
              </>
            )}
          </Button>

          {files.some(f => f.uploadStatus === 'error') && (
            <Button
              onClick={retryFailed}
              disabled={uploading}
              variant="outline"
            >
              Retry Failed
            </Button>
          )}
        </div>

        {/* Detection Status */}
        {detecting && (
          <Alert>
            <Loader2 className="w-4 h-4 animate-spin" />
            <AlertDescription>
              Analyzing photos for face detection...
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoUploadEnhanced;

