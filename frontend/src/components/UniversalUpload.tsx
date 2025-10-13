import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Music, CheckCircle, AlertCircle, Loader2, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  uploadFiles, 
  validateFileType, 
  validateImageFileType,
  validateMusicFileType,
  validateFileSize, 
  formatFileSize,
  type UploadedFile 
} from '@/services/fileUploadService';

interface FileItem {
  file: File;
  preview: string;
  id: string;
  eventType: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
  uploadedFile?: UploadedFile;
  isPlaying?: boolean;
}

interface EventTypeOption {
  value: string;
  label: string;
}

interface UniversalUploadProps {
  onFilesUploaded?: (uploadedFiles: UploadedFile[]) => void;
  allowedTypes?: 'images' | 'music' | 'both';
  title?: string;
  allowedEventTypes?: EventTypeOption[];
  minFiles?: number;
  maxFiles?: number;
  maxFilesizeMB?: number;
  sisterName?: string; // New prop for sister's name
}

const defaultEventTypes = [
  { value: 'wedding-ceremony', label: 'Wedding Ceremony' },
  { value: 'ganapathi-kidal', label: 'Ganapathikidal' },
  { value: 'dakshina', label: 'Dakshina' },
  { value: 'muhurtham', label: 'Muhurtham' },
  { value: 'reception', label: 'Reception' },
  { value: 'mehendi', label: 'Mehendi' },
  { value: 'background', label: 'Background Music' },
  { value: 'other', label: 'Other' }
];

