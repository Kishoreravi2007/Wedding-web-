/**
 * Person-Specific Gallery Component
 * 
 * Displays all photos containing a specific person with:
 * - Grid/list view toggle
 * - Confidence filtering
 * - Face highlighting
 * - Verification status
 * - Download and share options
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { 
  Grid, 
  List, 
  User, 
  Download, 
  Share2, 
  CheckCircle, 
  AlertCircle,
  Search,
  Filter,
  Image as ImageIcon,
  ZoomIn,
  Calendar,
  Loader2
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';
import { showSuccess, showError } from '@/utils/toast';

interface PersonGalleryProps {
  personId: string;
  personName?: string;
  personRole?: string;
}

interface PhotoData {
  id: string;
  filename: string;
  public_url: string;
  title: string;
  description?: string;
  event_type?: string;
  uploaded_at: string;
  faceData: {
    confidence: number;
    isVerified: boolean;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  };
}

const PersonGallery: React.FC<PersonGalleryProps> = ({ 
  personId, 
  personName = 'Person',
  personRole = 'Guest'
}) => {
  const [photos, setPhotos] = useState<PhotoData[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<PhotoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  const [minConfidence, setMinConfidence] = useState(0.6);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch photos for this person
  useEffect(() => {
    fetchPhotos();
  }, [personId, minConfidence]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/photos-enhanced/by-person/${personId}?minConfidence=${minConfidence}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const data = await response.json();
      setPhotos(data.photos);
      setFilteredPhotos(data.photos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      showError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...photos];

    // Event filter
    if (eventFilter !== 'all') {
      filtered = filtered.filter(p => p.event_type === eventFilter);
    }

    // Verified only
    if (verifiedOnly) {
      filtered = filtered.filter(p => p.faceData.isVerified);
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPhotos(filtered);
  }, [photos, eventFilter, verifiedOnly, searchQuery]);

  // Download photo
  const handleDownload = async (photo: PhotoData) => {
    try {
      const response = await fetch(photo.public_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = photo.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showSuccess('Photo downloaded');
    } catch (error) {
      console.error('Error downloading photo:', error);
      showError('Failed to download photo');
    }
  };

  // Share photo
  const handleShare = async (photo: PhotoData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo.title,
          text: `Photo featuring ${personName}`,
          url: photo.public_url
        });
        showSuccess('Photo shared');
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(photo.public_url);
      showSuccess('Link copied to clipboard');
    }
  };

  // Get unique event types
  const eventTypes = ['all', ...new Set(photos.map(p => p.event_type).filter(Boolean))];

  // Statistics
  const stats = {
    total: photos.length,
    verified: photos.filter(p => p.faceData.isVerified).length,
    highConfidence: photos.filter(p => p.faceData.confidence >= 0.8).length,
    events: new Set(photos.map(p => p.event_type).filter(Boolean)).size
  };

  return (
    <div className="space-y-6">
      {/* Header with Person Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{personName}</CardTitle>
                <p className="text-gray-600">{personRole}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    {stats.total} Photos
                  </Badge>
                  <Badge variant="outline">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {stats.verified} Verified
                  </Badge>
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    {stats.events} Events
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search photos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Event Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Event</label>
              <Select value={eventFilter} onValueChange={setEventFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map(event => (
                    <SelectItem key={event} value={event}>
                      {event === 'all' ? 'All Events' : event}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Confidence Threshold */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Min Confidence: {Math.round(minConfidence * 100)}%
              </label>
              <Slider
                value={[minConfidence]}
                onValueChange={(value) => setMinConfidence(value[0])}
                min={0.3}
                max={1}
                step={0.05}
                className="mt-2"
              />
            </div>

            {/* View Mode */}
            <div className="space-y-2">
              <label className="text-sm font-medium">View</label>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Grid className="w-4 h-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <List className="w-4 h-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
          </div>

          {/* Verified Only Toggle */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="verifiedOnly"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="verifiedOnly" className="text-sm">
              Show only verified photos
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-3 text-gray-600">Loading photos...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPhotos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No photos found matching your filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setEventFilter('all');
                setVerifiedOnly(false);
                setSearchQuery('');
                setMinConfidence(0.6);
              }}
              className="mt-4"
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Photo Grid/List */}
      {!loading && filteredPhotos.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                : 'space-y-4'
            }>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={
                    viewMode === 'grid'
                      ? 'group relative aspect-square overflow-hidden rounded-lg bg-gray-100 cursor-pointer'
                      : 'flex gap-4 p-4 border rounded-lg hover:bg-gray-50'
                  }
                  onClick={() => setSelectedPhoto(photo)}
                >
                  {viewMode === 'grid' ? (
                    <>
                      <img
                        src={photo.public_url}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        {photo.faceData.isVerified && (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3" />
                          </Badge>
                        )}
                        <Badge variant="secondary">
                          {Math.round(photo.faceData.confidence * 100)}%
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <img
                        src={photo.public_url}
                        alt={photo.title}
                        className="w-32 h-32 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{photo.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {photo.description}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {photo.event_type && (
                            <Badge variant="outline">{photo.event_type}</Badge>
                          )}
                          {photo.faceData.isVerified && (
                            <Badge className="bg-green-500">Verified</Badge>
                          )}
                          <Badge variant="secondary">
                            {Math.round(photo.faceData.confidence * 100)}% match
                          </Badge>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(photo);
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(photo);
                            }}
                          >
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Detail Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedPhoto.public_url}
                  alt={selectedPhoto.title}
                  className="w-full rounded-lg"
                />
                {/* Face bounding box overlay */}
                <div
                  className="absolute border-2 border-blue-500 rounded"
                  style={{
                    left: `${selectedPhoto.faceData.boundingBox.x}%`,
                    top: `${selectedPhoto.faceData.boundingBox.y}%`,
                    width: `${selectedPhoto.faceData.boundingBox.width}%`,
                    height: `${selectedPhoto.faceData.boundingBox.height}%`
                  }}
                >
                  <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    {personName}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="font-medium">{selectedPhoto.event_type || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="font-medium">
                    {new Date(selectedPhoto.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Confidence</p>
                  <p className="font-medium">
                    {Math.round(selectedPhoto.faceData.confidence * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={selectedPhoto.faceData.isVerified ? 'bg-green-500' : 'bg-gray-500'}>
                    {selectedPhoto.faceData.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownload(selectedPhoto)}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => handleShare(selectedPhoto)}
                  variant="outline"
                  className="flex-1"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PersonGallery;

