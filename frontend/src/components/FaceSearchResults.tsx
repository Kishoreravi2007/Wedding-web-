/**
 * Face Search Results Component
 * 
 * This component displays matching photos from the wedding gallery
 * based on face recognition search.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  X, 
  Download, 
  Eye, 
  Image as ImageIcon,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import * as faceapi from 'face-api.js';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface FaceMatch {
  id: string;
  photoUrl: string;
  confidence: number;
  metadata: {
    filename: string;
    uploadedAt: string;
  };
}

interface FaceSearchResultsProps {
  faceDescriptor: Float32Array;
  onClose: () => void;
  eventId?: string;
}

const FaceSearchResults: React.FC<FaceSearchResultsProps> = ({ 
  faceDescriptor, 
  onClose,
  eventId = 'wedding-event'
}) => {
  const [matches, setMatches] = useState<FaceMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchComplete, setSearchComplete] = useState(false);

  // Calculate similarity between two face descriptors
  const calculateSimilarity = useCallback((desc1: Float32Array, desc2: Float32Array): number => {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < desc1.length; i++) {
      dotProduct += desc1[i] * desc2[i];
      norm1 += desc1[i] * desc1[i];
      norm2 += desc2[i] * desc2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }, []);

  // Search for matching photos
  const searchPhotos = useCallback(async () => {
    setIsSearching(true);
    setError('');
    
    try {
      console.log('🔍 Searching for matching photos...');

      // Check if Supabase is configured
      if (!supabase) {
        setError('Face search is not configured. Please set up Supabase connection.');
        setIsSearching(false);
        return;
      }

      // Get photos from Supabase
      const { data: photos, error: fetchError } = await supabase
        .from('event_photos')
        .select('*')
        .eq('event_id', eventId);

      if (fetchError) {
        console.error('❌ Error fetching photos:', fetchError);
        setError('Unable to fetch photos from gallery. Please try again.');
        setIsSearching(false);
        return;
      }

      if (!photos || photos.length === 0) {
        setError('No photos found in the wedding gallery. Photos will be uploaded by the photographer.');
        setIsSearching(false);
        setSearchComplete(true);
        return;
      }

      console.log(`📸 Found ${photos.length} photos to search through`);
      const foundMatches: FaceMatch[] = [];

      // Search through photos
      for (const photo of photos) {
        try {
          // Get face embeddings from database
          if (photo.face_embeddings && Array.isArray(photo.face_embeddings)) {
            for (const embedding of photo.face_embeddings) {
              const storedDescriptor = new Float32Array(embedding);
              const similarity = calculateSimilarity(faceDescriptor, storedDescriptor);

              // Match threshold (60% similarity)
              if (similarity > 0.6) {
                // Get photo URL from storage
                const { data: photoData } = await supabase.storage
                  .from('event-photos')
                  .getPublicUrl(photo.storage_path);

                if (photoData) {
                  foundMatches.push({
                    id: photo.id,
                    photoUrl: photoData.publicUrl,
                    confidence: similarity,
                    metadata: {
                      filename: photo.filename,
                      uploadedAt: photo.created_at
                    }
                  });
                  break; // Found a match in this photo
                }
              }
            }
          }
        } catch (error) {
          console.error('❌ Error processing photo:', error);
          continue;
        }
      }

      // Sort by confidence
      foundMatches.sort((a, b) => b.confidence - a.confidence);

      setMatches(foundMatches);
      setSearchComplete(true);

      if (foundMatches.length > 0) {
        console.log(`✅ Found ${foundMatches.length} matching photos`);
      } else {
        setError('No matching photos found. This could mean: \n• Photos haven\'t been uploaded yet\n• Your face wasn\'t in the uploaded photos\n• Lighting conditions were different');
      }

    } catch (error) {
      console.error('❌ Search failed:', error);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [faceDescriptor, eventId, calculateSimilarity]);

  // Start search on mount
  useEffect(() => {
    searchPhotos();
  }, [searchPhotos]);

  // Download photo
  const downloadPhoto = async (photoUrl: string, filename: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Your Photos from the Gallery</h3>
            <p className="text-sm text-gray-600">
              {isSearching ? 'Searching...' : searchComplete ? `Found ${matches.length} matching photo(s)` : ''}
            </p>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <CardContent className="p-6">
          {/* Loading State */}
          {isSearching && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Searching through wedding photos...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
            </div>
          )}

          {/* Error State */}
          {error && !isSearching && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="font-semibold text-red-900 mb-2">Search Issue</h4>
              <p className="text-red-700 whitespace-pre-line">{error}</p>
              <Button onClick={searchPhotos} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {/* No Results State */}
          {!isSearching && searchComplete && matches.length === 0 && !error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <ImageIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h4 className="font-semibold text-yellow-900 mb-2">No Matching Photos Found</h4>
              <p className="text-yellow-700">
                We couldn't find any photos of you in the wedding gallery yet.
              </p>
              <div className="mt-4 text-sm text-yellow-600 text-left max-w-md mx-auto">
                <p className="font-medium mb-2">Possible reasons:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Photos haven't been uploaded by the photographer yet</li>
                  <li>Your face wasn't captured in the uploaded photos</li>
                  <li>Different lighting conditions in the photos</li>
                  <li>Try adjusting your face angle and searching again</li>
                </ul>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!isSearching && matches.length > 0 && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-900">
                    Found {matches.length} photo(s) with you in them!
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map((match, index) => (
                  <Card key={match.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={match.photoUrl}
                        alt={`Match ${index + 1}`}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                        }}
                      />
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {(match.confidence * 100).toFixed(1)}% Match
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600 truncate">
                            {match.metadata.filename}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {new Date(match.metadata.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => downloadPhoto(match.photoUrl, match.metadata.filename)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          
                          <Button
                            onClick={() => window.open(match.photoUrl, '_blank')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceSearchResults;