const UniversalUpload: React.FC<UniversalUploadProps> = ({ 
  onFilesUploaded, 
  allowedTypes = 'both',
  title = 'Upload Files',
  allowedEventTypes = defaultEventTypes,
  minFiles = 1,
  maxFiles = 100,
  maxFilesizeMB = 10, // Default max file size
  sisterName // Destructure sisterName prop
}) => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(allowedEventTypes[0]?.value || 'wedding-ceremony');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update selectedEventType if allowedEventTypes changes and current selectedEventType is no longer valid
  React.useEffect(() => {
    if (allowedEventTypes.length > 0 && !allowedEventTypes.some(et => et.value === selectedEventType)) {
      setSelectedEventType(allowedEventTypes[0].value);
    }
  }, [allowedEventTypes, selectedEventType]);

  const getAcceptTypes = () => {
    switch (allowedTypes) {
      case 'images':
        return 'image/*';
      case 'music':
        return 'audio/*';
      case 'both':
        return 'image/*,audio/*';
      default:
        return '*/*';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-4 h-4" />;
    } else if (file.type.startsWith('audio/')) {
      return <Music className="w-4 h-4" />;
    }
    return <Upload className="w-4 h-4" />;
  };

  const getFileCategory = (file: File): 'image' | 'music' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'music';
    throw new Error('Unsupported file type');
  };

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

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    
    // Reset input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addFiles = (newFiles: File[]) => {
    const currentFileCount = files.length;
    const filesToAddCount = newFiles.length;

    if (currentFileCount + filesToAddCount > maxFiles) {
      alert(`You can upload a maximum of ${maxFiles} files. You have ${currentFileCount} files already, and are trying to add ${filesToAddCount} more.`);
      return;
    }

    const fileItems: FileItem[] = newFiles.map(file => {
      // Validate file type based on allowed types
      let isValidType = false;
      let errorMessage = '';

      if (allowedTypes === 'images' && !validateImageFileType(file)) {
        errorMessage = 'Only image files are allowed (JPG, PNG, WebP, GIF)';
      } else if (allowedTypes === 'music' && !validateMusicFileType(file)) {
        errorMessage = 'Only audio files are allowed (MP3, WAV, OGG, M4A, AAC)';
      } else if (allowedTypes === 'both' && !validateFileType(file)) {
        errorMessage = 'Only image and audio files are allowed';
      } else {
        isValidType = true;
      }

      if (!isValidType) {
        return {
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
          id: Date.now() + Math.random().toString(),
          eventType: selectedEventType,
          status: 'error' as const,
          progress: 0,
          error: errorMessage
        };
      }

      if (!validateFileSize(file, maxFilesizeMB)) {
        return {
          file,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
          id: Date.now() + Math.random().toString(),
          eventType: selectedEventType,
          status: 'error' as const,
          progress: 0,
          error: `File too large. Please upload files smaller than ${maxFilesizeMB}MB.`
        };
      }

      return {
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : '',
        id: Date.now() + Math.random().toString(),
        eventType: selectedEventType,
        status: 'pending' as const,
        progress: 0,
        isPlaying: false
      };
    });

    setFiles(prev => [...prev, ...fileItems]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const updateFileEventType = (index: number, eventType: string) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, eventType } : file
    ));
  };

  const toggleAudioPlay = (index: number) => {
    setFiles(prev => prev.map((file, i) => 
      i === index ? { ...file, isPlaying: !file.isPlaying } : file
    ));
  };

  const handleUpload = async () => {
    const pendingFiles = files.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) return;

    if (pendingFiles.length < minFiles) {
      alert(`Please upload at least ${minFiles} files.`); // Or use a more sophisticated toast/dialog
      return;
    }

    setIsUploading(true);

    try {
      // Update status to uploading
      setFiles(prev => prev.map(file => 
        file.status === 'pending' 
          ? { ...file, status: 'uploading', progress: 0 }
          : file
      ));

      // Simulate progress updates
      for (let i = 0; i < pendingFiles.length; i++) {
        const fileIndex = files.findIndex(f => f.id === pendingFiles[i].id);
        
        // Update progress
        for (let progress = 0; progress <= 100; progress += 20) {
          setFiles(prev => prev.map((file, idx) => 
            idx === fileIndex 
              ? { ...file, progress }
              : file
          ));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Upload files
      const fileObjects = pendingFiles.map(file => file.file);
      if (!sisterName || (sisterName !== 'sister-a' && sisterName !== 'sister-b')) {
        throw new Error('Invalid sister name provided.');
      }
      const result = await uploadFiles(fileObjects, sisterName); // Pass sisterName

      if (result.success) {
        // Update files with uploaded file info
        setFiles(prev => prev.map((file, index) => {
          if (file.status === 'uploading') {
            const uploadedFile = result.files[index];
            return {
              ...file,
              status: 'completed',
              progress: 100,
              uploadedFile
            };
          }
          return file;
        }));

        // Call callback with uploaded files
        if (onFilesUploaded) {
          onFilesUploaded(result.files);
        }

        // Clear files after successful upload
        setTimeout(() => {
          setFiles(prev => {
            prev.forEach(file => {
              if (file.preview) URL.revokeObjectURL(file.preview);
            });
            return [];
          });
        }, 2000);

      } else {
        // Handle upload error
        setFiles(prev => prev.map(file => 
          file.status === 'uploading' 
            ? { ...file, status: 'error', error: result.error }
            : file
        ));
      }

    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(file => 
        file.status === 'uploading' 
          ? { ...file, status: 'error', error: 'Upload failed' }
          : file
      ));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: FileItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'uploading':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: FileItem['status']) => {
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

  const getDropText = () => {
    switch (allowedTypes) {
      case 'images':
        return 'Drop images here (JPG, PNG, WebP, GIF)';
      case 'music':
        return 'Drop music files here (MP3, WAV, OGG, M4A, AAC)';
      case 'both':
        return 'Drop images and music files here';
      default:
        return 'Drop files here';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {title}
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
              {allowedEventTypes.map(event => (
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
            {isDragOver ? "Drop files here" : getDropText()}
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse files (Min {minFiles}, Max {maxFiles} files, {maxFilesizeMB}MB per file)
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
          accept={getAcceptTypes()}
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File Preview */}
        {files.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Selected Files ({files.length})</h4>
            <div className="space-y-3">
              {files.map((fileItem, index) => (
                <div 
                  key={fileItem.id} 
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    getStatusColor(fileItem.status)
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {fileItem.file.type.startsWith('image/') ? (
                        <img
                          src={fileItem.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getFileIcon(fileItem.file)}
                        </div>
                      )}
                      <div className="absolute -top-1 -right-1">
                        {getStatusIcon(fileItem.status)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{fileItem.file.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {formatFileSize(fileItem.file.size)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getFileCategory(fileItem.file)}
                        </Badge>
                      </div>
                      
                      {fileItem.status === 'error' && (
                        <p className="text-sm text-red-600">{fileItem.error}</p>
                      )}
                      
                      {fileItem.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={fileItem.progress} className="h-2" />
                          <p className="text-sm text-blue-600">Uploading... {fileItem.progress}%</p>
                        </div>
                      )}
                      
                      {fileItem.status === 'completed' && (
                        <p className="text-sm text-green-600">Uploaded successfully!</p>
                      )}

                      {fileItem.file.type.startsWith('audio/') && fileItem.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleAudioPlay(index)}
                          className="mt-2 h-8 px-3"
                        >
                          {fileItem.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          {fileItem.isPlaying ? 'Pause' : 'Preview'}
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {fileItem.status === 'pending' && (
                        <Select 
                          value={fileItem.eventType} 
                          onValueChange={(value) => updateFileEventType(index, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {allowedEventTypes.map(event => (
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
                        onClick={() => removeFile(index)}
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
                disabled={isUploading || files.filter(f => f.status === 'pending').length < minFiles}
                className="flex items-center gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload {files.filter(f => f.status === 'pending').length} Files
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => {
                  files.forEach(file => {
                    if (file.preview) URL.revokeObjectURL(file.preview);
                  });
                  setFiles([]);
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

export default UniversalUpload;
