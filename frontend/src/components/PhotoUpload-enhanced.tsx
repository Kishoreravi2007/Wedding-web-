import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  uploadFiles, 
  validateFileType, 
  validateFileSize, 
  formatFileSize,
  type UploadedFile 
} from '@/services/fileUploadService';

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
  eventType: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  uploadedFile?: UploadedFile;
}

interface PhotoUploadEnhancedProps {
  onPhotosUploaded?: (uploadedFiles: UploadedFile[]) => void;
}

const eventTypes = [
  { value: 'wedding-ceremony', label: 'Wedding Ceremony' },
  { value: 'ganapathi-kidal', label: 'Ganapathikidal' },
  { value: 'dakshina', label: 'Dakshina' },
  { value: 'muhurtham', label: 'Muhurtham' },
  { value: 'reception', label: 'Reception' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'other', label: 'Other' }
];

const PhotoUploadEnhanced: React.FC<PhotoUploadEnhancedProps> = ({ onPhotosUploaded }) => {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState('wedding-ceremony');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );

    addPhotos(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type.startsWith('image/')
    );
    addPhotos(files);
    
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addPhotos = (files: File[]) => {
    const newPhotos: PhotoFile[] = files.map(file => {
      // Validate file
      if (!validateFileType(file)) {
        return {
          file,
          preview: URL.createObjectURL(file),
          id: Date.now() + Math.random().toString(),
          eventType: selectedEventType,
          status: 'error',
          progress: 0,
          error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF files.'
        };
      }

      if (!validateFileSize(file)) {
        return {
          file,
          preview: URL.createObjectURL(file),
          id: Date.now() + Math.random().toString(),
          eventType: selectedEventType,
          status: 'error',
          progress: 0,
          error: 'File too large. Please upload files smaller than 10MB.'
        };
      }

      return {
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random().toString(),
        eventType: selectedEventType,
        status: 'pending',
        progress: 0
      };
    });

    setPhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const updatePhotoEventType = (index: number, eventType: string) => {
    setPhotos(prev => prev.map((photo, i) => 
      i === index ? { ...photo, eventType } : photo
    ));
  };

  const handleUpload = async () => {
    const validPhotos = photos.filter(photo => photo.status === 'pending');
    if (validPhotos.length === 0) return;

    setIsUploading(true);

    try {
      // Update status to uploading
      setPhotos(prev => prev.map(photo => 
        photo.status === 'pending' 
          ? { ...photo, status: 'uploading', progress: 0 }
          : photo
      ));

      // Simulate progress updates
      for (let i = 0; i < validPhotos.length; i++) {
        const photoIndex = photos.findIndex(p => p.id === validPhotos[i].id);
        
        // Update progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setPhotos(prev => prev.map((photo, idx) => 
            idx === photoIndex 
              ? { ...photo, progress }
              : photo
          ));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Upload files
      const files = validPhotos.map(photo => photo.file);
      const result = await uploadFiles(files, selectedEventType);

      if (result.success) {
        // Update photos with uploaded file info
        setPhotos(prev => prev.map((photo, index) => {
          if (photo.status === 'uploading') {
            const uploadedFile = result.files[index];
            return {
              ...photo,
              status: 'completed',
              progress: 100,
              uploadedFile
            };
          }
          return photo;
        }));

        // Call callback with uploaded files
        if (onPhotosUploaded) {
          onPhotosUploaded(result.files);
        }

        // Clear photos after successful upload
        setTimeout(() => {
          setPhotos(prev => {
            prev.forEach(photo => URL.revokeObjectURL(photo.preview));
            return [];
          });
        }, 2000);

      } else {
        // Handle upload error
        setPhotos(prev => prev.map(photo => 
          photo.status === 'uploading' 
            ? { ...photo, status: 'error', error: result.error }
            : photo
        ));
      }

    } catch (error) {
      console.error('Upload error:', error);
      setPhotos(prev => prev.map(photo => 
        photo.status === 'uploading' 
          ? { ...photo, status: 'error', error: 'Upload failed' }
          : photo
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: PhotoFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <ImageIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: PhotoFile['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'uploading':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Wedding Photos (Enhanced)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Type Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Event Type</label>
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger>
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              {eventTypes.map(event => (
                <SelectItem key={event.value} value={event.value}>
                  {event.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drag & Drop Area */}
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
            or click to browse files (JPG, PNG, WebP, GIF - Max 10MB)
          </p>
          <Button variant="outline" type="button">
            Choose Files
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Selected Photos ({photos.length})</h4>
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    getStatusColor(photo.status)
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={photo.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(photo.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{photo.file.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(photo.file.size)}
                        </Badge>
                      </div>
                      
                      {photo.status === 'error' && (
                        <p className="text-sm text-red-600">{photo.error}</p>
                      )}
                      
                      {photo.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={photo.progress} className="h-2" />
                          <p className="text-sm text-blue-600">Uploading... {photo.progress}%</p>
                        </div>
                      )}
                      
                      {photo.status === 'completed' && (
                        <p className="text-sm text-green-600">Uploaded successfully!</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {photo.status === 'pending' && (
                        <Select 
                          value={photo.eventType} 
                          onValueChange={(value) => updatePhotoEventType(index, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map(event => (
                              <SelectItem key={event.value} value={event.value}>
                                {event.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removePhoto(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || photos.filter(p => p.status === 'pending').length === 0}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload {photos.filter(p => p.status === 'pending').length} Photos
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  photos.forEach(photo => URL.revokeObjectURL(photo.preview));
                  setPhotos([]);
                }}
                disabled={isUploading}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoUploadEnhanced;
