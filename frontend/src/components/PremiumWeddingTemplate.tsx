import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Heart, Search as SearchIcon, Camera, Upload, X, Play, Music, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { EditableText } from '@/components/ui/editable-text';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


// Helper to determine span based on aspect ratio (mock logic for now or we use real measurements)
// Since we don't have aspect ratio data upfront for all, we can randomize or just default.
const getSpan = (index: number) => {
    const pattern = [
        'row-span-1', 'row-span-2', 'row-span-1', 'row-span-1',
        'row-span-2', 'row-span-1', 'row-span-1', 'row-span-2'
    ];
    return pattern[index % pattern.length];
};

interface PremiumWeddingTemplateProps {
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
    onSearchPhotos?: () => void;
    slug?: string;
}

export const PremiumWeddingTemplate = ({
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
    slug
}: PremiumWeddingTemplateProps) => {
    const customizations = weddingData.customizations || {};
    const [activeTab, setActiveTab] = useState('gallery'); // 'gallery' | 'timeline'

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-sans selection:bg-rose-100 text-[#1c1c1c]">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 py-6 px-8 flex items-center justify-between mix-blend-difference text-white pointer-events-none">
                <div className="text-xl font-bold tracking-tighter uppercase pointer-events-auto">
                    {weddingData.groomName} & {weddingData.brideName}
                </div>
                <nav className="hidden md:flex gap-8 text-sm font-medium tracking-wide pointer-events-auto">
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:opacity-70 transition-opacity">Home</button>
                    <button onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-70 transition-opacity">Gallery</button>
                    <button onClick={() => document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth' })} className="hover:opacity-70 transition-opacity">Schedule</button>
                    {/* <button className="px-5 py-2 bg-white text-black rounded-full hover:bg-gray-200 transition-colors">RSVP</button> */}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="relative h-screen w-full overflow-hidden flex flex-col items-center justify-center text-center px-4">
                {/* Background Video/Image */}
                <div className="absolute inset-0 z-0">
                    {customizations.heroBgImage ? (
                        // If it's a video (simple check for mp4 extension or just assume image for now. The design suggests video but we only have image upload currently)
                        <img
                            src={customizations.heroBgImage}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-stone-900" />
                    )}
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="relative z-10 text-white space-y-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase mb-4 opacity-80">
                            <EditableText
                                initialValue={customizations.heroPreTitle || "The Wedding Celebration Of"}
                                onSave={(val) => onUpdateCustomization('heroPreTitle', val)}
                                isEditing={isEditing}
                                tag="span"
                            />
                        </p>
                        <h1 className="text-6xl md:text-9xl font-heading font-light tracking-tighter leading-none mb-6">
                            <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                            <span className="block text-4xl md:text-6xl my-2 opacity-70 font-sans font-light">&</span>
                            <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                        </h1>
                        <div className="flex items-center justify-center gap-6 text-lg md:text-xl font-light tracking-wide opacity-90">
                            <EditableText initialValue={weddingData.weddingDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} tag="span" />
                            <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50"></span>
                            <EditableText initialValue={weddingData.venue || "Venue"} onSave={val => onUpdateCustomization('venue', val)} isEditing={isEditing} tag="span" />
                        </div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <ChevronDown className="w-8 h-8" />
                </motion.div>
            </section>

            {/* Content Container */}
            <div className="bg-[#FDFBF7] relative z-20 rounded-t-[3rem] -mt-12 px-4 md:px-12 py-16 md:py-24 shadow-2xl min-h-screen">

                {/* Tabs / Filter Navigation */}
                <div className="flex justify-center mb-16 sticky top-24 z-30 bg-[#FDFBF7]/80 backdrop-blur-md py-4 rounded-full max-w-fit mx-auto px-6 border border-stone-200 shadow-sm">
                    <button
                        onClick={() => setActiveTab('gallery')}
                        className={`mx-4 text-sm font-medium tracking-widest uppercase transition-all ${activeTab === 'gallery' ? 'text-black scale-110 font-bold border-b-2 border-black pb-1' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Gallery
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`mx-4 text-sm font-medium tracking-widest uppercase transition-all ${activeTab === 'timeline' ? 'text-black scale-110 font-bold border-b-2 border-black pb-1' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Timeline
                    </button>
                </div>

                {/* Gallery Grid */}
                {activeTab === 'gallery' && (
                    <div id="gallery" className="max-w-[1600px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div>
                                <h2 className="text-4xl md:text-5xl font-heading mb-4">Captured Moments</h2>
                                <p className="text-stone-500 max-w-md">Relive the magic of our special day through these candid moments captured by our friends and family.</p>
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={onSearchPhotos} variant="outline" className="rounded-full border-stone-300 hover:bg-stone-100 h-12 px-6">
                                    <SearchIcon className="w-4 h-4 mr-2" /> Find Me
                                </Button>
                                <Button onClick={() => setShowUploadDialog && setShowUploadDialog(true)} className="rounded-full bg-black text-white hover:bg-stone-800 h-12 px-6">
                                    <Camera className="w-4 h-4 mr-2" /> Add Photo
                                </Button>
                            </div>
                        </div>

                        {photos.length === 0 ? (
                            <div className="border border-dashed border-stone-300 rounded-3xl p-24 text-center">
                                <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Upload className="w-8 h-8 text-stone-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No photos yet</h3>
                                <p className="text-stone-500 mb-8">Be the first to share a memory!</p>
                                <Button onClick={() => setShowUploadDialog && setShowUploadDialog(true)}>Upload Photo</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
                                {photos.map((photo, i) => {
                                    const span = getSpan(i);
                                    return (
                                        <motion.div
                                            key={photo.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true }}
                                            className={`relative group rounded-2xl overflow-hidden cursor-pointer bg-gray-200 ${span}`}
                                            onClick={() => setSelectedPhoto && setSelectedPhoto(photo)}
                                        >
                                            <img
                                                src={photo.url}
                                                alt="Gallery Item"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                <div className="flex items-center gap-2 text-white text-sm font-medium">
                                                    <Heart className="w-4 h-4 fill-white" />
                                                    <span>{photo.likes || 0}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Timeline */}
                {activeTab === 'timeline' && (
                    <div id="timeline" className="max-w-3xl mx-auto py-12">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-heading mb-4">The Schedule</h2>
                            <p className="text-stone-500">Join us for every moment of celebration.</p>
                        </div>
                        <div className="relative border-l border-stone-300 ml-4 md:ml-0 space-y-12 pl-8 md:pl-0">
                            {timeline.map((event, i) => (
                                <div key={event.id} className="relative md:grid md:grid-cols-2 md:gap-12 items-center">
                                    {/* Dot */}
                                    <div className="absolute top-0 left-[-37px] md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full bg-black border-4 border-[#FDFBF7] z-10"></div>

                                    {/* Time (Left side on desktop for odd, right for even) */}
                                    <div className={`md:text-right ${i % 2 !== 0 ? 'md:col-start-1 md:row-start-1' : 'md:col-start-2'} mb-2 md:mb-0`}>
                                        <span className="inline-block px-3 py-1 rounded-full bg-stone-100 text-sm font-bold tracking-wide">{event.event_time}</span>
                                    </div>

                                    {/* Content */}
                                    <div className={`${i % 2 !== 0 ? 'md:col-start-2' : 'md:col-start-1 md:row-start-1'} bg-white p-6 rounded-2xl shadow-sm border border-stone-100`}>
                                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                        <p className="text-stone-600 text-sm leading-relaxed mb-3">{event.description}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-stone-400 uppercase tracking-wider">
                                            <span>{event.location}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-[#1c1c1c] text-[#FDFBF7] py-20 px-4 text-center">
                <div className="max-w-4xl mx-auto space-y-8">
                    <h2 className="text-5xl md:text-7xl font-heading opacity-90">
                        {weddingData.groomName} <span className="text-2xl font-sans align-middle mx-2">&</span> {weddingData.brideName}
                    </h2>
                    <p className="text-lg opacity-60 font-light tracking-wide max-w-lg mx-auto">
                        <EditableText
                            initialValue={customizations.footerMessage || "Thank you for being part of our story. We love you all."}
                            onSave={(val) => onUpdateCustomization('footerMessage', val)}
                            isEditing={isEditing}
                            tag="span"
                        />
                    </p>
                    <div className="pt-12 flex justify-center opacity-30">
                        <Heart className="w-12 h-12" />
                    </div>
                </div>
            </footer>

            {/* Dialogs */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add to Gallery</DialogTitle>
                        <DialogDescription>Upload your favorite snaps from the event.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={onUploadPhoto} className="space-y-4 pt-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="photo">Choose Photo</Label>
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setUploadFile && setUploadFile(e.target.files ? e.target.files[0] : null)}
                                disabled={isUploading}
                            />
                        </div>
                        <Button type="submit" disabled={!uploadFile || isUploading} className="w-full bg-black text-white hover:bg-stone-800">
                            {isUploading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...</> : 'Upload Photo'}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto && setSelectedPhoto(null)}>
                <DialogContent className="max-w-5xl bg-black/95 border-none text-white p-0 overflow-hidden h-[90vh]">
                    {selectedPhoto && (
                        <div className="w-full h-full flex flex-col items-center justify-center relative">
                            <img src={selectedPhoto.url} alt="Full view" className="max-w-full max-h-full object-contain" />
                            <button onClick={() => setSelectedPhoto && setSelectedPhoto(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/80">
                                <X className="w-6 h-6 text-white" />
                            </button>
                            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pb-12 text-center">
                                <h3 className="text-xl font-medium">{selectedPhoto.title || 'Wedding Memory'}</h3>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
