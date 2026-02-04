import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Calendar, MapPin, Heart, Clock, ExternalLink, Camera, Image as ImageIcon, Upload, X, Search as SearchIcon, Play, Pause, Volume2, Music } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CountdownTimer from '@/components/premium/CountdownTimer';
import { Button } from "@/components/ui/button";
import FaceSearch from '@/components/FaceSearch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface WeddingData {
    groomName: string;
    brideName: string;
    weddingDate: string;
    weddingTime: string;
    showCountdown: boolean;
    venue: string;

    theme: string;
    musicEnabled?: boolean;
    musicUrl?: string;
}

interface TimelineItem {
    id: string;
    event_date: string;
    event_time: string;
    title: string;
    description: string;
    location: string;
    location_map_url: string;
    sort_order: number;
}

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
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
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
            const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
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
                // Use the correct API URL - make sure VITE_API_BASE_URL is set correctly in .env
                // or use a relative path if proxying, but here we likely need absolute if pure client
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
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

    // Dynamic Theme Styles
    const getThemeStyles = (theme: string) => {
        switch (theme) {
            case 'Modern Elegance': return 'bg-slate-900 text-white';
            case 'Classic Romance': return 'bg-rose-50 text-rose-900';
            case 'Rustic Charm': return 'bg-amber-50 text-amber-900';
            case 'Minimalist': return 'bg-white text-gray-900';
            case 'Vintage Glamour': return 'bg-[#e5dcd6] text-[#4a403a]';
            case 'Boho Chic': return 'bg-[#fdf6e3] text-[#5c4b37]';
            case 'Beach Bliss': return 'bg-cyan-50 text-cyan-900';
            case 'Royal Luxury': return 'bg-purple-900 text-purple-50';

            // Nature
            case 'Forest Fern': return 'bg-emerald-50 text-emerald-900';
            case 'Ocean Breeze': return 'bg-sky-50 text-sky-900';
            case 'Sunset Glow': return 'bg-orange-50 text-orange-900';
            case 'Mountain Mist': return 'bg-gray-100 text-slate-800';
            case 'Desert Bloom': return 'bg-rose-100 text-stone-800';

            // Classic
            case 'Gold & Ivory': return 'bg-[#fffff0] text-[#c5a059]';
            case 'Silver Soiree': return 'bg-slate-50 text-slate-600';
            case 'Pearl White': return 'bg-white text-stone-500';
            case 'Black Tie': return 'bg-black text-white';
            case 'Champagne Toast': return 'bg-[#f7e7ce] text-[#5c5346]';

            // Modern
            case 'City Lights': return 'bg-zinc-900 text-yellow-100';
            case 'Midnight Blue': return 'bg-[#1a237e] text-white';
            case 'Charcoal & Rose': return 'bg-stone-800 text-rose-200';
            case 'Monochrome': return 'bg-white text-black border-4 border-black';
            case 'Geometric Pop': return 'bg-white text-indigo-600';

            // Romantic
            case 'Blushing Bride': return 'bg-pink-100 text-pink-900';
            case 'Lavender Haze': return 'bg-purple-100 text-purple-900';
            case 'Peachy Keen': return 'bg-orange-100 text-orange-800';
            case 'Red Velvet': return 'bg-red-900 text-rose-50';
            case 'Sweetheart Pink': return 'bg-rose-200 text-rose-900';

            // Cultural
            case 'Royal Red': return 'bg-red-700 text-yellow-200';
            case 'Saffron Sun': return 'bg-yellow-500 text-red-900';
            case 'Teal & Gold': return 'bg-teal-700 text-yellow-100';
            case 'Magenta Magic': return 'bg-fuchsia-800 text-fuchsia-100';
            case 'Emerald Elegance': return 'bg-emerald-800 text-emerald-100';

            default: return 'bg-white text-gray-900';
        }
    };

    const themeClass = getThemeStyles(weddingData.theme);

    return (
        <div className={`min-h-screen flex flex-col ${themeClass}`}>
            {/* Hero Section */}
            <header className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <p className="text-sm uppercase tracking-[0.2em] opacity-80">The Wedding Of</p>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4">
                        {weddingData.groomName} <span className="text-rose-500">&</span> {weddingData.brideName}
                    </h1>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg opacity-90">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            <span>{new Date(weddingData.weddingDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            <span>{weddingData.venue}</span>
                        </div>
                    </div>

                    {weddingData.showCountdown && (
                        <div className="pt-8 animate-fade-in-up">
                            <p className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70">Counting Down To Our Day</p>
                            <div className="flex justify-center">
                                <CountdownTimer
                                    targetDate={weddingData.weddingDate}
                                    targetTime={weddingData.weddingTime}
                                    theme={weddingData.theme}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Timeline Section */}
            {timeline.length > 0 && (
                <section className="py-24 px-4 bg-white/5 backdrop-blur-md border-y border-white/10">
                    <div className="max-w-4xl mx-auto space-y-16">
                        <div className="text-center space-y-4">
                            <div className="inline-block p-3 rounded-full bg-rose-500/10 mb-2">
                                <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">The Celebration</h2>
                            <p className="text-lg opacity-60 italic font-serif">Every moment is a memory in the making</p>
                        </div>

                        <div className="relative space-y-12 before:absolute before:left-4 sm:before:left-1/2 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-rose-500/50 before:via-rose-500/20 before:to-transparent">
                            {timeline.sort((a, b) => {
                                const dateA = a.event_date || '';
                                const dateB = b.event_date || '';
                                if (dateA !== dateB) return dateA.localeCompare(dateB);
                                return a.event_time.localeCompare(b.event_time);
                            }).map((event, idx) => (
                                <div key={event.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-8 relative ${idx % 2 === 0 ? 'sm:flex-row-reverse' : ''}`}>
                                    {/* Visual Dot */}
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center justify-center z-10 sm:absolute sm:left-1/2 sm:-translate-x-1/2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                                    </div>

                                    {/* Content Card */}
                                    <div
                                        onClick={() => setSelectedEvent(event)}
                                        className={`w-full sm:w-[calc(50%-3rem)] p-8 rounded-3xl bg-white shadow-xl shadow-rose-900/5 border border-rose-100 hover:scale-[1.02] transition-transform duration-300 cursor-pointer ${idx % 2 === 0 ? 'text-left sm:text-right text-slate-900' : 'text-left text-slate-900'}`}
                                    >
                                        <div className={`flex flex-wrap items-center gap-3 mb-4 ${idx % 2 === 0 ? 'sm:justify-end' : ''}`}>
                                            {event.event_date ? (
                                                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-medium text-[10px] uppercase tracking-wider">
                                                    {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-400 font-medium text-[10px] uppercase tracking-wider">
                                                    Date TBD
                                                </span>
                                            )}
                                            <span className="px-4 py-1.5 rounded-full bg-rose-50 text-rose-600 font-bold text-sm tracking-wider flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> {event.event_time}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-serif font-bold mb-3 text-slate-800 break-words">{event.title}</h3>
                                        <p className="text-slate-600 leading-relaxed mb-6 break-words">{event.description}</p>

                                        {event.location && (
                                            <div className={`flex items-center gap-2 text-sm font-medium ${idx % 2 === 0 ? 'sm:justify-end' : ''}`}>
                                                <a
                                                    href={event.location_map_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`flex items-center gap-1.5 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all group`}
                                                    title={event.location_map_url ? "View on Google Maps" : "Search on Google Maps"}
                                                >
                                                    <MapPin className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                                                    <span>{event.location}</span>
                                                    <ExternalLink className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                </a >
                                            </div >
                                        )}
                                    </div >
                                    <div className="hidden sm:block flex-1"></div>
                                </div >
                            ))}
                        </div >
                    </div >
                </section >
            )}

            {/* Photo Gallery Section */}
            <section className="py-24 px-4 bg-white/50 backdrop-blur-sm border-t border-white/10" id="gallery">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-block p-3 rounded-full bg-rose-500/10 mb-2">
                            <Camera className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight">Captured Moments</h2>
                        <p className="text-lg opacity-60 italic font-serif">Find yourself in our special moments</p>

                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                onClick={() => setShowSearchDialog(true)}
                                className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-rose-500/25 transition-all duration-300 group w-full sm:w-auto"
                            >
                                <SearchIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Search Your Photos
                            </Button>

                            <Button
                                onClick={() => setShowUploadDialog(true)}
                                variant="outline"
                                className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full px-8 py-6 text-lg transition-all duration-300 group w-full sm:w-auto"
                            >
                                <Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                Add Your Photo
                            </Button>
                        </div>
                    </div>

                    {galleryLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
                        </div>
                    ) : photos.length === 0 ? (
                        <div className="text-center py-12 bg-white/30 rounded-3xl border border-dashed border-rose-200">
                            <ImageIcon className="w-12 h-12 text-rose-300 mx-auto mb-4" />
                            <p className="text-lg text-slate-500 font-serif italic">Be the first to share a memory!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {photos.map((photo) => (
                                <div
                                    key={photo.id}
                                    className="aspect-square group relative rounded-2xl overflow-hidden cursor-pointer bg-slate-100 shadow-sm hover:shadow-md transition-all"
                                    onClick={() => setSelectedPhoto(photo)}
                                >
                                    <img
                                        src={photo.publicUrl}
                                        alt={photo.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                        <p className="text-white font-medium text-sm truncate">{photo.title}</p>
                                        <p className="text-white/80 text-xs truncate">{new Date(photo.uploadedAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Content Section Placeholder */}
            <main className="bg-white/50 backdrop-blur-sm py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-serif mb-8">Join Us in Celebration</h2>
                    <p className="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
                        We can't wait to share our special day with you. Please check back soon for more details,
                        including the full schedule, gallery, and RSVP information.
                    </p>
                </div>
            </main>

            <footer className="py-8 text-center text-sm opacity-60">
                <p>Created with <Heart className="w-3 h-3 inline-block mx-1 text-rose-500 fill-current" /> WeddingWeb</p>
            </footer>

            {/* Event Details Modal */}
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

            {/* Photo Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share a Memory</DialogTitle>
                        <DialogDescription>
                            Upload a photo to our wedding gallery.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePhotoUpload} className="space-y-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        setUploadFile(e.target.files[0]);
                                    }
                                }}
                            />
                            {uploadFile ? (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-2 text-rose-600">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium text-slate-900 truncate max-w-[200px]">{uploadFile.name}</p>
                                    <p className="text-sm text-green-600">Ready to upload</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="font-medium">Tap to select photo</p>
                                    <p className="text-xs opacity-70">Supports JPG, PNG</p>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowUploadDialog(false)}>Cancel</Button>
                            <Button type="submit" disabled={!uploadFile || isUploading} className="bg-rose-500 hover:bg-rose-600">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" /> Upload Photo
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
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

            {/* Photo Lightbox Dialog */}
            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl bg-black/95 p-1 border-none text-white">
                    <div className="relative aspect-auto max-h-[90vh] flex items-center justify-center">
                        <Button
                            className="absolute right-2 top-2 z-50 rounded-full bg-black/50 hover:bg-black/80"
                            size="icon"
                            variant="ghost"
                            onClick={() => setSelectedPhoto(null)}
                        >
                            <X className="w-5 h-5 text-white" />
                        </Button>
                        {selectedPhoto && (
                            <img
                                src={selectedPhoto.publicUrl}
                                alt={selectedPhoto.title}
                                className="max-w-full max-h-[85vh] object-contain rounded-sm"
                            />
                        )}
                    </div>
                    {selectedPhoto && (
                        <div className="p-4 text-center">
                            <p className="font-medium text-lg">{selectedPhoto.title}</p>
                        </div>
                    )}
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

        </div >
    );
};

export default WeddingPage;
