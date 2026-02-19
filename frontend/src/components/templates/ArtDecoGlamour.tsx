
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Stars, MapPin, Calendar, Clock, Camera, Mail, Share2, Upload } from 'lucide-react';
import { EditableText } from '@/components/ui/editable-text';

interface ArtDecoGlamourProps {
    weddingData: any;
    timeline: any[];
    photos: any[];
    isEditing: boolean;
    onUpdateCustomization: (key: string, value: string) => void;
}

const ArtDecoGlamour: React.FC<ArtDecoGlamourProps> = ({
    weddingData,
    timeline,
    photos,
    isEditing,
    onUpdateCustomization
}) => {
    const customizations = weddingData.customizations || {};
    const dateObj = weddingData.weddingDate ? new Date(weddingData.weddingDate) : new Date();
    const year = dateObj.getFullYear();
    const accentColor = customizations.accentColor || '#D4AF37';
    const globalFont = customizations.globalFont || 'font-serif';
    const fontClass = globalFont === 'font-sans' ? 'font-sans' : 'font-serif';

    return (
        <div className={`bg-[#0a0a0c] ${fontClass} text-white selection:bg-[#1754cf]/30 selection:text-[${accentColor}]`}>
            {/* Custom Art Deco Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --accent-color: ${accentColor};
                }
                .deco-border {
                    border: 2px solid var(--accent-color);
                    position: relative;
                }
                .deco-border::before {
                    content: '';
                    position: absolute;
                    top: 4px; left: 4px; right: 4px; bottom: 4px;
                    border: 1px solid var(--accent-color);
                    pointer-events: none;
                }
                .bg-pattern {
                    background-image: radial-gradient(circle at 2px 2px, ${accentColor}1A 1px, transparent 0);
                    background-size: 24px 24px;
                }
                .gold-gradient-text {
                    background: linear-gradient(to right, #BF953F, #FCF6BA, #B38728, #FBF5B7, #AA771C);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .art-deco-divider {
                    height: 2px;
                    background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
                    width: 100%;
                    margin: 2rem 0;
                    position: relative;
                }
                .art-deco-divider::after {
                    content: '◆';
                    position: absolute;
                    left: 50%; top: 50%;
                    transform: translate(-50%, -50%);
                    color: var(--accent-color);
                    background: #0a0a0c;
                    padding: 0 10px;
                }
            `}} />

            {/* Navigation Placeholder (handled by parent typically, but we match aesthetic) */}
            <header className="fixed top-0 z-50 w-full bg-[#0a0a0c]/90 backdrop-blur-md border-b border-[#D4AF37]/20 px-6 py-4 lg:px-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 flex items-center justify-center border border-[#D4AF37] rotate-45">
                            <Stars className="text-[#D4AF37] -rotate-45 size-5" />
                        </div>
                        <h2 className="text-[#D4AF37] text-xl font-extrabold tracking-[0.2em] uppercase">
                            {weddingData.groomName?.charAt(0)}&amp;{weddingData.brideName?.charAt(0)}
                        </h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-10">
                        {['Union', 'Schedule', 'Gallery', 'Wishes', 'Registry'].map(item => (
                            <a key={item} className="text-xs font-bold tracking-[0.2em] uppercase hover:text-[#D4AF37] transition-colors" href={`#${item.toLowerCase()}`}>
                                {item}
                            </a>
                        ))}
                    </nav>
                    <button className="hidden sm:flex min-w-[100px] items-center justify-center border border-[#D4AF37] px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-[#D4AF37] hover:text-black transition-all">
                        RSVP
                    </button>
                </div>
            </header>

            <main className="pt-16">
                {/* Hero */}
                <section id="union" className="relative h-[90vh] flex items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                        style={{
                            backgroundImage: `linear-gradient(rgba(10, 10, 12, 0.7), rgba(10, 10, 12, 0.7)), url(${customizations.heroBgImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80'})`
                        }}
                    />
                    <div className="relative z-10 text-center px-4 max-w-4xl">
                        <div className="mb-6 flex justify-center items-center">
                            <div className="w-24 h-[1px] bg-[#D4AF37]"></div>
                            <span className="mx-4 text-[#D4AF37] tracking-[0.5em] text-sm uppercase font-bold">EST. {year}</span>
                            <div className="w-24 h-[1px] bg-[#D4AF37]"></div>
                        </div>
                        <h1 className="gold-gradient-text text-5xl md:text-8xl font-black leading-tight tracking-tighter uppercase mb-6">
                            <EditableText initialValue={weddingData.groomName} onSave={val => onUpdateCustomization('groomName', val)} isEditing={isEditing} tag="span" />
                            <br className="md:hidden" /> & <br className="md:hidden" />
                            <EditableText initialValue={weddingData.brideName} onSave={val => onUpdateCustomization('brideName', val)} isEditing={isEditing} tag="span" />
                        </h1>
                        <div className="inline-block p-1 border border-[#D4AF37]/30">
                            <div className="border border-[#D4AF37] px-8 py-4 bg-[#0a0a0c]/40 backdrop-blur-sm">
                                <p className="text-white text-lg md:text-xl font-light tracking-[0.3em] uppercase">
                                    <EditableText initialValue={weddingData.weddingDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} tag="span" />
                                    {' • '}
                                    <EditableText initialValue={weddingData.venue || 'The Grand Hall'} onSave={val => onUpdateCustomization('venue', val)} isEditing={isEditing} tag="span" />
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Timeline */}
                <section id="schedule" className="py-24 px-6 bg-pattern">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-[#D4AF37] text-4xl font-bold tracking-widest uppercase mb-2">The Celebration</h2>
                            <div className="flex items-center justify-center gap-4">
                                <div className="h-[1px] w-12 bg-[#D4AF37]/50"></div>
                                <Stars className="text-[#D4AF37] size-5" />
                                <div className="h-[1px] w-12 bg-[#D4AF37]/50"></div>
                            </div>
                        </div>
                        <div className="space-y-12">
                            {timeline.length > 0 ? timeline.map((event, i) => (
                                <div key={event.id} className="flex flex-col md:flex-row gap-8 items-center group">
                                    <div className="w-full md:w-1/3 text-center md:text-right">
                                        <p className="text-[#D4AF37] text-2xl font-bold tracking-tighter">{event.event_time}</p>
                                        <p className="text-white/60 text-sm tracking-widest uppercase mt-1">{event.location}</p>
                                    </div>
                                    <div className="hidden md:flex flex-col items-center">
                                        <div className="size-4 border border-[#D4AF37] rotate-45 group-hover:bg-[#D4AF37] transition-colors"></div>
                                        <div className="w-[1px] h-24 bg-[#D4AF37]/20"></div>
                                    </div>
                                    <div className="w-full md:w-2/3 deco-border p-6 bg-[#0a0a0c]/50 transition-transform hover:-translate-y-1">
                                        <h3 className="text-white text-xl font-bold tracking-widest uppercase mb-2">{event.title}</h3>
                                        <p className="text-white/70 font-light leading-relaxed">{event.description}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-white/40 italic">Timeline details coming soon...</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Gallery */}
                <section id="gallery" className="py-24 px-6 bg-[#0a0a0c] border-y border-[#D4AF37]/10">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-[#D4AF37] text-4xl font-bold tracking-widest uppercase mb-4">Captured Magic</h2>
                            <p className="text-white/60 max-w-2xl mx-auto uppercase tracking-widest text-xs">Moments of splendor from our journey together</p>
                        </div>
                        {photos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[300px]">
                                {photos.slice(0, 8).map((photo, i) => (
                                    <div key={photo.id} className={`relative group overflow-hidden border border-[#D4AF37]/20 ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                                        <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" src={photo.url} alt={photo.title} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Heart className="text-[#D4AF37] size-8" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="border border-dashed border-[#D4AF37]/30 rounded-2xl p-20 text-center">
                                <Camera className="size-12 text-[#D4AF37]/40 mx-auto mb-4" />
                                <p className="text-[#D4AF37]/60 tracking-widest uppercase text-sm">Gallery empty. Add some photos to inspire awe.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Map */}
                <section id="location" className="py-24 px-6 bg-[#0a0a0c] border-t border-[#D4AF37]/10 text-center">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-[#D4AF37] text-4xl font-bold tracking-widest uppercase mb-4">The Venue</h2>
                        <p className="text-white/60 tracking-widest text-xs uppercase mb-12">
                            <EditableText initialValue={weddingData.venue || 'The Palace'} onSave={val => onUpdateCustomization('venue', val)} isEditing={isEditing} tag="span" />
                        </p>
                        {weddingData.venueMapUrl && (
                            <div className="relative p-1 bg-gradient-to-br from-[#D4AF37]/50 to-transparent shadow-2xl overflow-hidden max-w-4xl mx-auto">
                                <iframe
                                    width="100%" height="450" style={{ border: 0, filter: 'grayscale(1) contrast(1.2) invert(0.9)' }}
                                    src={weddingData.venueMapUrl.replace('maps/place/', 'maps/embed/place/')}
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-[#0a0a0c] border-t border-[#D4AF37]/20 py-20 px-6 text-center">
                <div className="max-w-xl mx-auto">
                    <div className="flex justify-center mb-8">
                        <div className="size-12 border-2 border-[#D4AF37] rotate-45 flex items-center justify-center">
                            <Stars className="text-[#D4AF37] -rotate-45 size-6" />
                        </div>
                    </div>
                    <h3 className="gold-gradient-text text-3xl font-black tracking-widest uppercase mb-6">
                        {weddingData.groomName} & {weddingData.brideName}
                    </h3>
                    <p className="text-white/40 tracking-[0.4em] uppercase text-xs mb-10">See you on the dance floor</p>
                    <div className="art-deco-divider mb-10"></div>
                    <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase">© {year} All Rights Reserved • AI Design Studio</p>
                </div>
            </footer>
        </div>
    );
};

export default ArtDecoGlamour;
