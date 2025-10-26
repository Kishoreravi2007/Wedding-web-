"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Calendar, Users, Camera, X, ChevronLeft, ChevronRight, ZoomIn, UserPlus, Tag, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { loadFaceDetectionModels, detectFaces, FaceDetectionResult } from '@/utils/faceDetection'; // Import from our utility
import * as faceapi from 'face-api.js';
import { Photo as PhotoType } from '@/types/photo'; // Import Photo interface from types
import { getUploadedFiles, UploadedFile } from '@/services/fileUploadService'; // Import getUploadedFiles
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';
import { useTranslation } from 'react-i18next';

interface Person {
  id: string;
  name: string;
  role: string;
  avatar: string;
  descriptor?: Float32Array; // Use Float32Array for descriptor
}

// Mock people data for face tagging (can be replaced with real data from backend)
const mockPeople: Person[] = [
  { id: '1', name: 'Parvathy C', role: 'Bride', avatar: '', descriptor: new Float32Array(Array(128).fill(0.1)) }, // Example descriptor
  { id: '2', name: 'Sreedevi C', role: 'Bride', avatar: '', descriptor: new Float32Array(Array(128).fill(0.2)) }, // Example descriptor
  { id: '3', name: 'Groom', role: 'Groom', avatar: '', descriptor: new Float32Array(Array(128).fill(0.3)) }, // Example descriptor
  { id: '4', name: 'Mother of Bride', role: 'Family', avatar: '', descriptor: new Float32Array(Array(128).fill(0.4)) }, // Example descriptor
  { id: '5', name: 'Father of Bride', role: 'Family', avatar: '', descriptor: new Float32Array(Array(128).fill(0.9)) }, // Example descriptor
  { id: '6', name: 'Best Friend', role: 'Friend', avatar: '', descriptor: new Float32Array(Array(128).fill(0.8)) }, // Example descriptor
  { id: '7', name: 'Photographer', role: 'Vendor', avatar: '', descriptor: new Float32Array(Array(128).fill(0.7)) }, // Example descriptor
];

