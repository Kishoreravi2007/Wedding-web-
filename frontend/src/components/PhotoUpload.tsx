"use client";

import React, { useState, useRef, useCallback } from 'react';
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

interface PhotoFile {
  file: File;
  preview: string;
  title: string;
  description: string;
  eventType: string;
  tags: string[];
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

const PhotoUpload: React.FC<PhotoUploadProps> = ({ onPhotosUploaded, className }) => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMetadataDialog, setShowMetadataDialog] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setIsUploading(true);
    // Photo upload is disabled as Firebase Storage has been removed.
    // In a real application, you would integrate with another cloud storage solution.
    console.warn('Photo upload is currently disabled.');

    // Simulate completion for UI purposes, but no actual upload occurs
    setPhotos(prev => prev.map(photo => ({ ...photo, status: 'completed', progress: 100 })));

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate a short delay

    setIsUploading(false);

    // Notify parent component (if any) that photos are "processed"
    if (onPhotosUploaded) {
      onPhotosUploaded(photos.map(p => ({ ...p, status: 'completed' })));
    }

    // Clean up object URLs
    photos.forEach(photo => URL.revokeObjectURL(photo.preview));
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
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Upload Wedding Photos
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
            disabled={isUploading || photos.every(p => p.status === 'completed')}
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
                Upload Photos (Disabled)
              </>
            )}
          </Button>
        </div>
      )}
      {photos.length > 0 && !isUploading && photos.every(p => p.status === 'completed') && (
        <div className="text-center text-sm text-red-500 mt-4">
          Photo upload functionality is disabled as Firebase Storage has been removed. Photos are not persistently stored.
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
