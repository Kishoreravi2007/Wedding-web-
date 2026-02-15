
import React from 'react';
import { Loader2, Calendar, MapPin, Heart, Clock, ExternalLink, Camera, Image as ImageIcon, Upload, X, Play, Pause, Volume2, Music, ChevronUp, ChevronDown, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from '@/components/premium/CountdownTimer';
import { Button } from "@/components/ui/button";
import { EditableText } from '@/components/ui/editable-text';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// Helper to get theme styles (copied from WeddingPage)
import { themeConfigs } from '@/lib/themeConfig';

// Helper to get theme styles from shared config
const getThemeStyles = (theme: string) => {
    const config = themeConfigs[theme];
    if (!config) return 'bg-white text-gray-900 font-sans';

    // Combine colors and fonts
    return `${config.colors.bg} ${config.colors.text} ${config.fontBody}`;
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
    // Photobooth props
    onSearchPhotos?: () => void;
    showSearchDialog?: boolean;
    setShowSearchDialog?: (show: boolean) => void;
    slug?: string;
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
    selectedPhoto,
    onSearchPhotos,
    showSearchDialog,
    setShowSearchDialog,
    slug
}: WeddingTemplateProps) => {

    const themeClass = getThemeStyles(weddingData.theme);
    const config = themeConfigs[weddingData.theme];
    const headingFont = config?.fontHeading || 'font-serif';
    const customizations = weddingData.customizations || {};

    // Section Ordering Logic
    const defaultOrder = ['hero', 'timeline', 'gallery', 'main'];
    let sectionOrder = defaultOrder;

    if (customizations.sectionOrder) {
        try {
            // Check if it's already an array or needs parsing
            sectionOrder = typeof customizations.sectionOrder === 'string'
                ? JSON.parse(customizations.sectionOrder)
                : customizations.sectionOrder;

            // Simple validation: ensure it's an array and contains valid sections
            if (!Array.isArray(sectionOrder)) {
                sectionOrder = defaultOrder;
            }
        } catch (e) {
            console.error("Failed to parse sectionOrder", e);
            sectionOrder = defaultOrder;
        }
    }

    const moveSection = (direction: 'up' | 'down', sectionId: string) => {
        const currentIndex = sectionOrder.indexOf(sectionId);
        if (currentIndex === -1) return;

        const newOrder = [...sectionOrder];
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= newOrder.length) return;

        [newOrder[currentIndex], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[currentIndex]];
        onUpdateCustomization('sectionOrder', JSON.stringify(newOrder));
    };

    const SectionControls = ({ sectionId }: { sectionId: string }) => {
        const index = sectionOrder.indexOf(sectionId);
        const isFirst = index === 0;
        const isLast = index === sectionOrder.length - 1;

        if (!isEditing) return null;

        return (
            <div className="absolute top-4 left-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="secondary"
                    size="icon"
                    disabled={isFirst}
                    onClick={() => moveSection('up', sectionId)}
                    className="w-8 h-8 rounded-full bg-white/90 shadow-md hover:bg-white text-slate-900 border border-slate-200 disabled:opacity-30"
                >
                    <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                    variant="secondary"
                    size="icon"
                    disabled={isLast}
                    onClick={() => moveSection('down', sectionId)}
                    className="w-8 h-8 rounded-full bg-white/90 shadow-md hover:bg-white text-slate-900 border border-slate-200 disabled:opacity-30"
                >
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </div>
        );
    };

    const renderSection = (sectionId: string) => {
        switch (sectionId) {
            case 'hero':
                return (
                    <motion.header
                        key="hero"
                        layout
                        className="relative z-10 flex-1 flex flex-col min-h-[60vh] group"
                    >
                        <SectionControls sectionId="hero" />
                        {(() => {
                            switch (config?.layout) {
                                case 'minimal-split':
                                    return (
                                        <div className="grid md:grid-cols-2 min-h-[85vh] w-full">
                                            <div className="relative bg-gray-200 flex items-center justify-center overflow-hidden min-h-[50vh] md:min-h-0">
                                                {customizations.heroBgImage ? (
                                                    <img src={customizations.heroBgImage} className="absolute inset-0 w-full h-full object-cover" alt="Couple" />
                                                ) : (
                                                    <div className="text-gray-400 flex flex-col items-center gap-2">
                                                        <ImageIcon className="w-12 h-12 opacity-50" />
                                                        <span>Add Hero Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center space-y-6 ${themeClass}`}>
                                                <EditableText
                                                    initialValue={customizations.heroPreTitle || "The Wedding Of"}
                                                    onSave={(val) => onUpdateCustomization('heroPreTitle', val)}
                                                    isEditing={isEditing}
                                                    className={`text-xs uppercase tracking-[0.4em] opacity-60 ${config.colors.accent}`}
                                                    tag="p"
                                                />
                                                <h1 className={`text-5xl md:text-7xl ${headingFont} leading-tight`}>
                                                    <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                                                    <br />
                                                    <span className="text-2xl opacity-40 block my-4">&</span>
                                                    <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                                                </h1>
                                                <div className="flex items-center gap-4 text-sm opacity-60 pt-4">
                                                    <EditableText initialValue={weddingData.weddingDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} tag="span" />
                                                    <span>|</span>
                                                    <EditableText initialValue={weddingData.venue || "Venue"} onSave={val => onUpdateCustomization('venue', val)} isEditing={isEditing} tag="span" />
                                                </div>

                                                {weddingData.showCountdown && (
                                                    <div className="pt-8 w-full">
                                                        <div className="flex justify-center scale-90 sm:scale-100 origin-top">
                                                            <CountdownTimer
                                                                targetDate={weddingData.weddingDate}
                                                                targetTime={weddingData.weddingTime}
                                                                theme={weddingData.theme}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                case 'rustic-overlay':
                                    return (
                                        <div className="flex-1 flex items-center justify-center p-8 text-center relative min-h-[85vh]">
                                            <div className="absolute inset-0 bg-black/40 z-0"></div>
                                            <div className="relative z-10 border border-white/30 p-8 md:p-16 backdrop-blur-sm rounded-lg max-w-3xl w-full mx-auto shadow-2xl">
                                                <EditableText
                                                    initialValue={customizations.heroPreTitle || "We Are Getting Married"}
                                                    onSave={(val) => onUpdateCustomization('heroPreTitle', val)}
                                                    isEditing={isEditing}
                                                    className="text-sm uppercase tracking-widest text-white/90 mb-6 block font-medium"
                                                    tag="span"
                                                />
                                                <h1 className={`text-5xl md:text-8xl ${headingFont} text-white drop-shadow-xl mb-8 leading-tight`}>
                                                    <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                                                    <span className="mx-4 text-white/80">&</span>
                                                    <br className="md:hidden" />
                                                    <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                                                </h1>
                                                <div className="text-white/90 text-lg">
                                                    <EditableText initialValue={weddingData.weddingDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} tag="span" className="font-serif italic" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                case 'luxury-serif':
                                    return (
                                        <div className={`flex-1 flex items-center justify-center p-8 md:p-12 text-center min-h-[80vh] border-[16px] ${config.colors.secondary || 'border-rose-100'} border-opacity-30 m-4 md:m-8 bg-white/40`}>
                                            <div className="space-y-10 max-w-4xl">
                                                <div className={`w-28 h-28 mx-auto rounded-full border-2 border-current flex items-center justify-center text-4xl ${headingFont} opacity-80 shadow-sm`}>
                                                    {weddingData.groomName && weddingData.groomName.charAt(0)}{weddingData.brideName && weddingData.brideName.charAt(0)}
                                                </div>
                                                <h1 className={`text-5xl md:text-8xl ${headingFont} tracking-widest uppercase leading-tight`}>
                                                    <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                                                    <span className="opacity-50 mx-6 text-2xl normal-case italic block md:inline my-4 md:my-0 font-serif">and</span>
                                                    <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                                                </h1>
                                                <div className="h-0.5 w-32 bg-current mx-auto opacity-30"></div>
                                                <EditableText initialValue={weddingData.weddingDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} className="text-xl uppercase tracking-[0.2em] opacity-80" tag="p" />
                                            </div>
                                        </div>
                                    );
                                case 'modern-glass':
                                    return (
                                        <div className="flex-1 flex items-center justify-center relative overflow-hidden min-h-[85vh] py-20 px-4">
                                            {/* Decorative Orbs */}
                                            <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-400/20 blur-[120px] animate-pulse"></div>
                                            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-rose-400/20 blur-[130px] animate-pulse delay-700"></div>

                                            <div className="relative z-10 bg-white/20 backdrop-blur-xl border border-white/40 p-12 md:p-24 rounded-[3rem] shadow-2xl text-center max-w-5xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
                                                <h1 className={`text-6xl md:text-9xl ${headingFont} bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 mb-8 leading-[1.1] drop-shadow-sm`}>
                                                    <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                                                    <br />
                                                    <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                                                </h1>
                                                <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-xl font-medium tracking-wide text-gray-700">
                                                    <EditableText initialValue={weddingData.weddingDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} tag="span" />
                                                    <span className="hidden md:block w-2 h-2 rounded-full bg-current opacity-40"></span>
                                                    <EditableText initialValue={weddingData.venue || "Venue"} onSave={val => onUpdateCustomization('venue', val)} isEditing={isEditing} tag="span" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                case 'boho-frame':
                                    return (
                                        <div className="flex-1 flex items-center justify-center p-4 min-h-[85vh]">
                                            <div className={`p-16 md:p-24 border-4 ${config.colors.secondary || 'border-rose-200'} border-double rounded-t-full rounded-b-[45%] bg-white/70 backdrop-blur-md max-w-4xl w-full text-center shadow-xl`}>
                                                <EditableText
                                                    initialValue={customizations.heroPreTitle || "Join Us For The Wedding Of"}
                                                    onSave={(val) => onUpdateCustomization('heroPreTitle', val)}
                                                    isEditing={isEditing}
                                                    className="text-sm font-bold uppercase tracking-widest opacity-50 mb-8 block"
                                                    tag="span"
                                                />
                                                <h1 className={`text-6xl md:text-8xl ${headingFont} rotate-[-3deg] mb-10 origin-center transform text-gray-800`}>
                                                    <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                                                    <span className="mx-6 text-rose-500">&</span>
                                                    <br className="md:hidden" />
                                                    <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                                                </h1>
                                                <EditableText
                                                    initialValue={weddingData.weddingDate}
                                                    onSave={val => onUpdateCustomization('weddingDate', val)}
                                                    isEditing={isEditing}
                                                    className="text-2xl italic opacity-80 font-serif"
                                                    tag="p"
                                                />
                                            </div>
                                        </div>
                                    );
                                default:
                                    // Default centered layout
                                    return (
                                        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-20">
                                            <EditableText
                                                initialValue={customizations.heroPreTitle || "The Wedding Of"}
                                                onSave={(val) => onUpdateCustomization('heroPreTitle', val)}
                                                isEditing={isEditing}
                                                className="text-sm uppercase tracking-[0.2em] opacity-80"
                                                tag="p"
                                            />

                                            <h1 className={`text-4xl md:text-6xl lg:text-7xl ${headingFont} font-bold mb-4 flex flex-col md:block items-center`}>
                                                <EditableText
                                                    initialValue={weddingData.groomName}
                                                    onSave={(val) => onUpdateCustomization('groomName', val)}
                                                    isEditing={isEditing}
                                                    tag="span"
                                                />
                                                <span className="text-rose-500 mx-3">&</span>
                                                <EditableText
                                                    initialValue={weddingData.brideName}
                                                    onSave={(val) => onUpdateCustomization('brideName', val)}
                                                    isEditing={isEditing}
                                                    tag="span"
                                                />
                                            </h1>

                                            {/* Date/Venue */}
                                            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-lg opacity-90">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-5 h-5" />
                                                    <EditableText
                                                        initialValue={weddingData.weddingDate}
                                                        onSave={(val) => onUpdateCustomization('weddingDate', val)}
                                                        isEditing={isEditing}
                                                        className="inline-block"
                                                        tag="span"
                                                        type="date"
                                                    />
                                                </div>
                                                <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-5 h-5" />
                                                    <EditableText
                                                        initialValue={weddingData.venue || "Venue TBD"}
                                                        onSave={(val) => onUpdateCustomization('venue', val)}
                                                        isEditing={isEditing}
                                                        className="inline-block"
                                                        tag="span"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                            }
                        })()}

                        {/* Shared Countdown (if enabled) - Visible for all except split which has its own */}
                        {weddingData.showCountdown && config?.layout !== 'minimal-split' && (
                            <div className="pt-12 animate-fade-in-up pb-12 w-full z-20">
                                <EditableText
                                    initialValue={customizations.countdownLabel || "Counting Down To Our Day"}
                                    onSave={(val) => onUpdateCustomization('countdownLabel', val)}
                                    isEditing={isEditing}
                                    className="text-xs uppercase tracking-[0.3em] mb-6 opacity-70 text-center block"
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
                    </motion.header>
                );
            case 'timeline':
                if (timeline.length === 0) return null;
                return (
                    <motion.section
                        key="timeline"
                        layout
                        className="py-24 px-4 bg-white/5 backdrop-blur-md border-y border-white/10 relative group"
                    >
                        <SectionControls sectionId="timeline" />
                        <div className="max-w-4xl mx-auto space-y-16">
                            <div className="text-center space-y-4">
                                <div className="inline-block p-3 rounded-full bg-rose-500/10 mb-2">
                                    <Heart className="w-6 h-6 text-rose-500 fill-rose-500/20" />
                                </div>
                                <EditableText
                                    initialValue={customizations.timelineTitle || "The Celebration"}
                                    onSave={(val) => onUpdateCustomization('timelineTitle', val)}
                                    isEditing={isEditing}
                                    className={`text-4xl md:text-5xl ${headingFont} font-bold tracking-tight`}
                                    tag="h2"
                                />
                                <EditableText
                                    initialValue={customizations.timelineSubtitle || "Every moment is a memory in the making"}
                                    onSave={(val) => onUpdateCustomization('timelineSubtitle', val)}
                                    isEditing={isEditing}
                                    className={`text-lg opacity-60 italic ${headingFont}`}
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
                    </motion.section>
                );
            case 'gallery':
                return (
                    <motion.section
                        key="gallery"
                        layout
                        className="py-24 px-4 relative group"
                    >
                        <SectionControls sectionId="gallery" />
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

                                {!isEditing && (
                                    <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <Button
                                            onClick={onSearchPhotos}
                                            className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-rose-500/25 transition-all duration-300 group w-full sm:w-auto"
                                        >
                                            <SearchIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                            Search Your Photos
                                        </Button>

                                        <Button
                                            onClick={() => setShowUploadDialog && setShowUploadDialog(true)}
                                            variant="outline"
                                            className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full px-8 py-6 text-lg transition-all duration-300 group w-full sm:w-auto"
                                        >
                                            <Camera className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                            Add Your Photo
                                        </Button>
                                    </div>
                                )}
                            </div>

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
                    </motion.section>
                );
            case 'main':
                return (
                    <motion.main key="main" layout className="bg-white/50 backdrop-blur-sm py-20 px-4 group relative">
                        <SectionControls sectionId="main" />
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-serif mb-8">Join Us in Celebration</h2>
                            <p className="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed">
                                We can't wait to share our special day with you. Please check back soon for more details,
                                including the full schedule, gallery, and RSVP information.
                            </p>
                        </div>
                    </motion.main>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${themeClass} relative transition-colors duration-500`}>
            {/* Background Image Overlay */}
            {customizations.heroBgImage && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage: `url(${customizations.heroBgImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        opacity: customizations.heroBgAdjustments ? 1 : 0.4,
                        filter: customizations.heroBgAdjustments ? 'none' : 'grayscale(0.2)'
                    }}
                />
            )}

            {/* Change Background Button (Only while editing) */}
            {isEditing && (
                <div className="fixed top-24 right-8 z-40 flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/80 backdrop-blur-sm border-rose-200 text-rose-600 hover:bg-rose-50 rounded-full shadow-lg"
                                    onClick={() => onUpdateCustomization('triggerBgUpload', 'true')}
                                >
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Change Background
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Upload a hero image</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {customizations.heroBgImage && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-600 hover:bg-gray-50 rounded-full shadow-lg"
                                        onClick={() => onUpdateCustomization('heroBgImage', '')}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Remove
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Remove background image</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            )}

            {/* Dynamic Sections */}
            <AnimatePresence mode="popLayout">
                {sectionOrder.map((sectionId: string) => renderSection(sectionId))}
            </AnimatePresence>

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
            {/* Footer */}
            <footer className="py-12 bg-slate-900 text-slate-400 text-center">
                <div className="max-w-4xl mx-auto px-8">
                    <Heart className="w-8 h-8 text-rose-500 mx-auto mb-4" />
                    <p className="text-xl font-serif text-white mb-2">
                        {weddingData.groomName} & {weddingData.brideName}
                    </p>
                    <EditableText
                        initialValue={customizations.footerMessage || "Thank you for being part of our story."}
                        onSave={(val) => onUpdateCustomization('footerMessage', val)}
                        isEditing={isEditing}
                        className="mb-6 block"
                        tag="p"
                    />
                </div>
            </footer>
        </div>
    );
};
