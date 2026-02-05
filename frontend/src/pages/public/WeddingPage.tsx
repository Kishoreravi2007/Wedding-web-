import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Music, Play, Pause, Volume2, MapPin, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
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

    const fetchPhotos = async () => {
        try {
            const apiUrl = API_BASE_URL;
            // Use slug as the primary identifier (sister) since this is the public page
            if (slug) {
                const response = await fetch(`${apiUrl}/api/photos?sister=${slug}&limit=20`);
                if (response.ok) {
                    const data = await response.json();
                    setPhotos(data.photos || []);
                }
            }
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setGalleryLoading(false);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchPhotos();
        }
    }, [slug]);

    const handlePhotoUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !slug) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('photo', uploadFile);
        formData.append('sister', slug);
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
                fetchPhotos(); // Refresh gallery
            } else {
                console.error('Upload failed');
            }
        } catch (error) {
            console.error('Error uploading:', error);
        } finally {
            setIsUploading(false);
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
        <div className="min-h-screen flex flex-col">
            <WeddingTemplate
                weddingData={weddingData}
                timeline={timeline}
                photos={photos}
                isEditing={false}
                slug={slug}
                // Gallery props
                onUploadPhoto={handlePhotoUpload}
                uploadFile={uploadFile}
                setUploadFile={setUploadFile}
                isUploading={isUploading}
                showUploadDialog={showUploadDialog}
                setShowUploadDialog={setShowUploadDialog}
                selectedPhoto={selectedPhoto}
                setSelectedPhoto={setSelectedPhoto}
                // Photobooth props
                onSearchPhotos={() => setShowSearchDialog(true)}
                showSearchDialog={showSearchDialog}
                setShowSearchDialog={setShowSearchDialog}
            />

            {/* Event Details Modal (Public Only) */}
            <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2 text-rose-500 font-bold uppercase tracking-wider text-sm">
                                    {selectedEvent.event_date && (
                                        <span>{new Date(selectedEvent.event_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</span>
                                    )}
                                    <span>•</span>
                                    <span>{selectedEvent.event_time}</span>
                                </div>
                                <DialogTitle className="text-3xl font-serif text-slate-900">{selectedEvent.title}</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {selectedEvent.photo_url && (
                                    <div className="rounded-xl overflow-hidden aspect-video relative">
                                        <img
                                            src={selectedEvent.photo_url}
                                            alt={selectedEvent.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    </div>
                                )}

                                <DialogDescription className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedEvent.description || "Join us for this special moment."}
                                </DialogDescription>

                                {selectedEvent.location && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-rose-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Location</p>
                                                <p className="font-medium text-slate-900">{selectedEvent.location}</p>
                                            </div>
                                        </div>
                                        <a
                                            href={selectedEvent.location_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedEvent.location)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
                                        >
                                            View Map
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

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
            {
                weddingData.musicEnabled && (
                    <div className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Upload Mode: Custom Controls */}
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

                        {/* Playlist Mode: Embed Widgets */}
                        {musicSource === 'playlist' && playlistUrl && (
                            <div className="shadow-2xl rounded-xl overflow-hidden border border-white/20">
                                {/* Spotify Embed */}
                                {playlistUrl.includes('spotify.com') && (
                                    <iframe
                                        style={{ borderRadius: '12px' }}
                                        src={playlistUrl.replace('open.spotify.com', 'open.spotify.com/embed')}
                                        width="300"
                                        height="80"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
                                )}
                                {/* Apple Music Embed */}
                                {playlistUrl.includes('music.apple.com') && (
                                    <iframe
                                        allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                                        frameBorder="0"
                                        height="175"
                                        style={{ width: '100%', maxWidth: '300px', overflow: 'hidden', background: 'transparent' }}
                                        sandbox="allow-forms allow-popups allow-same-origin allow-scripts storage-access-api-by-user-activation"
                                        src={playlistUrl.replace('music.apple.com', 'embed.music.apple.com')}
                                    ></iframe>
                                )}
                                {/* YouTube Embed */}
                                {(playlistUrl.includes('youtube.com') || playlistUrl.includes('youtu.be')) && (
                                    <iframe
                                        width="300"
                                        height="170"
                                        src={`https://www.youtube.com/embed/?listType=playlist&list=${new URL(playlistUrl).searchParams.get('list') || 'PL'}`}
                                        title="YouTube video player"
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    ></iframe>
                                )}
                            </div>
                        )}
                    </div>
                )
            }
        </div>
    );
};

export default WeddingPage;
