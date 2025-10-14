import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { uploadFiles } from '@/services/fileUploadService'; // Import the uploadFiles service

interface PhotoUploadSimpleProps {
  weddingId: string;
  onUploadSuccess?: (photoId: string) => void; // Callback for successful upload
}

export function PhotoUploadSimple({ weddingId, onUploadSuccess }: PhotoUploadSimpleProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !weddingId) {
      toast.error('Please select files and a wedding to upload photos.');
      return;
    }

    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to upload photos. Redirecting to login page...');
      setTimeout(() => {
        window.location.href = '/photographer-login';
      }, 2000);
      return;
    }

    setUploading(true);
    setUploadProgress({}); // Reset progress for new upload batch

    const filesToUpload = selectedFiles.map((file, index) => ({ file, index }));
    const uploadResults: { success: boolean; file: string; id?: string; error?: any }[] = [];

    for (const { file, index } of filesToUpload) {
      try {
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));

        // Show initial progress
        setUploadProgress(prev => ({ ...prev, [index]: 10 }));

        const result = await uploadFiles([file], weddingId === 'sister-a' ? 'sister-a' : 'sister-b');
        
        // Update progress during upload
        setUploadProgress(prev => ({ ...prev, [index]: 50 }));
        
        if (result.success && result.files.length > 0) {
          setUploadProgress(prev => ({ ...prev, [index]: 100 }));
          uploadResults.push({ success: true, file: file.name, id: result.files[0].id });
          if (onUploadSuccess) {
            onUploadSuccess(result.files[0].id!);
          }
        } else {
          throw new Error(result.error || 'Upload failed');
        }
      } catch (error: any) {
        console.error('Upload error for', file.name, ':', error);
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));
        
        // Show specific error message
        const errorMessage = error.message || 'Unknown error';
        if (errorMessage.includes('Authentication')) {
          toast.error('Session expired. Please login again.');
          setTimeout(() => {
            window.location.href = '/photographer-login';
          }, 2000);
          break; // Stop uploading if auth fails
        }
        
        uploadResults.push({ success: false, file: file.name, error: errorMessage });
      }
    }

    const successfulUploads = uploadResults.filter(result => result.success);
    const failedUploads = uploadResults.filter(result => !result.success);

    if (successfulUploads.length > 0) {
      toast.success(`✓ ${successfulUploads.length} photo(s) uploaded successfully!`);
    }
    if (failedUploads.length > 0) {
      const errorMessages = failedUploads.map(f => `${f.file}: ${f.error}`).join('\n');
      toast.error(`✗ ${failedUploads.length} photo(s) failed:\n${errorMessages}`);
    }

    // Only clear successful uploads
    if (failedUploads.length === 0) {
      setSelectedFiles([]);
    } else {
      // Keep failed files for retry
      const failedFileNames = failedUploads.map(f => f.file);
      setSelectedFiles(prev => prev.filter(f => failedFileNames.includes(f.name)));
    }
    
    setUploading(false);
    setUploadProgress({});
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Wedding Photos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="files">Select Photos</Label>
            <div
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = Array.from(e.dataTransfer.files);
                setSelectedFiles(prev => [...prev, ...files]);
              }}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="w-8 h-8 text-gray-400" />
              <p className="text-sm text-gray-500">Drag and drop photos here, or click to browse</p>
              <Input
                id="file-input"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
            <div className="mt-2 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                  <span>{file.name}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeFile(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>


          <Button onClick={handleUpload} disabled={uploading || selectedFiles.length === 0}>
            {uploading ? (
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-2 animate-bounce" /> Uploading...
              </div>
            ) : (
              <div className="flex items-center">
                <Upload className="h-4 w-4 mr-2" /> Upload Photos
              </div>
            )}
          </Button>

          {uploading && (
            <div className="mt-4 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{file.name}</span>
                  {uploadProgress[index] === 100 ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <span>{uploadProgress[index] || 0}%</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
