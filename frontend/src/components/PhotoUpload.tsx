"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Upload,
  X,
  Image as ImageIcon,
  Camera,
  Calendar,
  Users,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadFaceModels, extractFaceDescriptors, areModelsLoaded } from '@/utils/faceDescriptorExtractor';

interface PhotoFile {
  file: File;
  preview: string;
  title: string;
  description: string;
  eventType: string;
  tags: string[];
  destinationGallery: 'sister-a-gallery' | 'sister-b-gallery' | '';
  storageProvider: 'firebase' | 'supabase'; // Add storage provider
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  id: string;
}

interface PhotoUploadProps {
  onPhotosUploaded?: (photos: PhotoFile[]) => void;
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

const destinationGalleries = [
  { value: 'sister-a-gallery', label: "Parvathy's Gallery" },
  { value: 'sister-b-gallery', label: "Sreedevi's Gallery" },
];

const storageProviders = [
  { value: 'firebase', label: 'Firebase Storage' },
  { value: 'supabase', label: 'Supabase Storage' },
];

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosUploaded, className }) => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [storageProvider, setStorageProvider] = useState<'firebase' | 'supabase'>('firebase');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [loadingFaceModels, setLoadingFaceModels] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load face-api models on component mount
  useEffect(() => {
    const initFaceModels = async () => {
      if (areModelsLoaded()) {
        setFaceModelsLoaded(true);
        return;
      }
      
      try {
        setLoadingFaceModels(true);
        await loadFaceModels();
        setFaceModelsLoaded(true);
        console.log('✅ Face detection models loaded - automatic processing enabled');
      } catch (error) {
        console.error('⚠️ Failed to load face detection models:', error);
        console.log('⚠️ Photos will upload without automatic face processing');
      } finally {
        setLoadingFaceModels(false);
      }
    };

    initFaceModels();
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
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addPhotos = (files: File[]) => {
    const newPhotos: PhotoFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      title: '',
      description: '',
      eventType: '',
      tags: [],
      destinationGallery: 'sister-a-gallery', // Default to Parvathy's Gallery
      storageProvider: storageProvider, // Set storage provider
      status: 'pending',
      progress: 0,
      id: Date.now() + Math.random().toString()
    }));

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      // Revoke object URL to prevent memory leaks
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

  const handleUploadAll = async () => {
    // Validate that a destination gallery is selected for all photos
    const photosWithoutGallery = photos.filter(p => !p.destinationGallery);
    if (photosWithoutGallery.length > 0) {
      alert('Please select a destination gallery for all photos before uploading.');
      return;
    }

    setIsUploading(true);

    const filesToUpload = photos.filter(p => p.status === 'pending');

    if (filesToUpload.length === 0) {
      setIsUploading(false);
      return;
    }

    const uploadPromises = filesToUpload.map(async (photo, index) => {
      try {
        // Update status to uploading
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, status: 'uploading', progress: 0 } : p
        ));

        // Extract face descriptors if models are loaded
        let faceData = null;
        if (faceModelsLoaded) {
          try {
            console.log(`🔍 Extracting faces from ${photo.file.name}...`);
            setPhotos(prev => prev.map(p =>
              p.id === photo.id ? { ...p, progress: 10 } : p
            ));
            
            faceData = await extractFaceDescriptors(photo.file);
            
            if (faceData && faceData.count > 0) {
              console.log(`✅ Found ${faceData.count} face(s) in ${photo.file.name}`);
            } else {
              console.log(`ℹ️ No faces detected in ${photo.file.name}`);
            }
            
            setPhotos(prev => prev.map(p =>
              p.id === photo.id ? { ...p, progress: 30 } : p
            ));
          } catch (faceError) {
            console.warn('⚠️ Face extraction failed, continuing with upload:', faceError);
            // Continue with upload even if face extraction fails
          }
        }

        // Simulate progress updates (can be replaced with actual progress from upload service)
        for (let progress = 40; progress <= 90; progress += 10) {
          setPhotos(prev => prev.map(p =>
            p.id === photo.id ? { ...p, progress } : p
          ));
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Call the actual upload service
        const token = localStorage.getItem('accessToken');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const formData = new FormData();
        formData.append('photo', photo.file);
        formData.append('sister', photo.destinationGallery === 'sister-a-gallery' ? 'sister-a' : 'sister-b');
        formData.append('title', photo.title);
        formData.append('description', photo.description);
        formData.append('storageProvider', photo.storageProvider);
        formData.append('eventType', photo.eventType);
        formData.append('tags', JSON.stringify(photo.tags));
        
        // Add face data if extracted
        if (faceData && faceData.faces && faceData.faces.length > 0) {
          formData.append('faces', JSON.stringify(faceData.faces));
          console.log(`📤 Uploading ${photo.file.name} with ${faceData.count} face descriptor(s)`);
        }

        const result = await fetch('/api/photos', {
          method: 'POST',
          headers: headers,
          body: formData,
        });

        if (!result.ok) {
          throw new Error('Upload failed');
        }

        const uploadedPhoto = await result.json();

        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, status: 'completed', progress: 100, id: uploadedPhoto.id } : p
        ));
        return uploadedPhoto;
      } catch (error) {
        console.error('Error uploading photo:', photo.file.name, error);
        setPhotos(prev => prev.map(p =>
          p.id === photo.id ? { ...p, status: 'error', progress: 0 } : p
        ));
        return null;
      }
    });

    const uploadedResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadedResults.filter(Boolean);

    setIsUploading(false);

    if (onPhotosUploaded) {
      onPhotosUploaded(successfulUploads);
    }

    // Clean up object URLs for successfully uploaded photos
    photos.forEach(photo => {
      if (photo.status === 'completed' || photo.status === 'error') {
        URL.revokeObjectURL(photo.preview);
      }
    });

    // Remove successfully uploaded photos from the list
    setPhotos(prev => prev.filter(p => p.status !== 'completed'));
  };

  const openMetadataDialog = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowMetadataDialog(true);
  };

  const saveMetadata = () => {
    setShowMetadataDialog(false);
    setSelectedPhotoIndex(null);
  };

  const selectedPhoto = selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upload Wedding Photos
            </div>
            {loadingFaceModels && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Loading Face Detection...
              </Badge>
            )}
            {faceModelsLoaded && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                <CheckCircle className="w-3 h-3" />
                Auto Face Detection ON
              </Badge>
            )}
            {!loadingFaceModels && !faceModelsLoaded && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Face Detection Unavailable
              </Badge>
            )}
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

          {/* Storage Provider Selector */}
          <div className="mt-4">
            <label className="text-sm font-medium">Storage Provider</label>
            <Select value={storageProvider} onValueChange={(value) => setStorageProvider(value as 'firebase' | 'supabase')}>
              <SelectTrigger>
                <SelectValue placeholder="Select storage provider" />
              </SelectTrigger>
              <SelectContent>
                {storageProviders.map((provider) => (
                  <SelectItem key={provider.value} value={provider.value}>
                    {provider.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Upload Stats */}
          {photos.length > 0 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>{photos.length} photos selected</span>
              <div className="flex gap-2">
                <span className="text-green-600">
                  {photos.filter(p => p.status === 'completed').length} uploaded
                </span>
                <span className="text-blue-600">
                  {photos.filter(p => p.status === 'uploading').length} uploading
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
                  {photo.status === 'uploading' && (
                    <Loader2 className="w-6 h-6 text-blue-500 bg-white rounded-full animate-spin" />
                  )}
                  {photo.status === 'error' && (
                    <AlertCircle className="w-6 h-6 text-red-500 bg-white rounded-full" />
                  )}
                </div>

                {/* Progress Bar */}
                {photo.status === 'uploading' && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                    <Progress value={photo.progress} className="h-1" />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => openMetadataDialog(index)}
                    className="h-8 w-8 p-0"
                  >
                    <Tag className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                    className="h-8 w-8 p-0"
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {photos.length > 0 && (
        <div className="flex justify-center">
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
                Upload Photos
              </>
            )}
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
              {/* Photo Preview */}
              <div className="flex justify-center">
                <img
                  src={selectedPhoto.preview}
                  alt="Selected photo"
                  className="max-w-full max-h-48 object-contain rounded"
                />
              </div>

              {/* Form Fields */}
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
                    onValueChange={(value) => updatePhotoMetadata(selectedPhotoIndex!, { destinationGallery: value as 'sister-a-gallery' | 'sister-b-gallery' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gallery" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sister-a-gallery">Parvathy's Gallery</SelectItem>
                      <SelectItem value="sister-b-gallery">Sreedevi's Gallery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
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

              {/* Current Tags */}
              {selectedPhoto.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium">Current Tags:</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPhoto.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={saveMetadata} className="flex-1">
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
    </div>
  );
};

export default PhotoUpload;
