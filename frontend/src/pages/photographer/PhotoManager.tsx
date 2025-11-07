import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Eye, 
  Download, 
  Trash2, 
  Search,
  RefreshCw,
  ZoomIn,
  X
} from 'lucide-react';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { showSuccess } from '@/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: string;
  filename: string;
  url: string;
  thumbnail: string;
  size: number;
  uploadedAt: string;
  sister: string;
}

const PhotoManager: React.FC = () => {
  const [sisterAPhotos, setSisterAPhotos] = useState<Photo[]>([]);
  const [sisterBPhotos, setSisterBPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [activeGallery, setActiveGallery] = useState<'sister-a' | 'sister-b'>('sister-a');

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      
      const [sisterAResponse, sisterBResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/photos?sister=sister-a`),
        fetch(`${API_BASE_URL}/api/photos?sister=sister-b`)
      ]);

      if (sisterAResponse.ok) {
        const photosA = await sisterAResponse.json();
        setSisterAPhotos(photosA.map((p: any) => ({
          id: p.id,
          filename: p.title || p.filename || 'Photo',
          url: p.public_url || p.publicUrl || p.url,
          thumbnail: p.thumbnail || p.public_url || p.publicUrl || p.url,
          size: p.size,
          uploadedAt: p.uploaded_at || p.created_at || p.timestamp,
          sister: 'sister-a'
        })));
      }

      if (sisterBResponse.ok) {
        const photosB = await sisterBResponse.json();
        setSisterBPhotos(photosB.map((p: any) => ({
          id: p.id,
          filename: p.title || p.filename || 'Photo',
          url: p.public_url || p.publicUrl || p.url,
          thumbnail: p.thumbnail || p.public_url || p.publicUrl || p.url,
          size: p.size,
          uploadedAt: p.uploaded_at || p.created_at || p.timestamp,
          sister: 'sister-b'
        })));
      }

    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photo: Photo) => {
    if (!confirm(`Are you sure you want to delete ${photo.filename}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/photos/${photo.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      // Remove from appropriate gallery
      if (photo.sister === 'sister-a') {
        setSisterAPhotos(prev => prev.filter(p => p.id !== photo.id));
      } else {
        setSisterBPhotos(prev => prev.filter(p => p.id !== photo.id));
      }

      showSuccess(`${photo.filename} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const handleDownloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const currentPhotos = activeGallery === 'sister-a' ? sisterAPhotos : sisterBPhotos;
  const filteredPhotos = currentPhotos.filter(photo =>
    photo.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPhotoCard = (photo: Photo) => (
    <motion.div
      key={photo.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-square relative bg-gray-100">
          <img
            src={photo.thumbnail}
            alt={photo.filename}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setSelectedPhoto(photo)}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-image.png';
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            className="absolute top-2 right-2"
            onClick={() => setSelectedPhoto(photo)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-sm truncate" title={photo.filename}>
              {photo.filename}
            </h3>
            <p className="text-xs text-gray-500">{formatFileSize(photo.size)}</p>
            <p className="text-xs text-gray-400">{formatDate(photo.uploadedAt)}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => window.open(photo.url, '_blank')}
            >
              <Eye className="w-3 h-3 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => handleDownloadPhoto(photo)}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="destructive"
            className="w-full"
            onClick={() => handleDeletePhoto(photo)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete Photo
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-lg">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Photo Management</h1>
            <p className="text-gray-600">View, download, and manage all wedding photos</p>
          </div>
          <Button onClick={loadPhotos} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search photos by filename..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Gallery Tabs */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeGallery} onValueChange={(value) => setActiveGallery(value as 'sister-a' | 'sister-b')}>
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="sister-a" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Parvathy's Gallery
              <Badge variant="secondary">{sisterAPhotos.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="sister-b" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Sreedevi's Gallery
              <Badge variant="secondary">{sisterBPhotos.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sister-a" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Parvathy's Wedding Photos</span>
                  <Badge variant="outline">{filteredPhotos.length} photos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No photos found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {filteredPhotos.map(renderPhotoCard)}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sister-b" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sreedevi's Wedding Photos</span>
                  <Badge variant="outline">{filteredPhotos.length} photos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>No photos found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    <AnimatePresence>
                      {filteredPhotos.map(renderPhotoCard)}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
          >
            <Button
              onClick={() => setSelectedPhoto(null)}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>

            <motion.div
              className="max-w-5xl max-h-[90vh]"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.filename}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="bg-black/80 text-white p-4 mt-2 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedPhoto.filename}</h3>
                <p className="text-sm text-gray-300">Size: {formatFileSize(selectedPhoto.size)}</p>
                <p className="text-sm text-gray-300">Uploaded: {formatDate(selectedPhoto.uploadedAt)}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => window.open(selectedPhoto.url, '_blank')}
                    variant="secondary"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    onClick={() => handleDownloadPhoto(selectedPhoto)}
                    variant="secondary"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => {
                      handleDeletePhoto(selectedPhoto);
                      setSelectedPhoto(null);
                    }}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoManager;