interface PhotoViewerProps {
  photos: PhotoType[]; // Use PhotoType
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFacesDetected: (photoId: string, faces: PhotoType['faces']) => void; // Use PhotoType['faces']
  onUpdatePhoto: (photoId: string, updates: Partial<PhotoType>) => void; // New prop to update photo in parent
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ photos, currentIndex, onClose, onNext, onPrev, onFacesDetected }) => {
  const { t } = useTranslation();
  const [isZoomed, setIsZoomed] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState<FaceDetectionResult[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const currentPhoto = photos[currentIndex];
  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);

  // Initialize FaceMatcher
  useEffect(() => {
    if (mockPeople.length > 0) {
      const labeledDescriptors = mockPeople
        .filter(person => person.descriptor)
        .map(person =>
          new faceapi.LabeledFaceDescriptors(
            person.name,
            [new Float32Array(person.descriptor!)]
          )
        );
      faceMatcherRef.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6); // 0.6 is a good distance threshold
    }
  }, []);

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

  useEffect(() => {
    const runFaceDetection = async () => {
      if (imgRef.current && currentPhoto) {
        setIsDetecting(true);
        try {
          await loadFaceDetectionModels();
          const detections = await detectFaces(imgRef.current);
          setDetectedFaces(detections);

          const newFaces: PhotoType['faces'] = detections.map(detection => {
            const box = detection.detection.box;
            let personName = 'Unknown';

            if (faceMatcherRef.current && detection.descriptor) {
              const bestMatch = faceMatcherRef.current.findBestMatch(detection.descriptor);
              if (bestMatch.distance < 0.6) { // Use the threshold
                personName = bestMatch.label;
              }
            }

            return {
              personName: personName,
              box: {
                x: (box.x / imgRef.current!.naturalWidth) * 100,
                y: (box.y / imgRef.current!.naturalHeight) * 100,
                width: (box.width / imgRef.current!.naturalWidth) * 100,
                height: (box.height / imgRef.current!.naturalHeight) * 100,
              },
              descriptor: detection.descriptor, // descriptor is already Float32Array
            };
          });
          onFacesDetected(currentPhoto.id, newFaces);

        } catch (error) {
          console.error('Error during face detection:', error);
        } finally {
          setIsDetecting(false);
        }
      }
    };

    // Ensure image is loaded before running detection
    if (imgRef.current?.complete) {
      runFaceDetection();
    } else {
      imgRef.current?.addEventListener('load', runFaceDetection);
    }

    return () => {
      imgRef.current?.removeEventListener('load', runFaceDetection);
    };
  }, [currentPhoto, onFacesDetected]);


  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
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
      <div className="relative max-w-4xl max-h-full p-4">
        {isDetecting && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20 text-white">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Detecting faces...
          </div>
        )}
        <img
          ref={imgRef}
          src={currentPhoto.url}
          alt={currentPhoto.title}
          className={cn(
            "max-w-full max-h-full object-contain transition-transform duration-300 cursor-pointer",
            isZoomed ? "scale-150" : "scale-100"
          )}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* AI Detected Face overlays */}
        {!isZoomed && detectedFaces.map((detection, index) => {
          const box = detection.detection.box;
          // Scale box coordinates to percentage relative to image natural size
          const imgWidth = imgRef.current?.naturalWidth || 1;
          const imgHeight = imgRef.current?.naturalHeight || 1;

          const x = (box.x / imgWidth) * 100;
          const y = (box.y / imgHeight) * 100;
          const width = (box.width / imgWidth) * 100;
          const height = (box.height / imgHeight) * 100;

          return (
            <div
              key={index}
              className="absolute border-2 border-red-500 bg-red-500/20 rounded"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              {/* Optional: Display expressions or other info on hover */}
              <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {/* Display dominant expression if available */}
                {detection.expressions && Object.keys(detection.expressions).length > 0
                  ? Object.entries(detection.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                  : 'Face'}
              </div>
            </div>
          );
        })}

        {/* Zoom indicator */}
        <Button
          onClick={() => setIsZoomed(!isZoomed)}
          variant="ghost"
          size="sm"
          className="absolute bottom-4 right-4 text-white hover:bg-white/20"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
      </div>

      {/* Photo info */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white p-6">
        <div className="max-w-full px-4 mx-auto">
          <h3 className="text-xl font-semibold mb-2">{currentPhoto.title}</h3>
          <p className="text-gray-300 mb-3">{currentPhoto.description}</p>

          {/* People in photo (now showing AI detected faces) */}
          {detectedFaces.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                <Users className="w-4 h-4" />
                {t('detectedFaces')}: {detectedFaces.length}
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedFaces.map((detection, index) => {
                  let personName = t('unknown');
                  if (faceMatcherRef.current && detection.descriptor) {
                    const bestMatch = faceMatcherRef.current.findBestMatch(detection.descriptor);
                    if (bestMatch.distance < 0.6) {
                      personName = bestMatch.label;
                    }
                  }
                  return (
                    <Badge key={index} variant="outline" className="text-xs border-white/30 text-white">
                      {personName !== t('unknown') ? personName : (detection.expressions && Object.keys(detection.expressions).length > 0
                        ? Object.entries(detection.expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0]
                        : t('face'))}
                    </Badge>
                  );
                })}
              </div>
            </div>
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
            <span>{new Date(currentPhoto.date).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PhotoGalleryProps {
  isPhotographerView?: boolean;
  sister?: 'sister-a' | 'sister-b'; // Use sister prop for filtering
  uploadedPhotos: PhotoType[]; // Prop to receive photos from parent
  onUpdatePhoto?: (photoId: string, updates: Partial<PhotoType>) => void; // Callback to update photo in parent
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ isPhotographerView = false, sister, uploadedPhotos, onUpdatePhoto }) => {
  const [photos, setPhotos] = useState<PhotoType[]>([]); // Internal state for photos
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedPerson, setSelectedPerson] = useState<string>('');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [people, setPeople] = useState<Person[]>(mockPeople);
  const [showFaceTagger, setShowFaceTagger] = useState(false);
  const [taggingPhoto, setTaggingPhoto] = useState<PhotoType | null>(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (sister) {
          queryParams.append('sister', sister);
        }
        const url = `${API_BASE_URL}/api/photos?${queryParams.toString()}`;

        const response = await fetch(url); // Public endpoint, no auth required
        if (!response.ok) {
          throw new Error('Failed to fetch photos');
        }
        const fetchedBackendPhotos = await response.json();

        // Map backend photos to PhotoType
        const mappedPhotos: PhotoType[] = fetchedBackendPhotos.map((file: any) => ({
          id: file.id,
          url: file.public_url || file.publicUrl, // Support both snake_case and camelCase
          thumbnail: file.public_url || file.publicUrl, // Assuming thumbnail is same as full image for now
          title: file.filename,
          description: file.description || '', // Include description if available
          tags: file.tags || [], // Include tags if available
          event: file.sister, // Using 'sister' as event for now, can be refined
          date: new Date(file.uploaded_at || file.created_at).toISOString(), // Use uploaded_at from Supabase
          views: 0,
          downloads: 0,
          photographer: 'Photographer', // Default photographer
          faces: file.photo_faces || [], // Include faces from backend
          timestamp: new Date(file.uploaded_at || file.created_at), // Use uploaded_at from Supabase
        }));
        setPhotos(mappedPhotos);
      } catch (error) {
        console.error('Error fetching photos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhotos();
  }, [sister]); // Re-fetch photos when sister changes

  // Update internal photos state when uploadedPhotos prop changes (e.g., after a new upload)
  useEffect(() => {
    setPhotos(prevPhotos => {
      const newPhotos = [...prevPhotos];
      uploadedPhotos.forEach(uploadedPhoto => {
        if (!newPhotos.some(p => p.id === uploadedPhoto.id)) {
          newPhotos.push(uploadedPhoto);
        }
      });
      return newPhotos;
    });
  }, [uploadedPhotos]);


  // Get all unique tags and people from the internal photos state
  const allTags = Array.from(new Set(photos.flatMap(photo => photo.tags)));
  const allPeople = Array.from(new Set(photos.flatMap(photo => photo.faces?.map(face => face.personName) || [])));

  // Filter photos based on search, tags, and people
  useEffect(() => {
    let filtered = photos;

    if (searchQuery) {
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        photo.faces?.some(face => face.personName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedTag) {
      filtered = filtered.filter(photo => photo.tags.includes(selectedTag));
    }

    if (selectedPerson) {
      filtered = filtered.filter(photo =>
        photo.faces?.some(face => face.personName === selectedPerson)
      );
    }

    setFilteredPhotos(filtered);
  }, [photos, searchQuery, selectedTag, selectedPerson]); // Add photos to dependency array

  const handlePhotoClick = (index: number) => {
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // This function is no longer directly used as PhotoUploadFirebase handles uploads
    // Keeping it as a placeholder or for future use if needed for a different upload mechanism
    console.warn("handleFileUpload in PhotoGallery is deprecated. Use PhotoUploadSimple instead.");
  };

  const themeColors = sister === 'sister-a'
    ? { primary: '#8C3B3B', accent: '#D4AF37', bg: 'bg-red-50' }
    : sister === 'sister-b'
      ? { primary: '#1B5E20', accent: '#B8860B', bg: 'bg-green-50' }
      : { primary: '#6B7280', accent: '#9CA3AF', bg: 'bg-gray-50' }; // Default colors

  const handleFacesDetected = (photoId: string, newFaces: PhotoType['faces']) => {
    setPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo.id === photoId ? { ...photo, faces: newFaces } : photo
      )
    );
    if (onUpdatePhoto) {
      onUpdatePhoto(photoId, { faces: newFaces });
    }
  };

  const handleUpdatePhoto = (photoId: string, updates: Partial<PhotoType>) => {
    setPhotos(prevPhotos =>
      prevPhotos.map(photo =>
        photo.id === photoId ? { ...photo, ...updates } : photo
      )
    );
    if (onUpdatePhoto) {
      onUpdatePhoto(photoId, updates);
    }
  };

  return (
    <div className={cn("min-h-screen p-4", isPhotographerView ? "bg-gray-50" : themeColors.bg)}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-4xl md:text-5xl mb-4" style={{ color: themeColors.primary }}>
            {isPhotographerView ? t('photoGalleryManagement') : t('weddingPhotoGalleryTitle')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isPhotographerView
              ? t('uploadAndManagePhotos')
              : t('browseAndDownloadDescription')
            }
          </p>
        </div>

        {/* Photographer Upload Section (now handled by PhotoUploadFirebase in Dashboard) */}
        {/* {isPhotographerView && (
          <Card className="mb-8 border-2 border-dashed border-gray-300">
            <CardContent className="p-6 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Upload New Photos</h3>
              <p className="text-text-gray-600 mb-4">Select multiple photos to upload to the gallery</p>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isUploading}
                />
                <Button disabled={isUploading} className="bg-stone-600 hover:bg-stone-700">
                  {isUploading ? 'Uploading...' : 'Choose Photos'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search photos, people, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                onClick={() => setSelectedTag('')}
                className="text-sm"
              >
                All Photos
              </Button>
              {allTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  onClick={() => setSelectedTag(tag)}
                  className="text-sm capitalize"
                >
                  {tag}
                </Button>
              ))}
            </div>

            {/* People Filters */}
            {allPeople.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mr-2">
                  <Users className="w-4 h-4" />
                  People:
                </div>
                <Select value={selectedPerson} onValueChange={setSelectedPerson}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by person" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All People</SelectItem>
                    {allPeople.map((person) => (
                      <SelectItem key={person} value={person}>
                        {person}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <p className="text-gray-600">Loading photos...</p>
          </div>
        )}

        {/* Photo Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredPhotos.map((photo, index) => (
              <Card
                key={photo.id}
                className="group cursor-pointer overflow-hidden hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handlePhotoClick(index)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={photo.thumbnail}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1 flex-1">{photo.title}</h3>
                    {isPhotographerView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaggingPhoto(photo);
                          setShowFaceTagger(true);
                        }}
                        className="ml-2 p-1 h-6 w-6"
                      >
                        <Tag className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{photo.description}</p>

                  {/* People in photo */}
                  {photo.faces && photo.faces.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <Users className="w-3 h-3" />
                        People: {photo.faces.map(face => face.personName).join(', ')}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(photo.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {photo.photographer}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {photo.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {photo.faces && photo.faces.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {photo.faces.length} face{photo.faces.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No photos found */}
        {!isLoading && filteredPhotos.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No photos found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Photo count */}
        <div className="text-center text-gray-600 mb-8">
          Showing {filteredPhotos.length} of {photos.length} photos
        </div>
      </div>

      {/* Photo Viewer Modal */}
      {selectedPhotoIndex !== null && (
        <PhotoViewer
          photos={filteredPhotos}
          currentIndex={selectedPhotoIndex}
          onClose={handleCloseViewer}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
          onFacesDetected={handleFacesDetected}
          onUpdatePhoto={handleUpdatePhoto}
        />
      )}

      {/* Face Tagging Modal */}
      <Dialog open={showFaceTagger} onOpenChange={setShowFaceTagger}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Tag People in Photo</DialogTitle>
          </DialogHeader>
          <div className="flex gap-6">
            {/* Photo Display */}
            <div className="flex-1 relative">
              <img
                src={taggingPhoto?.url}
                alt={taggingPhoto?.title}
                className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
              />
              {/* Face overlays would go here for actual face detection */}
            </div>

            {/* Tagging Interface */}
            <div className="w-80 space-y-4">
              <div>
                <h4 className="font-semibold mb-2">People in this photo:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {taggingPhoto?.faces?.map((face, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{face.personName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Remove face tag
                          if (taggingPhoto) {
                            const updatedPhoto = {
                              ...taggingPhoto,
                              faces: taggingPhoto.faces?.filter((_, i) => i !== index)
                            };
                            handleUpdatePhoto(taggingPhoto.id, { faces: updatedPhoto.faces });
                            setTaggingPhoto(updatedPhoto);
                          }
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Add Person:</h4>
                <Select
                  onValueChange={(personId) => {
                    const person = people.find(p => p.id === personId);
                    if (person && taggingPhoto) {
                      const newFace: PhotoType['faces'][0] = { // Explicitly type newFace
                        personName: person.name,
                        box: { x: 50, y: 50, width: 10, height: 15 }, // Default position
                        descriptor: person.descriptor, // Use the Float32Array descriptor directly
                      };
                      const updatedPhoto = {
                        ...taggingPhoto,
                        faces: [...(taggingPhoto.faces || []), newFace]
                      };
                      handleUpdatePhoto(taggingPhoto.id, { faces: updatedPhoto.faces });
                      setTaggingPhoto(updatedPhoto);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name} ({person.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setShowFaceTagger(false);
                    setTaggingPhoto(null);
                  }}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;
