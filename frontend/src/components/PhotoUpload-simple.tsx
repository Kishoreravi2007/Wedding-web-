import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PhotoUploadSimpleProps {
  weddingId: string;
}

export function PhotoUploadSimple({ weddingId }: PhotoUploadSimpleProps) {
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

    setUploading(true);
    const uploadPromises = selectedFiles.map(async (file, index) => {
      try {
        setUploadProgress(prev => ({ ...prev, [index]: 0 }));
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        
        // Simulate success
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        return { success: true, file: file.name };
      } catch (error) {
        console.error('Upload error:', error);
        return { success: false, file: file.name, error };
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        toast.success(`${successfulUploads.length} photo(s) uploaded successfully to ${weddingId}!`);
      }
      if (failedUploads.length > 0) {
        toast.error(`${failedUploads.length} photo(s) failed to upload.`);
      }

      setSelectedFiles([]);
    } catch (error) {
      console.error("Error during batch upload:", error);
      toast.error("An error occurred during photo upload.");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
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
