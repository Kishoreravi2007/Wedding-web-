
import React from 'react';
import { Loader2, Calendar, MapPin, Heart, Clock, ExternalLink, Camera, Image as ImageIcon, Upload, X, Play, Pause, Volume2, Music } from 'lucide-react';
import CountdownTimer from '@/components/premium/CountdownTimer';
import { Button } from "@/components/ui/button";
import { EditableText } from '@/components/ui/editable-text';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// Helper to get theme styles (copied from WeddingPage)
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

interface WeddingTemplateProps {
    weddingData: any;
    timeline: any[];
    photos: any[];
    isEditing: boolean;
    onUpdateCustomization?: (key: string, value: string) => void;
    // Gallery props
    onUploadPhoto?: (e: React.FormEvent) => void;
    uploadFile?: File | null;
    setUploadFile?: (file: File | null) => void;
    isUploading?: boolean;
    showUploadDialog?: boolean;
    setShowUploadDialog?: (show: boolean) => void;
    setSelectedPhoto?: (photo: any) => void;
    selectedPhoto?: any;
}

export const WeddingTemplate = ({
    weddingData,
    timeline,
    photos,
    isEditing,
    onUpdateCustomization = () => { },
    onUploadPhoto,
    uploadFile,
    setUploadFile,
    isUploading,
    showUploadDialog,
    setShowUploadDialog,
    setSelectedPhoto,
    selectedPhoto
}: WeddingTemplateProps) => {

    const themeClass = getThemeStyles(weddingData.theme);
    const customizations = weddingData.customizations || {};

    return (
        <div className={`min-h-screen flex flex-col ${themeClass}`}>
            {/* Hero Section */}
            <header className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                    <EditableText
                        initialValue={customizations.heroPreTitle || "The Wedding Of"}
                        onSave={(val) => onUpdateCustomization('heroPreTitle', val)}
                        isEditing={isEditing}
                        className="text-sm uppercase tracking-[0.2em] opacity-80"
                        tag="p"
                    />

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 flex flex-col md:block items-center">
                        <span>{weddingData.groomName}</span>
                        <span className="text-rose-500 mx-3">&</span>
                        <span>{weddingData.brideName}</span>
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
                            <EditableText
                                initialValue={customizations.countdownLabel || "Counting Down To Our Day"}
                                onSave={(val) => onUpdateCustomization('countdownLabel', val)}
                                isEditing={isEditing}
                                className="text-xs uppercase tracking-[0.3em] mb-4 opacity-70"
                                tag="p"
                            />
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
                            <EditableText
                                initialValue={customizations.timelineTitle || "The Celebration"}
                                onSave={(val) => onUpdateCustomization('timelineTitle', val)}
                                isEditing={isEditing}
                                className="text-4xl md:text-5xl font-serif font-bold tracking-tight"
                                tag="h2"
                            />
                            <EditableText
                                initialValue={customizations.timelineSubtitle || "Every moment is a memory in the making"}
                                onSave={(val) => onUpdateCustomization('timelineSubtitle', val)}
                                isEditing={isEditing}
                                className="text-lg opacity-60 italic font-serif"
                                tag="p"
                            />
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

                                    <div className={`flex-1 w-full sm:w-auto ${idx % 2 === 0 ? 'text-left sm:text-right' : 'text-left'} pl-12 sm:pl-0`}>
                                        <div className={`p-6 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/20 hover:bg-white/60 transition-colors shadow-sm`}>
                                            <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-3 tracking-wide">{event.event_time}</span>
                                            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                            <div className={`flex items-center gap-2 text-sm opacity-70 mb-3 ${idx % 2 === 0 ? 'sm:justify-end' : ''}`}>
                                                <MapPin className="w-4 h-4" />
                                                <span>{event.location}</span>
                                            </div>
                                            <p className="opacity-80 leading-relaxed text-sm">{event.description}</p>

                                            {event.location_map_url && (
                                                <a href={event.location_map_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium mt-4 hover:underline">
                                                    View Map <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 hidden sm:block"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Gallery Section */}
            <section className="py-24 px-4">
                <div className="max-w-6xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <div className="inline-block p-3 rounded-full bg-purple-500/10 mb-2">
                            <Camera className="w-6 h-6 text-purple-600 fill-purple-500/20" />
                        </div>
                        <EditableText
                            initialValue={customizations.galleryTitle || "Captured Moments"}
                            onSave={(val) => onUpdateCustomization('galleryTitle', val)}
                            isEditing={isEditing}
                            className="text-4xl md:text-5xl font-serif font-bold tracking-tight"
                            tag="h2"
                        />
                        <EditableText
                            initialValue={customizations.gallerySubtitle || "Our love story in frames"}
                            onSave={(val) => onUpdateCustomization('gallerySubtitle', val)}
                            isEditing={isEditing}
                            className="text-lg opacity-60 italic font-serif"
                            tag="p"
                        />
                    </div>

                    {/* Gallery Grid */}
                    {photos.length === 0 ? (
                        <div className="text-center py-12 bg-white/40 backdrop-blur-sm rounded-3xl border border-dashed border-gray-300">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ImageIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-lg text-gray-500 mb-6">No photos shared yet. Be the first!</p>
                            <Button onClick={() => setShowUploadDialog && setShowUploadDialog(true)} className="rounded-full bg-purple-600 hover:bg-purple-700 text-white px-8">
                                <Upload className="w-4 h-4 mr-2" /> Share Photo
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="col-span-1 row-span-1 rounded-2xl bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors border-2 border-dashed border-gray-300 min-h-[200px]" onClick={() => setShowUploadDialog && setShowUploadDialog(true)}>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm text-purple-600">
                                        <Upload className="w-5 h-5" />
                                    </div>
                                    <span className="text-sm font-medium opacity-70">Add Photo</span>
                                </div>
                            </div>
                            {photos.map((photo) => (
                                <div key={photo.id} className="group relative break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in shadow-sm hover:shadow-xl transition-all duration-300 aspect-[3/4]" onClick={() => setSelectedPhoto && setSelectedPhoto(photo)}>
                                    <img src={photo.url} alt="Wedding moment" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <p className="text-white text-xs font-medium truncate">{photo.title || 'Wedding Memory'}</p>
                                        <div className="flex items-center gap-1 text-white/80 text-[10px] mt-1">
                                            <Heart className="w-3 h-3 fill-white/50" /> {photo.likes || 0}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Share a Memory</DialogTitle>
                        <DialogDescription>Upload a photo to the wedding gallery.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onUploadPhoto} className="space-y-4">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="photo">Photo</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUploadFile && setUploadFile(e.target.files ? e.target.files[0] : null)}
                                disabled={isUploading}
                            />
                        </div>
                        <Button type="submit" disabled={!uploadFile || isUploading} className="w-full">
                            {isUploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : 'Upload Photo'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Photo View Dialog */}
            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto && setSelectedPhoto(null)}>
                <DialogContent className="max-w-4xl bg-black/95 border-none text-white p-0 overflow-hidden">
                    {selectedPhoto && (
                        <div className="relative flex flex-col md:flex-row h-[80vh]">
                            <div className="flex-1 bg-black flex items-center justify-center p-4 relative">
                                <img src={selectedPhoto.url} alt="Full view" className="max-w-full max-h-full object-contain" />
                                <button onClick={() => setSelectedPhoto && setSelectedPhoto(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors">
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
