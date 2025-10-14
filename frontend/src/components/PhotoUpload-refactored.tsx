"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Upload,
  X,
  Camera,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  Scan
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadPhoto, PhotoUploadData, FaceData } from '@/services/photoService';
import { detectFacesInFile, matchFace, getPeople, Person } from '@/services/faceRecognitionService';

interface DetectedFace {
  descriptor: Float32Array;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
  personId?: string;
  personName?: string;
  matchConfidence?: number;
}

interface PhotoFile {
  file: File;
  preview: string;
  title: string;
  description: string;
  eventType: string;
  tags: string[];
  destinationGallery: 'sister-a-gallery' | 'sister-b-gallery';
  faces: DetectedFace[];
  status: 'pending' | 'detecting' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  id: string;
}

interface PhotoUploadProps {
  onPhotosUploaded?: (photos: any[]) => void;
  className?: string;
}

const eventTypes = [
  { value: 'wedding-ceremony', label: 'Wedding Ceremony' },
  { value: 'ganapathi-kidal', label: 'Ganapathikidal' },
  { value: 'dakshina', label: 'Dakshina' },
  { value: 'muhurtham', label: 'Muhurtham' },
  { value: 'reception', label: 'Reception' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'haldi', label: 'Haldi' },
  { value: 'sangeet', label: 'Sangeet' },
  { value: 'other', label: 'Other' }
];

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosUploaded, className }) => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [showFaceDialog, setShowFaceDialog] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [enableFaceDetection, setEnableFaceDetection] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load people on mount
  useEffect(() => {
    const loadPeople = async () => {
      try {
        const peopleList = await getPeople();
        setPeople(peopleList);
      } catch (error) {
        console.error('Failed to load people:', error);
      }
    };
    loadPeople();
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );

    addPhotos(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type.startsWith('image/')
    );
    addPhotos(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addPhotos = async (files: File[]) => {
    const newPhotos: PhotoFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      description: '',
      eventType: '',
      tags: [],
      destinationGallery: 'sister-a-gallery',
      faces: [],
      status: 'pending',
      progress: 0,
      id: Date.now() + Math.random().toString()
    }));

    setPhotos(prev => [...prev, ...newPhotos]);

    // Auto-detect faces if enabled
    if (enableFaceDetection) {
      newPhotos.forEach(photo => {
        detectFacesForPhoto(photo.id);
      });
    }
  };

  const detectFacesForPhoto = async (photoId: string) => {
    // Update status
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, status: 'detecting', progress: 10 } : p
    ));

    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Detect faces
      const detections = await detectFacesInFile(photo.file);

      // Match faces against known people
      const facesWithMatches: DetectedFace[] = [];

      for (const detection of detections) {
        try {
          const matchResult = await matchFace(detection.descriptor, 0.6);

          facesWithMatches.push({
            descriptor: detection.descriptor,
            boundingBox: detection.box,
            confidence: detection.detection.score || 0.8,
            personId: matchResult.bestMatch?.personId,
            personName: matchResult.bestMatch?.personName,
            matchConfidence: matchResult.bestMatch?.confidence
          });
        } catch (error) {
          // If matching fails, add face without match
          facesWithMatches.push({
            descriptor: detection.descriptor,
            boundingBox: detection.box,
            confidence: detection.detection.score || 0.8
          });
        }
      }

      // Update photo with detected faces
      setPhotos(prev => prev.map(p =>
        p.id === photoId 
          ? { ...p, faces: facesWithMatches, status: 'pending', progress: 0 } 
          : p
      ));
    } catch (error) {
      console.error('Face detection error:', error);
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, status: 'pending', progress: 0 } : p
      ));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const updatePhotoMetadata = (index: number, updates: Partial<PhotoFile>) => {
    setPhotos(prev => prev.map((photo, i) =>
      i === index ? { ...photo, ...updates } : photo
    ));
  };

  const updateFacePerson = (photoId: string, faceIndex: number, personId: string) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id !== photoId) return photo;

      const updatedFaces = [...photo.faces];
      const person = people.find(p => p.id === personId);
      if (person && updatedFaces[faceIndex]) {
        updatedFaces[faceIndex] = {
          ...updatedFaces[faceIndex],
          personId: person.id,
          personName: person.name,
          matchConfidence: 1.0 // Manual tag has 100% confidence
        };
      }

      return { ...photo, faces: updatedFaces };
    }));
  };

  const removeFace = (photoId: string, faceIndex: number) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id !== photoId) return photo;

      const updatedFaces = photo.faces.filter((_, i) => i !== faceIndex);
      return { ...photo, faces: updatedFaces };
    }));
  };

  const handleUploadAll = async () => {
    const photosWithoutGallery = photos.filter(p => !p.destinationGallery);
    if (photosWithoutGallery.length > 0) {
      alert('Please select a destination gallery for all photos before uploading.');
      return;
    }

    setIsUploading(true);

    const filesToUpload = photos.filter(p => p.status === 'pending');

    for (const photo of filesToUpload) {
      try {
        // Update status
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, status: 'uploading', progress: 0 } : p
        ));

        // Prepare face data
        const facesData: FaceData[] = photo.faces.map(face => ({
          descriptor: Array.from(face.descriptor),
          boundingBox: face.boundingBox,
          confidence: face.confidence,
          personId: face.personId,
          personName: face.personName
        }));

        // Prepare upload data
        const uploadData: PhotoUploadData = {
          file: photo.file,
          sister: photo.destinationGallery === 'sister-a-gallery' ? 'sister-a' : 'sister-b',
          title: photo.title,
          description: photo.description,
          eventType: photo.eventType,
          tags: photo.tags,
          faces: facesData
        };

        // Simulate progress
        const progressInterval = setInterval(() => {
          setPhotos(prev => prev.map(p => {
            if (p.id === photo.id && p.progress < 90) {
              return { ...p, progress: p.progress + 10 };
            }
            return p;
          }));
        }, 200);

        // Upload photo
        const result = await uploadPhoto(uploadData);

        clearInterval(progressInterval);

        // Update status
        setPhotos(prev => prev.map(p =>
          p.id === photo.id 
            ? { ...p, status: 'completed', progress: 100 } 
            : p
        ));

        if (onPhotosUploaded) {
          onPhotosUploaded([result]);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setPhotos(prev => prev.map(p =>
          p.id === photo.id 
            ? { 
                ...p, 
                status: 'error', 
                progress: 0,
                error: error instanceof Error ? error.message : 'Upload failed'
              } 
            : p
        ));
      }
    }

    setIsUploading(false);

    // Clean up completed photos after a delay
    setTimeout(() => {
      setPhotos(prev => {
        const remaining = prev.filter(p => p.status !== 'completed');
        // Cleanup object URLs for completed photos
        prev.filter(p => p.status === 'completed').forEach(p => {
          URL.revokeObjectURL(p.preview);
        });
        return remaining;
      });
    }, 2000);
  };

  const openMetadataDialog = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowMetadataDialog(true);
  };

  const openFaceDialog = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowFaceDialog(true);
  };

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Wedding Photos with Face Recognition
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragOver
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            )}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragOver ? "Drop photos here" : "Drag & drop photos here"}
            </h3>
            <p className="text-gray-600 mb-4">
              or click to browse files (JPG, PNG, WebP)
            </p>
            <Button variant="outline">
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Face Detection Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable-face-detection"
                checked={enableFaceDetection}
                onChange={(e) => setEnableFaceDetection(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="enable-face-detection" className="text-sm font-medium">
                Enable automatic face detection
              </label>
            </div>
          </div>

          {/* Upload Stats */}
          {photos.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>{photos.length} photo(s) selected</span>
              <div className="flex gap-2">
                <span className="text-green-600">
                  {photos.filter(p => p.status === 'completed').length} uploaded
                </span>
                <span className="text-blue-600">
                  {photos.filter(p => p.status === 'uploading').length} uploading
                </span>
                <span className="text-orange-600">
                  {photos.filter(p => p.status === 'detecting').length} detecting
                </span>
                <span className="text-gray-600">
                  {photos.filter(p => p.status === 'pending').length} pending
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={photo.preview}
                  alt={`Upload preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Status Overlay */}
                <div className="absolute top-2 right-2">
                  {photo.status === 'completed' && (
                    <CheckCircle className="w-6 h-6 text-green-500 bg-white rounded-full" />
                  )}
                  {(photo.status === 'uploading' || photo.status === 'detecting') && (
                    <Loader2 className="w-6 h-6 text-blue-500 bg-white rounded-full animate-spin" />
                  )}
                  {photo.status === 'error' && (
                    <AlertCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />
                  )}
                </div>

                {/* Face Count Badge */}
                {photo.faces.length > 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {photo.faces.length} face(s)
                    </Badge>
                  </div>
                )}

                {/* Progress Bar */}
                {(photo.status === 'uploading' || photo.status === 'detecting') && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <Progress value={photo.progress} className="h-1" />
                    <p className="text-white text-xs mt-1">
                      {photo.status === 'detecting' ? 'Detecting faces...' : 'Uploading...'}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openMetadataDialog(index)}
                    className="h-8 w-8 p-0"
                    title="Edit metadata"
                  >
                    <Tag className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openFaceDialog(index)}
                    className="h-8 w-8 p-0"
                    title="Manage faces"
                  >
                    <Scan className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                    className="h-8 w-8 p-0"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-3">
                <div className="text-sm">
                  <p className="font-medium truncate">
                    {photo.title || `Photo ${index + 1}`}
                  </p>
                  <p className="text-gray-600 text-xs">
                    {(photo.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  {photo.eventType && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {eventTypes.find(e => e.value === photo.eventType)?.label}
                    </Badge>
                  )}
                  {photo.error && (
                    <p className="text-red-500 text-xs mt-1">{photo.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {photos.length > 0 && (
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleUploadAll}
            disabled={isUploading || photos.filter(p => p.status === 'pending').length === 0}
            size="lg"
            className="px-8"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {photos.filter(p => p.status === 'pending').length} Photo(s)
              </>
            )}
          </Button>
          
          <Button
            onClick={() => {
              photos.forEach(p => URL.revokeObjectURL(p.preview));
              setPhotos([]);
            }}
            variant="outline"
            size="lg"
            disabled={isUploading}
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Metadata Dialog */}
      <Dialog open={showMetadataDialog} onOpenChange={setShowMetadataDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.preview}
                  alt="Selected photo"
                  className="max-w-full max-h-48 object-contain rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={selectedPhoto.title}
                    onChange={(e) => updatePhotoMetadata(selectedPhotoIndex!, { title: e.target.value })}
                    placeholder="Enter photo title"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={selectedPhoto.description}
                    onChange={(e) => updatePhotoMetadata(selectedPhotoIndex!, { description: e.target.value })}
                    placeholder="Enter photo description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Event Type</label>
                  <Select
                    value={selectedPhoto.eventType}
                    onValueChange={(value) => updatePhotoMetadata(selectedPhotoIndex!, { eventType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventTypes.map((event) => (
                        <SelectItem key={event.value} value={event.value}>
                          {event.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Destination Gallery</label>
                  <Select
                    value={selectedPhoto.destinationGallery}
                    onValueChange={(value) => updatePhotoMetadata(selectedPhotoIndex!, { destinationGallery: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gallery" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sister-a-gallery">Sister A's Gallery</SelectItem>
                      <SelectItem value="sister-b-gallery">Sister B's Gallery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={selectedPhoto.tags.join(', ')}
                    onChange={(e) => updatePhotoMetadata(selectedPhotoIndex!, {
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    placeholder="wedding, ceremony, family"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowMetadataDialog(false)} className="flex-1">
                  Save Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMetadataDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Face Management Dialog */}
      <Dialog open={showFaceDialog} onOpenChange={setShowFaceDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Manage Detected Faces</DialogTitle>
          </DialogHeader>

          {selectedPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center relative">
                <img
                  src={selectedPhoto.preview}
                  alt="Selected photo"
                  className="max-w-full max-h-[40vh] object-contain rounded"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">Detected Faces ({selectedPhoto.faces.length})</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => detectFacesForPhoto(selectedPhoto.id)}
                    disabled={selectedPhoto.status === 'detecting'}
                  >
                    {selectedPhoto.status === 'detecting' ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Detecting...
                      </>
                    ) : (
                      <>
                        <Scan className="w-3 h-3 mr-1" />
                        Re-detect
                      </>
                    )}
                  </Button>
                </div>

                {selectedPhoto.faces.length === 0 ? (
                  <p className="text-sm text-gray-600">No faces detected yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedPhoto.faces.map((face, faceIndex) => (
                      <div key={faceIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">
                              {face.personName || 'Unknown Person'}
                            </span>
                            {face.matchConfidence && (
                              <Badge variant="outline" className="text-xs">
                                {(face.matchConfidence * 100).toFixed(0)}% confidence
                              </Badge>
                            )}
                          </div>
                          <div className="mt-2">
                            <Select
                              value={face.personId || ''}
                              onValueChange={(value) => updateFacePerson(selectedPhoto.id, faceIndex, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Assign to person" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Unassigned</SelectItem>
                                {people.map((person) => (
                                  <SelectItem key={person.id} value={person.id}>
                                    {person.name} ({person.role})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFace(selectedPhoto.id, faceIndex)}
                          className="ml-2"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => setShowFaceDialog(false)} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoUpload;

