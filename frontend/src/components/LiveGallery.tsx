/**
 * Live Gallery Component
 * 
 * Displays photos in real-time as they are uploaded via live sync
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLiveSync } from '@/hooks/useLiveSync';
import { API_BASE_URL } from '@/lib/api';
import { Camera, Wifi, WifiOff, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';

interface LiveGalleryProps {
  eventId?: string;
  sister?: 'sister-a' | 'sister-b';
  maxPhotos?: number;
}

interface Photo {
  id: string;
  public_url: string;
  filename: string;
  title?: string;
  uploaded_at?: string;
  sync_timestamp?: string;
}

export function LiveGallery({ eventId, sister, maxPhotos = 50 }: LiveGalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isConnected, newPhotos, clearNewPhotos } = useLiveSync({
    eventId,
    sister,
    enabled: true,
  });

  // Load initial photos
  useEffect(() => {
    loadPhotos();
  }, [eventId, sister]);

  // Add new photos from WebSocket
  useEffect(() => {
    if (newPhotos.length > 0) {
      const newPhotoData = newPhotos.map((np) => np.photo);
      setPhotos((prev) => {
        // Avoid duplicates
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newPhotoData.filter((p) => !existingIds.has(p.id));
        return [...uniqueNew, ...prev].slice(0, maxPhotos);
      });
      clearNewPhotos();
    }
  }, [newPhotos, clearNewPhotos, maxPhotos]);

  const loadPhotos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (eventId) params.append('eventId', eventId);
      if (sister) params.append('sister', sister);
      params.append('limit', maxPhotos.toString());

      const response = await axios.get(`${API_BASE_URL}/api/live/photos?${params.toString()}`);
      setPhotos(response.data.photos || []);
    } catch (err: any) {
      console.error('Error loading photos:', err);
      setError(err.response?.data?.message || 'Failed to load photos');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Loading photos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600">Live sync active</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-600">Disconnected</span>
            </>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={loadPhotos}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {photos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Camera className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No photos yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Photos will appear here as they are uploaded via live sync
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <Card
              key={photo.id}
              className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={photo.public_url}
                  alt={photo.title || photo.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    {formatTime(photo.sync_timestamp || photo.uploaded_at)}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(photo.public_url, '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs text-gray-600 truncate">
                  {photo.title || photo.filename}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

