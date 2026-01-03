import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Download, Check, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence, Easing } from 'framer-motion';
import { Photo, Face } from '@/types/photo'; // Import Photo and Face interfaces from types
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/api';
import { mapApiPhotoToPhotoType } from '@/utils/photoMapper';

// Mock data for demonstration
// Note: Real face descriptors would be Float32Array of length 128.
// For mock data, we'll use a placeholder array.
const mockFaceDescriptor: Float32Array = new Float32Array(Array(128).fill(0.1));

// Extend Photo interface to include faces
// interface Photo {
//   id: string;
//   url: string;
//   thumbnail: string;
//   title: string;
//   description: string;
//   tags: string[];
//   event: string;
//   date: string;
//   views: number;
//   downloads: number;
//   isUploaded?: boolean;
//   faces?: Face[]; // Add faces property
// }

interface PhotoViewerProps {
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ photos, currentIndex, onClose, onNext, onPrev }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const currentPhoto = photos[currentIndex];

  const handleKeyPress = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        onPrev();
        break;
      case 'ArrowRight':
        onNext();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'unset';
    };
  }, [currentIndex, onClose, onNext, onPrev]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Navigation buttons */}
      {currentIndex > 0 && (
        <Button
          onClick={onPrev}
          variant="ghost"
          size="sm"
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}

      {currentIndex < photos.length - 1 && (
        <Button
          onClick={onNext}
          variant="ghost"
          size="sm"
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20"
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}

      {/* Main image */}
      <motion.div
        className="relative max-w-7xl max-h-[90vh] p-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src={currentPhoto.url}
          alt={currentPhoto.title}
          className={cn(
            "max-w-full max-h-[80vh] object-contain transition-transform duration-300 cursor-pointer rounded-lg",
            isZoomed ? "scale-150" : "scale-100"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom indicator */}
        <Button
          onClick={() => setIsZoomed(!isZoomed)}
          variant="ghost"
          size="sm"
          className="absolute bottom-4 right-4 text-white hover:bg-white/20"
          title={isZoomed ? "Click to zoom out" : "Click to zoom in"}
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
      </motion.div>

      {/* Photo info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-6">
        <div className="max-w-full px-4 mx-auto">
          <h3 className="text-xl font-semibold mb-2">{currentPhoto.title}</h3>
          {currentPhoto.description && (
            <p className="text-gray-300 mb-3">{currentPhoto.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {currentPhoto.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>Photo {currentIndex + 1} of {photos.length}</span>
            <span>{currentPhoto.event}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface PhotoGallerySimpleProps {
  isPhotographerView?: boolean;
  uploadedPhotos?: any[];
  galleryPath?: string;
}

const PhotoGallerySimple: React.FC<PhotoGallerySimpleProps> = ({
  isPhotographerView = false,
  uploadedPhotos = [],
  galleryPath,
}) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingPhotos, setDownloadingPhotos] = useState<Set<string>>(new Set());
  const [downloadedPhotos, setDownloadedPhotos] = useState<Set<string>>(new Set());
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  // Fetch photos from backend API
  useEffect(() => {
    const fetchPhotos = async () => {
      if (!galleryPath) return;

      try {
        // Determine sister parameter from gallery path
        const sister = galleryPath === '/sister-a-gallery' ? 'sister-a' : 'sister-b';

        const photosEndpoint = `${API_BASE_URL}/api/photos?sister=${sister}`;

        const response = await fetch(photosEndpoint);

        if (!response.ok) {
          console.error('Failed to fetch photos:', response.status);
          return;
        }

        const photosData = await response.json();

        // Handle object response from new API version
        const photosArray = Array.isArray(photosData) ? photosData : (photosData.photos || []);

        const mappedPhotos = photosArray.map(mapApiPhotoToPhotoType);

        setPhotos(mappedPhotos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
    };

    // Initial fetch
    fetchPhotos();

    // Auto-refresh every 30 seconds to check for new photos
    const intervalId = setInterval(fetchPhotos, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [galleryPath]);

  // Memoize uploaded photo objects based on uploadedPhotos
  const uploadedPhotoObjects = useMemo(() => {
    if (uploadedPhotos.length === 0) return [];
    return uploadedPhotos.map((uploadedPhoto, index) => ({
      id: `uploaded-${uploadedPhoto.id || index}`,
      url: uploadedPhoto.preview || uploadedPhoto.url || '/couple-frame-placeholder.png',
      thumbnail: uploadedPhoto.preview || uploadedPhoto.thumbnail || '/couple-frame-placeholder.png',
      title: uploadedPhoto.title || uploadedPhoto.file?.name || `Uploaded Photo ${index + 1}`,
      description: uploadedPhoto.description || '',
      tags: uploadedPhoto.tags || ['uploaded', 'wedding'],
      event: uploadedPhoto.event || 'Wedding Photos',
      date: uploadedPhoto.date || new Date().toISOString(),
      views: uploadedPhoto.views || 0,
      downloads: uploadedPhoto.downloads || 0,
      photographer: uploadedPhoto.photographer || 'Photographer',
      faces: uploadedPhoto.faces || [],
      timestamp: uploadedPhoto.timestamp || new Date(),
      isUploaded: true,
    }));
  }, [uploadedPhotos]);

  // Add uploaded photos to the existing photos
  useEffect(() => {
    if (uploadedPhotoObjects.length > 0) {
      setPhotos(prev => [...uploadedPhotoObjects, ...prev]);
    }
  }, [uploadedPhotoObjects]);

  // Filter photos based on search
  useEffect(() => {
    let filtered = photos;

    if (searchQuery) {
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPhotos(filtered);
  }, [photos, searchQuery]);

  const handleViewPhoto = (index: number) => {
    setSelectedPhotoIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedPhotoIndex(null);
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex < filteredPhotos.length - 1) {
      setSelectedPhotoIndex(selectedPhotoIndex + 1);
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhotoIndex !== null && selectedPhotoIndex > 0) {
      setSelectedPhotoIndex(selectedPhotoIndex - 1);
    }
  };

  const handleDownloadPhoto = async (photo: Photo) => {
    try {
      console.log('Downloading photo:', photo);

      // Add to downloading set
      setDownloadingPhotos(prev => new Set(prev).add(photo.id));

      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = photo.url;
      link.download = `${photo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;

      // For uploaded photos, we need to handle the URL differently
      if (photo.isUploaded) {
        // If it's an uploaded photo, try to fetch it first
        try {
          const response = await fetch(photo.url);
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up the blob URL
            URL.revokeObjectURL(blobUrl);
          } else {
            // If fetch fails, try direct download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } catch (error) {
          console.warn('Failed to fetch uploaded photo, trying direct download:', error);
          // Fallback to direct download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // For mock photos or external URLs, use direct download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // Update download count (in a real app, this would be sent to backend)
      setPhotos(prevPhotos =>
        prevPhotos.map(p =>
          p.id === photo.id
            ? { ...p, downloads: p.downloads + 1 }
            : p
        )
      );

      // Mark as downloaded and remove from downloading
      setDownloadedPhotos(prev => new Set(prev).add(photo.id));
      setDownloadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });

      // Show success feedback
      console.log(`Downloaded: ${photo.title}`);

      // Remove the downloaded indicator after 3 seconds
      setTimeout(() => {
        setDownloadedPhotos(prev => {
          const newSet = new Set(prev);
          newSet.delete(photo.id);
          return newSet;
        });
      }, 3000);

    } catch (error) {
      console.error('Error downloading photo:', error);

      // Remove from downloading set on error
      setDownloadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo.id);
        return newSet;
      });

      // In a real app, you might want to show a toast notification here
      alert('Failed to download photo. Please try again.');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut" as Easing
      }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Search and Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative flex-1">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Input
              placeholder="Search photos by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Photo Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        <AnimatePresence mode="popLayout">
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              variants={itemVariants}
              layout
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
              whileHover={{
                scale: 1.05,
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Card
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleViewPhoto(index)}
              >
                <motion.div
                  className="aspect-square relative"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.img
                    src={photo.thumbnail}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onError={(e) => {
                      console.warn(`Failed to load image: ${photo.thumbnail}`);
                      // Fallback for broken images
                      (e.target as HTMLImageElement).src = '/couple-frame-placeholder.png';
                    }}
                    onLoad={() => {
                      console.log(`Successfully loaded image: ${photo.thumbnail}`);
                    }}
                  />
                  <AnimatePresence>
                    {photo.isUploaded && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Badge className="absolute top-2 left-2 bg-green-500 animate-pulse">
                          New
                        </Badge>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                <CardContent className="p-3">
                  <motion.h3
                    className="font-semibold text-sm mb-1 truncate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {photo.title}
                  </motion.h3>
                  <motion.div
                    className="flex flex-wrap gap-1 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {photo.tags.slice(0, 2).map((tag, tagIndex) => (
                      <motion.div
                        key={tag}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + tagIndex * 0.1 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Badge variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      </motion.div>
                    ))}
                    {photo.tags.length > 2 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 }}
                        whileHover={{ scale: 1.1 }}
                      >
                        <Badge variant="secondary" className="text-xs">
                          +{photo.tags.length - 2}
                        </Badge>
                      </motion.div>
                    )}
                  </motion.div>

                  {photo.event && (
                    <motion.div
                      className="flex items-center justify-between text-xs text-gray-500 mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span>{photo.event}</span>
                    </motion.div>
                  )}

                  <motion.div
                    className="flex items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <motion.span
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Eye className="w-3 h-3" />
                        {photo.views}
                      </motion.span>
                      <motion.span
                        className="flex items-center gap-1"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Download className="w-3 h-3" />
                        {photo.downloads}
                      </motion.span>
                    </div>

                    <motion.div
                      className="flex gap-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      {isPhotographerView && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewPhoto(index);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            View
                          </Button>
                        </motion.div>
                      )}
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadPhoto(photo);
                          }}
                          className="h-6 px-2 text-xs"
                          disabled={downloadingPhotos.has(photo.id)}
                        >
                          <AnimatePresence mode="wait">
                            {downloadingPhotos.has(photo.id) ? (
                              <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1"
                              >
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full"
                                />
                                <span>Downloading...</span>
                              </motion.div>
                            ) : downloadedPhotos.has(photo.id) ? (
                              <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1 text-green-600"
                              >
                                <Check className="w-3 h-3" />
                                <span>Downloaded!</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="download"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Button>
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {filteredPhotos.length === 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              className="text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              No photos to display.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info */}
      {isPhotographerView && (
        <motion.div
          className="mt-4 p-4 bg-gray-100 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Total photos: {photos.length}</p>
          <p>Filtered photos: {filteredPhotos.length}</p>
          <p>Uploaded photos: {uploadedPhotos.length}</p>
          <p>Search query: "{searchQuery}"</p>
        </motion.div>
      )}

      {/* Photo Viewer Modal */}
      <AnimatePresence>
        {selectedPhotoIndex !== null && (
          <PhotoViewer
            photos={filteredPhotos}
            currentIndex={selectedPhotoIndex}
            onClose={handleCloseViewer}
            onNext={handleNextPhoto}
            onPrev={handlePrevPhoto}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PhotoGallerySimple;
