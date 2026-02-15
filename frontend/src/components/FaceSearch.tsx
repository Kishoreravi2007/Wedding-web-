import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Search,
  Upload,
  Camera,
  Users,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  Download,
  Eye,
  X,
  Sparkles,
  User,
  Scan,
  Maximize2
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import heic2any from 'heic2any';

import { API_BASE_URL as BACKEND_URL, DEEPFACE_API_URL } from '@/lib/api';
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
// const DEEPFACE_API_URL = import.meta.env.VITE_DEEPFACE_API_URL || 'http://localhost:8002';

interface FaceMatch {
  id: string;
  photoUrl: string;
  confidence: number;
  metadata: {
    filename: string;
    uploadedAt: string;
    eventId?: string;
  };
}

interface FaceSearchProps {
  className?: string;
  eventId?: string;
}

const FaceSearch: React.FC<FaceSearchProps> = ({
  className = '',
  eventId = 'wedding-event'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchResults, setSearchResults] = useState<FaceMatch[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectedFace, setDetectedFace] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    console.log('✅ AI Photobooth Ready - Port 8002');
  }, []);

  const extractFaceDescriptor = useCallback(async (file: File): Promise<number[] | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('return_landmarks', 'false');
      formData.append('return_age_gender', 'false');
      formData.append('enforce_detection', 'false');

      const response = await fetch(`${DEEPFACE_API_URL}/api/faces/detect`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error(`DeepFace API error: ${response.status}`);

      const result = await response.json();
      if (!result.faces || result.faces.length === 0) {
        setError('We couldn\'t find a face in that photo. Try a clear selfie!');
        return null;
      }

      return result.faces[0].embedding;
    } catch (error) {
      console.error(error);
      setError('Connection issue. Please try again in a moment.');
      return null;
    }
  }, []);

  const searchForMatches = useCallback(async (queryDescriptor: number[]) => {
    try {
      setIsSearching(true);
      setError('');
      setSuccess('');

      const response = await axios.post(`${BACKEND_URL}/api/faces/find-similar`, {
        descriptor: queryDescriptor,
        limit: 100, // Show up to 100 matches
        threshold: 0.8, // Even more lenient for searching
        sister: eventId
      });

      console.log('🔍 Search results:', response.data);

      const { faces } = response.data;
      if (!faces || faces.length === 0) {
        setError('No matching photos found yet! We\'ll keep looking as more photos are uploaded.');
        setSearchResults([]);
        return;
      }

      const matches: FaceMatch[] = faces.map((photo: any) => ({
        id: photo.id,
        photoUrl: photo.public_url,
        confidence: photo.similarity || 0.7,
        metadata: {
          filename: photo.filename,
          uploadedAt: photo.uploaded_at || photo.created_at,
          eventId: photo.sister
        }
      })).sort((a: any, b: any) => b.confidence - a.confidence);

      setSearchResults(matches);
      setSuccess(`Success! We found ${matches.length} photos of you. Scroll down to see them!`);
    } catch (error) {
      setError('Search failed. Our server is taking a breather.');
    } finally {
      setIsSearching(false);
    }
  }, [eventId]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('📷 File selected:', { name: file.name, type: file.type, size: file.size });

    // Check for image type or common extensions
    const isImageType = file.type.startsWith('image/');
    const isHeicFile = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    const isImageExt = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

    if (!isImageType && !isImageExt && !isHeicFile) {
      console.warn('File validation failed:', { type: file.type, name: file.name });
      setError('Please select a valid image file (JPG, PNG, or HEIC).');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');
      setDetectedFace(null);
      setSearchResults([]);

      // Show original preview immediately (if browser supports it)
      const initialPreviewUrl = URL.createObjectURL(file);
      setUploadedImage(initialPreviewUrl);
      let previewUrl = initialPreviewUrl;

      // Convert HEIC to JPEG if needed
      let fileToProcess: File | Blob = file;
      if (isHeicFile) {
        try {
          // Dynamic check for heic2any
          if (typeof heic2any !== 'function') {
            throw new Error('HEIC converter not loaded correctly.');
          }

          const convertedBlob = await (heic2any as any)({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.8
          });
          fileToProcess = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

          // Re-set preview with converted image
          const convertedUrl = URL.createObjectURL(fileToProcess);
          setUploadedImage(convertedUrl);
          previewUrl = convertedUrl; // CRITICAL: Update the preview URL variable
        } catch (conversionError) {
          console.error('HEIC conversion failed:', conversionError);
          setError('Could not process this HEIC file. Please try a standard photo.');
          setIsUploading(false);
          return;
        }
      }

      console.log('Processing file:', { name: file.name, type: file.type, size: file.size });

      // Use the converted file for face detection
      const finalFile = fileToProcess instanceof File
        ? fileToProcess
        : new File([fileToProcess], file.name.replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' });

      const descriptor = await extractFaceDescriptor(finalFile);

      const img = new Image();
      img.onload = () => {
        if (descriptor) {
          setDetectedFace({ descriptor, image: img });
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setError('Failed to load image.');
        setIsUploading(false);
      };
      img.src = previewUrl;

    } catch (error) {
      setError('Upload failed.');
      setIsUploading(false);
    }
  }, [extractFaceDescriptor]);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setUploadedImage(null);
    setDetectedFace(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const downloadPhoto = useCallback(async (photoUrl: string, filename: string) => {
    try {
      const resp = await fetch(photoUrl);
      const blob = await resp.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } catch (e) {
      setError('Download failed.');
    }
  }, []);

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-8 ${className}`}>
      {/* Immersive Header */}
      {!uploadedImage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 py-8"
        >
          <div className="inline-block p-4 rounded-full bg-rose-50 border border-rose-100 mb-2">
            <Sparkles className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Step Into Our Photobooth</h2>
          <p className="text-gray-500 max-w-lg mx-auto italic font-serif text-lg">
            Let our AI find every beautiful moment you've shared with us today.
          </p>
        </motion.div>
      )}

      {/* Main Glass Container */}
      <div className="relative">
        <div className="absolute inset-x-0 -top-4 -bottom-4 bg-gradient-to-r from-rose-100/20 via-rose-200/20 to-rose-100/20 blur-3xl rounded-full" />

        <motion.div
          layout
          className="relative bg-white/70 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden"
        >
          {/* Upload Section */}
          <AnimatePresence mode="wait">
            {!uploadedImage ? (
              <motion.div
                key="dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center"
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  className={`
                    w-full max-w-xl aspect-[16/9] md:aspect-[2/1] rounded-3xl border-2 border-dashed 
                    flex flex-col items-center justify-center cursor-pointer transition-all duration-500
                    ${isHovering ? 'border-rose-400 bg-rose-50/50 scale-[1.01]' : 'border-rose-200 bg-white/30'}
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.heic,.heif"
                  />

                  <div className="relative group">
                    <div className="absolute inset-0 bg-rose-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-20 h-20 bg-white shadow-lg rounded-full flex items-center justify-center mb-6 border border-rose-50">
                      <Camera className="w-8 h-8 text-rose-500" />
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Upload Your Selfie</h3>
                  <p className="text-slate-500 text-center px-8">
                    Tap to capture or select a clear photo of your face
                  </p>

                  <div className="mt-8 flex gap-4 text-xs font-medium text-rose-400/60 tracking-widest uppercase">
                    <span>Precision AI</span>
                    <span>•</span>
                    <span>Instant Match</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                {/* Photo Preview with Scanning Animation */}
                <div className="relative group">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 shadow-2xl border-4 border-white">
                    <img src={uploadedImage} alt="Selfie" className="w-full h-full object-cover" />

                    {/* Scanning Animation */}
                    {(isUploading || isSearching) && (
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_rgba(244,63,94,0.8)] z-10"
                      />
                    )}

                    {detectedFace && !isSearching && (
                      <div className="absolute inset-0 border-4 border-rose-500/50 animate-pulse" />
                    )}
                  </div>

                  <button
                    onClick={clearSearch}
                    className="absolute -top-4 -right-4 p-3 bg-white shadow-xl rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Control Panel */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-serif font-bold text-slate-900">
                      {isUploading ? "Identifying You..." : detectedFace ? "Face Detected!" : "Hold On..."}
                    </h3>
                    <p className="text-slate-500">
                      {isUploading
                        ? "Our AI is analyzing your features to find the best matches."
                        : detectedFace
                          ? "We've mapped your face. Ready to search through the wedding album?"
                          : "Processing your photo..."}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {detectedFace && (
                      <Button
                        onClick={() => searchForMatches(detectedFace.descriptor)}
                        disabled={isSearching}
                        className="w-full h-16 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-lg font-bold shadow-xl shadow-rose-200"
                      >
                        {isSearching ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Searching 100+ Photos...
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <Scan className="w-5 h-5" />
                            Search Wedding Album
                          </div>
                        )}
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-slate-400 hover:text-rose-500"
                    >
                      Try a different photo
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="pt-8 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      YOLOv8 Precise Detection
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      512-dim Embedding
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toast-style Messages */}
          <div className="mt-8">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 text-green-700"
                >
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span className="font-medium">{success}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Results Title */}
      {
        searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between px-2"
          >
            <div className="space-y-1">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Your Found Moments</h3>
              <p className="text-sm text-slate-500">We found {searchResults.length} photos of you</p>
            </div>
            <Button variant="outline" onClick={clearSearch} className="rounded-full border-rose-200 text-rose-500">
              Start New Search
            </Button>
          </motion.div>
        )
      }

      {/* Results Masonry-ish Grid */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12"
          >
            {searchResults.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white rounded-[2rem] overflow-hidden border border-rose-100/50 shadow-xl shadow-rose-900/5"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img src={match.photoUrl} alt="Match" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />

                  {/* Confidence Badge */}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">
                      {match.confidence > 0.8 ? "Perfect Match" : "Great Shot"}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      {new Date(match.metadata.uploadedAt).toLocaleDateString()}
                    </div>
                    <span>DeepFace Match Score: {(match.confidence * 100).toFixed(0)}%</span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => downloadPhoto(match.photoUrl, match.metadata.filename)}
                      className="flex-1 bg-slate-900 hover:bg-black text-white rounded-xl h-11"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Keep it
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.open(match.photoUrl, '_blank')}
                      className="aspect-square p-0 rounded-xl h-11 border-slate-200 text-slate-500"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Tips */}
      {
        !uploadedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-rose-50/50 border border-rose-100/50 rounded-3xl p-6 text-center"
          >
            <div className="flex justify-center gap-8 text-sm text-rose-400 italic">
              <span className="flex items-center gap-2">📸 Use Good Lighting</span>
              <span className="flex items-center gap-2">👤 Look at Camera</span>
              <span className="flex items-center gap-2">🕶 No Sunglasses</span>
            </div>
          </motion.div>
        )
      }
    </div >
  );
};

export default FaceSearch;
