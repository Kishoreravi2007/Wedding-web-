import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Loader2, Music, Play, Pause, Volume2, MapPin, Heart, Search as SearchIcon } from 'lucide-react';
import { WeddingTemplate } from '@/components/WeddingTemplate';
import FaceSearch from '@/components/FaceSearch';
import { API_BASE_URL } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { saveWish, getWishes } from '@/services/wishService';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const WeddingPage = () => {
    const { slug } = useParams();
    const { setWeddingMusic, isPlaying, togglePlay, volume, setVolume, musicSource, playlistUrl, isLoaded } = useMusicPlayer();
    const [weddingData, setWeddingData] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // Gallery State
    const [photos, setPhotos] = useState<any[]>([]);
    const [galleryLoading, setGalleryLoading] = useState(true);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [wishes, setWishes] = useState<any[]>([]);

    const fetchPhotos = async (weddingId?: string) => {
        try {
            const apiUrl = API_BASE_URL;
            // Prefer weddingId if available, fallback to slug (sister)
            let url = `${apiUrl}/api/photos?limit=50`;
            if (weddingId) {
                url += `&weddingId=${weddingId}`;
            } else if (slug) {
                url += `&sister=${slug}`;
            } else {
                return;
            }

            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPhotos(data.photos || []);
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setGalleryLoading(false);
        }
    };

    useEffect(() => {
        if (slug && !weddingData) {
            fetchPhotos();
        }
    }, [slug, weddingData]);

    useEffect(() => {
        if (weddingData?.id) {
            fetchPhotos(weddingData.id);
        }
    }, [weddingData?.id]);

    const handlePhotoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !slug) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('photo', uploadFile);
        formData.append('sister', slug);
        if (weddingData?.id) {
            formData.append('wedding_id', weddingData.id);
        }
        formData.append('title', 'Guest Capture');
        formData.append('description', 'Uploaded via Wedding Page');
        formData.append('eventType', 'photobooth');

        try {
            const apiUrl = API_BASE_URL;
            const response = await fetch(`${apiUrl}/api/photos/public`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                setShowUploadDialog(false);
                setUploadFile(null);
                fetchPhotos(weddingData?.id); // Refresh gallery
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleWishSubmit = async (name: string, message: string) => {
        if (!weddingData?.id) return;
        try {
            await saveWish(weddingData.id, name, message);
            // Refresh wishes
            const wishesData = await getWishes(weddingData.id);
            setWishes(wishesData);
        } catch (err) {
            console.error("Failed to save wish", err);
            throw err;
        }
    };

    useEffect(() => {
        const fetchWeddingData = async () => {
            try {
                // Use the correct API URL
                const apiUrl = API_BASE_URL;
                const response = await fetch(`${apiUrl}/api/auth/public/wedding/${slug}`);

                if (!response.ok) {
                    throw new Error('Wedding not found');
                }

                const data = await response.json();

                setWeddingData(data);

                // Set music if enabled
                if (data.musicEnabled) {
                    setWeddingMusic({
                        url: data.musicUrl,
                        source: data.musicSource || 'upload',
                        playlistUrl: data.playlistUrl,
                        volume: (data.volume !== null && data.volume !== undefined) ? data.volume : 50
                    });
                } else {
                    setWeddingMusic(null);
                }


                // Also fetch timeline
                const tRes = await fetch(`${apiUrl}/api/timeline/public/${slug}`);
                if (tRes.ok) {
                    const tData = await tRes.json();
                    if (tData.success) {
                        setTimeline(tData.timeline);
                    }
                }

                // Fetch wishes
                if (data.id) {
                    try {
                        const wishesData = await getWishes(data.id);
                        setWishes(wishesData);
                    } catch (err) {
                        console.error("Failed to fetch wishes", err);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Wedding not found or link is invalid.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchWeddingData();
        }

        return () => {
            setWeddingMusic(null);
        }
    }, [slug, setWeddingMusic]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-pink-50">
                <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
            </div>
        );
    }

    if (error || !weddingData) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
                <Heart className="w-12 h-12 text-gray-300 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-2">404</h1>
                <p className="text-gray-600">{error || 'Page not found'}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <WeddingTemplate
                weddingData={weddingData}
                timeline={timeline}
                photos={photos}
                isEditing={false}
                slug={slug}
                onSearchPhotos={() => setShowSearchDialog(true)}
                showSearchDialog={showSearchDialog}
                setShowSearchDialog={setShowSearchDialog}
                setSelectedPhoto={setSelectedPhoto}
                selectedPhoto={selectedPhoto}
                showUploadDialog={showUploadDialog}
                setShowUploadDialog={setShowUploadDialog}
                uploadFile={uploadFile}
                setUploadFile={setUploadFile}
                onUploadPhoto={handlePhotoUpload}
                isUploading={isUploading}
                onWishSubmit={handleWishSubmit}
                wishes={wishes}
            />

            {/* Face Search (Photobooth) Dialog */}
            <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-serif">AI Photobooth</DialogTitle>
                        <DialogDescription>
                            Upload a selfie to find all wedding photos you're in.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <FaceSearch eventId={slug} className="shadow-none border-none p-0" />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Floating Music Controls */}
            {weddingData.musicEnabled && (
                <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
                    {musicSource === 'upload' && weddingData.musicUrl && (
                        <div className="bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 pr-4 flex items-center gap-3 border border-rose-100 ring-1 ring-rose-500/10">
                            <Button
                                onClick={togglePlay}
                                size="icon"
                                className={`rounded-full shadow-md transition-all ${isPlaying ? 'bg-rose-500 hover:bg-rose-600' : 'bg-slate-900 hover:bg-slate-800'} text-white w-10 h-10`}
                            >
                                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </Button>

                            <div className="flex flex-col min-w-[100px]">
                                <div className="flex items-center gap-2 mb-1">
                                    <Music className={`w-3 h-3 ${isPlaying ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                                    <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">Our Song</span>
                                </div>
                                <div className="flex items-center gap-2 group relative">
                                    <Volume2 className="w-3 h-3 text-slate-400" />
                                    <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden cursor-pointer">
                                        <div
                                            className="h-full bg-rose-500 rounded-full relative"
                                            style={{ width: `${volume * 100}%` }}
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={volume * 100}
                                            onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default WeddingPage;
