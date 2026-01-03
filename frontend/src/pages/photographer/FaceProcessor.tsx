/**
 * Face Descriptor Processor
 * 
 * Tool for photographers to process existing photos and extract face descriptors
 * This enables the "Find My Photos" feature to work accurately
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, Loader2, Users } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

const DEEPFACE_API_URL = import.meta.env.VITE_DEEPFACE_API_URL || 'http://localhost:8002';

const FaceProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [photos, setPhotos] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [currentPhoto, setCurrentPhoto] = useState('');
  const [results, setResults] = useState<{
    processed: number;
    faces_found: number;
    errors: number;
  }>({
    processed: 0,
    faces_found: 0,
    errors: 0
  });
  const [stats, setStats] = useState<any>(null);

  // DeepFace API is external, no models to load here
  useEffect(() => {
    setModelsLoaded(true);
  }, []);

  const loadFaceModels = async () => {
    setModelsLoaded(true);
  };

  // Fetch photos
  const fetchPhotos = async () => {
    try {
      const [sisterARes, sisterBRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/photos?sister=sister-a`),
        fetch(`${API_BASE_URL}/api/photos?sister=sister-b`)
      ]);

      const sisterAData = await sisterARes.json();
      const sisterBData = await sisterBRes.json();

      const sisterAPhotos = Array.isArray(sisterAData) ? sisterAData : (sisterAData.photos || []);
      const sisterBPhotos = Array.isArray(sisterBData) ? sisterBData : (sisterBData.photos || []);

      const allPhotos = [...sisterAPhotos, ...sisterBPhotos];

      setPhotos(allPhotos);
      console.log(`Loaded ${allPhotos.length} photos for processing`);
    } catch (error) {
      console.error('Error fetching photos:', error);
      alert('Failed to fetch photos');
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/process-faces/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Process all photos
  const processAllPhotos = async () => {
    if (!modelsLoaded) {
      alert('Face detection models are still loading. Please wait...');
      return;
    }

    if (photos.length === 0) {
      await fetchPhotos();
      setTimeout(() => processAllPhotos(), 1000);
      return;
    }

    setIsProcessing(true);
    setResults({ processed: 0, faces_found: 0, errors: 0 });
    setProgress(0);

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      setCurrentPhoto(photo.filename);
      setProgress(((i + 1) / photos.length) * 100);

      try {
        // Fetch image as blob for DeepFace API
        const imgRes = await fetch(photo.public_url);
        const imgBlob = await imgRes.blob();

        const formData = new FormData();
        formData.append('file', imgBlob, photo.filename);
        formData.append('detector_backend', 'yolov8');

        // Detect faces and extract 4096-dim descriptors via DeepFace API
        const detectRes = await axios.post(`${DEEPFACE_API_URL}/api/faces/detect`, formData);
        const { faces: detectedFaces } = detectRes.data;

        console.log(`${photo.filename}: Found ${detectedFaces?.length || 0} face(s) via DeepFace`);

        if (detectedFaces && detectedFaces.length > 0) {
          // Prepare face data (DeepFace returns bbox as [x, y, w, h])
          const faces = detectedFaces.map((face: any) => ({
            descriptor: face.embedding,
            boundingBox: {
              x: face.bbox[0],
              y: face.bbox[1],
              width: face.bbox[2],
              height: face.bbox[3]
            },
            confidence: face.det_score
          }));

          // Send to backend
          const response = await fetch(`${API_BASE_URL}/api/process-faces/store-descriptors`, {
            method: 'POST',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              photo_id: photo.id,
              faces: faces
            })
          });

          if (response.ok) {
            setResults(prev => ({
              ...prev,
              processed: prev.processed + 1,
              faces_found: prev.faces_found + detections.length
            }));
          } else {
            throw new Error('Failed to store descriptors');
          }
        } else {
          setResults(prev => ({
            ...prev,
            processed: prev.processed + 1
          }));
        }

      } catch (error) {
        console.error(`Error processing ${photo.filename}:`, error);
        setResults(prev => ({
          ...prev,
          errors: prev.errors + 1
        }));
      }

      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsProcessing(false);
    setCurrentPhoto('');
    alert('Processing complete! Face descriptors have been extracted.');
    fetchStats();
  };

  useEffect(() => {
    fetchPhotos();
    fetchStats();
    checkAndAutoProcess();
  }, []);

  // Auto-process photos if they need processing
  const checkAndAutoProcess = async () => {
    try {
      // Check if auto-processing is needed
      const response = await fetch(`${API_BASE_URL}/api/auto-face-detection/status`);
      const data = await response.json();

      if (data.needsProcessing && data.unprocessedCount > 0) {
        console.log(`🤖 Auto-processing ${data.unprocessedCount} unprocessed photos...`);

        // Wait for models to load before auto-processing
        const checkModels = setInterval(() => {
          if (modelsLoaded && !isProcessing) {
            clearInterval(checkModels);
            console.log('🚀 Starting automatic face detection...');
            processAllPhotos();
          }
        }, 1000);

        // Timeout after 30 seconds if models don't load
        setTimeout(() => {
          clearInterval(checkModels);
        }, 30000);
      } else {
        console.log('✅ All photos already have face descriptors');
      }
    } catch (error) {
      console.error('Error checking auto-process status:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Face Descriptor Processor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">What does this do?</h4>
            <p className="text-sm text-blue-800">
              This tool extracts face descriptors from all uploaded photos, enabling the "Find My Photos" feature.
              Guests will be able to take a selfie and see only photos containing their face!
            </p>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{stats.total_photos}</div>
                <div className="text-sm text-gray-600">Total Photos</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.photos_with_faces}</div>
                <div className="text-sm text-gray-600">With Faces</div>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">{stats.photos_without_faces}</div>
                <div className="text-sm text-gray-600">Need Processing</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.coverage_percent}%</div>
                <div className="text-sm text-gray-600">Coverage</div>
              </div>
            </div>
          )}

          {/* Model Loading Status */}
          {loadingModels && (
            <div className="bg-yellow-50 p-4 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-yellow-600" />
              <span className="text-yellow-800">Loading face detection models...</span>
            </div>
          )}

          {modelsLoaded && !isProcessing && (
            <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Face detection models ready! You can start processing.</span>
            </div>
          )}

          {/* Processing Controls */}
          <div className="space-y-4">
            <Button
              onClick={processAllPhotos}
              disabled={!modelsLoaded || isProcessing || loadingModels}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing... ({results.processed} of {photos.length})
                </>
              ) : (
                `Process ${photos.length} Photos`
              )}
            </Button>

            {/* Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {currentPhoto}
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{results.processed}</div>
                    <div className="text-xs text-gray-600">Processed</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{results.faces_found}</div>
                    <div className="text-xs text-gray-600">Faces Found</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">{results.errors}</div>
                    <div className="text-xs text-gray-600">Errors</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-gray-900">Instructions:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Click "Process Photos" to start</li>
              <li>Wait while the system analyzes all photos (may take 5-10 minutes)</li>
              <li>Face descriptors will be extracted and saved</li>
              <li>Once complete, "Find My Photos" will work accurately!</li>
              <li>You only need to run this once (or when new photos are uploaded)</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Note:</strong> Keep this page open while processing. Don't close the browser tab or the process will stop.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceProcessor;

