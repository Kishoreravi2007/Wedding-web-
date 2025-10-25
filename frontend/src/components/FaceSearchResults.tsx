/**
 * Face Search Results Component
 * 
 * This component displays matching photos from the wedding gallery
 * based on face recognition search.
 */

import React, { useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { 
  X, 
  Download, 
  Eye, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // Import Framer Motion

interface FaceSearchResultsProps {
  capturedFaceImage: string | null;
  searchResults: string[];
  onClose: () => void;
  weddingName: 'sister_a' | 'sister_b';
  searchError: string | null;
}

const FaceSearchResults: React.FC<FaceSearchResultsProps> = ({ 
  capturedFaceImage, 
  searchResults, 
  onClose,
  weddingName,
  searchError
}) => {
  const weddingTitle = weddingName === 'sister_a' ? "Sister A's Wedding" : "Sister B's Wedding";

  // Download photo
  const downloadPhoto = useCallback(async (photoUrl: string) => {
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const filename = photoUrl.substring(photoUrl.lastIndexOf('/') + 1); // Extract filename from URL
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('❌ Download failed:', error);
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl"
        >
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-semibold">Your Photos from {weddingTitle}</h3>
                <p className="text-sm text-gray-600">
                  {searchResults.length > 0 ? `Found ${searchResults.length} matching photo(s)` : ''}
                </p>
              </div>
              <Button onClick={onClose} variant="ghost" size="sm">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <CardContent className="p-6">
              {/* Captured Face Image */}
              {capturedFaceImage && (
                <div className="mb-6 text-center">
                  <h4 className="text-md font-semibold mb-2">Your Captured Face:</h4>
                  <img 
                    src={capturedFaceImage} 
                    alt="Captured Face" 
                    className="mx-auto w-32 h-32 object-cover rounded-full border-2 border-blue-500" 
                  />
                </div>
              )}

              {/* Error State */}
              {searchError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center mb-6">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-red-900 mb-2">Search Issue</h4>
                  <p className="text-red-700 whitespace-pre-line">{searchError}</p>
                  <Button onClick={onClose} className="mt-4"> {/* Changed to onClose */}
                    Close
                  </Button>
                </div>
              )}

              {/* No Results State */}
              {!searchError && searchResults.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
                  <ImageIcon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="font-semibold text-yellow-900 mb-2">No Matching Photos Found</h4>
                  <p className="text-yellow-700">
                    We couldn't find any photos of you in {weddingTitle} yet.
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
              {searchResults.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-900">
                        Found {searchResults.length} photo(s) with you in them!
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.map((photoUrl, index) => (
                      <motion.div
                        key={photoUrl}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card className="overflow-hidden">
                          <div className="relative">
                            <img
                              src={photoUrl}
                              alt={`Match ${index + 1}`}
                              className="w-full h-48 object-cover"
                              onLoad={() => {
                                console.log('✅ Image loaded successfully:', photoUrl);
                              }}
                              onError={(e) => {
                                console.error('❌ Failed to load image:', photoUrl);
                                const isHEIC = photoUrl.toLowerCase().includes('.heic');
                                const fallbackText = isHEIC ? 'HEIC+Format+Not+Supported' : 'Image+Not+Available';
                                (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300?text=${fallbackText}`;
                              }}
                            />
                          </div>
                          
                          <CardContent className="p-4">
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => downloadPhoto(photoUrl)}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                              
                              <Button
                                onClick={() => window.open(photoUrl, '_blank')}
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FaceSearchResults;
