import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Calendar, MapPin, Heart, Clock, ExternalLink } from 'lucide-react';
import CountdownTimer from '@/components/premium/CountdownTimer';
import { Button } from "@/components/ui/button";
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

const WeddingPage = () => {
    const { slug } = useParams();
    const [weddingData, setWeddingData] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    useEffect(() => {
        const fetchWeddingData = async () => {
            try {
                // Use the correct API URL - make sure VITE_API_BASE_URL is set correctly in .env
                // or use a relative path if proxying, but here we likely need absolute if pure client
                const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005';
                const response = await fetch(`${apiUrl}/api/auth/public/wedding/${slug}`);

                if (!response.ok) {
                    throw new Error('Wedding not found');
                }

                const data = await response.json();
                setWeddingData(data);

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
    }, [slug]);

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
        </div >
    );
};

export default WeddingPage;
