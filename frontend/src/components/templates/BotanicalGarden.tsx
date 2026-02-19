
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Flower, MapPin, Calendar, Clock, Camera, Mail, Share2, Train, Bus, Plane, Map, Edit3 } from 'lucide-react';
import { EditableText } from '@/components/ui/editable-text';
import CountdownTimer from '@/components/premium/CountdownTimer';

interface BotanicalGardenProps {
    weddingData: any;
    timeline: any[];
    photos: any[];
    isEditing: boolean;
    onUpdateCustomization: (key: string, value: string) => void;
}

const BotanicalGarden: React.FC<BotanicalGardenProps> = ({
    weddingData,
    timeline,
    photos,
    isEditing,
    onUpdateCustomization
}) => {
    const customizations = weddingData.customizations || {};
    const dateObj = weddingData.weddingDate ? new Date(weddingData.weddingDate) : new Date();
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const year = dateObj.getFullYear();

    const groomFirst = (weddingData.groomName || 'Groom').split(' ')[0];
    const brideFirst = (weddingData.brideName || 'Bride').split(' ')[0];

    const accentColor = customizations.accentColor || '#1754cf';
    const globalFont = customizations.globalFont || 'font-serif';
    const fontClass = globalFont === 'font-sans' ? 'font-sans' : 'font-serif';

    return (
        <div className={`bg-[#fdf8f9] ${fontClass} text-[#111318] selection:bg-[#1754cf]/20`}>
            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --accent-color: ${accentColor};
                    --accent-light: ${accentColor}1A;
                    --accent-medium: ${accentColor}33;
                }
                .floral-gradient {
                    background: linear-gradient(135deg, #fdf8f9 0%, #ecfdf5 100%);
                }
                .text-accent { color: var(--accent-color); }
                .bg-accent { background-color: var(--accent-color); }
                .border-accent { border-color: var(--accent-color); }
                .shadow-accent { shadow-color: var(--accent-color); }
            `}} />

            {/* Top Navigation */}
            <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-accent bg-white/80 backdrop-blur-md px-6 md:px-20 py-4" style={{ borderColor: `${accentColor}1A` }}>
                <div className="flex items-center gap-3">
                    <div className="text-accent flex items-center">
                        <img src={customizations.coupleLogo || "/logo.png"} alt="Logo" className="h-10 w-auto object-contain" />
                    </div>
                    <h2 className="text-accent text-xl font-extrabold leading-tight tracking-tight">
                        {groomFirst} & {brideFirst}
                    </h2>
                </div>
                <div className="hidden md:flex flex-1 justify-end gap-10 items-center">
                    <nav className="flex items-center gap-8">
                        {['Story', 'Gallery', 'Guestbook', 'Registry'].map(item => (
                            <a key={item} className="text-[#111318] hover:text-accent transition-colors text-sm font-semibold uppercase tracking-wider" href={`#${item.toLowerCase()}`}>
                                {item === 'Story' ? 'Our Story' : item}
                            </a>
                        ))}
                    </nav>
                    <button className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-full h-11 px-6 bg-accent text-white text-sm font-bold shadow-lg transition-transform hover:scale-105" style={{ boxShadow: `0 10px 15px -3px ${accentColor}33` }}>
                        RSVP Now
                    </button>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative px-4 md:px-10 lg:px-20 pt-6 pb-12">
                    <div className="relative w-full h-[600px] md:h-[700px] rounded-[2rem] overflow-hidden group">
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                            style={{
                                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.5)), url(${customizations.heroBgImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=80'})`
                            }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-[0.2em] border border-white/30">
                                Save the Date • <EditableText initialValue={formattedDate} onSave={val => onUpdateCustomization('weddingDate', val)} isEditing={isEditing} tag="span" />
                            </span>
                            <h1 className="text-white text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 max-w-4xl tracking-tight">
                                Growing Together <br /><span className="text-[#fce7f3]">in Eternal Love</span>
                            </h1>
                            <p className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-2xl leading-relaxed">
                                <EditableText
                                    initialValue={customizations.storyBody || 'Our journey has been filled with laughter, adventure, and an ever-growing love.'}
                                    onSave={val => onUpdateCustomization('storyBody', val)}
                                    isEditing={isEditing}
                                    tag="span"
                                />
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="flex min-w-[180px] items-center justify-center rounded-full h-14 px-8 bg-white text-accent text-base font-bold shadow-xl hover:bg-[#fce7f3] transition-colors">
                                    Get Directions
                                </button>
                                <button className="flex min-w-[180px] items-center justify-center rounded-full h-14 px-8 bg-accent text-white text-base font-bold shadow-xl transition-colors hover:opacity-90">
                                    RSVP Today
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Countdown */}
                <section className="max-w-[960px] mx-auto px-4 py-12">
                    <div className="flex justify-center">
                        <CountdownTimer
                            targetDate={weddingData.weddingDate}
                            targetTime={weddingData.weddingTime}
                        />
                    </div>
                </section>

                {/* Timeline */}
                <section id="story" className="py-24 px-4 bg-[#ecfdf5]/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                        <Flower className="size-64 text-accent" />
                    </div>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-accent text-4xl md:text-5xl font-black tracking-tight mb-4">Blooming Love</h2>
                            <div className="h-1 w-24 bg-accent mx-auto rounded-full opacity-20"></div>
                            <p className="mt-4 text-[#636f88] font-medium">The chapters of our garden romance</p>
                        </div>
                        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 md:before:mx-auto before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-accent before:to-transparent" style={{ '--tw-gradient-from': 'transparent', '--tw-gradient-to': 'transparent', '--tw-gradient-stops': `transparent, ${accentColor}33, transparent` } as React.CSSProperties}>
                            {timeline.map((event, i) => (
                                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white text-accent shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" style={{ backgroundColor: '#fce7f3' }}>
                                        <Flower className="size-4" />
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[45%] p-6 rounded-2xl bg-white border border-[#fce7f3] shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-bold text-accent">{event.title}</div>
                                            <time className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{event.event_time}</time>
                                        </div>
                                        <div className="text-[#636f88]">{event.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Travel */}
                <section id="travel" className="py-24 px-4 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>
                                <Clock className="size-4" />
                                <EditableText initialValue={customizations.travelTitle || 'Travel & Logistics'} onSave={val => onUpdateCustomization('travelTitle', val)} isEditing={isEditing} tag="span" />
                            </div>
                            <h2 className="text-[#111318] text-4xl font-black tracking-tight mb-4">How to Reach</h2>
                            <p className="text-[#636f88] text-lg">Travel information for our guest's convenience</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Railway', icon: Train, key: 'travelRailway', default: 'Nearest Station' },
                                { label: 'Bus Stand', icon: Bus, key: 'travelBusStand', default: 'Main Stand' },
                                { label: 'Bus Stop', icon: Bus, key: 'travelBusStop', default: 'Garden Gate' },
                                { label: 'Airport', icon: Plane, key: 'travelAirport', default: 'International Airport' }
                            ].map(t => (
                                <div key={t.label} className="p-8 rounded-[2rem] bg-[#fdfafb] border border-[#fce7f3]/30 hover:shadow-xl transition-all group">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>
                                        <t.icon className="size-6" />
                                    </div>
                                    <h3 className="font-black text-xl mb-3">{t.label}</h3>
                                    <p className="text-[#636f88] text-sm leading-relaxed">
                                        <EditableText initialValue={customizations[t.key] || t.default} onSave={val => onUpdateCustomization(t.key, val)} isEditing={isEditing} tag="span" />
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Map */}
                <section id="location" className="py-24 px-4 bg-[#fdfafb]">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>
                            <MapPin className="size-4" />
                            The Secret Garden
                        </div>
                        <h2 className="text-[#111318] text-4xl font-black tracking-tight mb-4">Location & Directions</h2>
                        <p className="text-[#636f88] text-lg mb-12">
                            <EditableText initialValue={weddingData.venue || 'The Palace'} onSave={val => onUpdateCustomization('venue', val)} isEditing={isEditing} tag="span" />
                        </p>
                        {weddingData.venueMapUrl && (
                            <div className="w-full h-[450px] rounded-[2rem] shadow-xl border-8 border-white overflow-hidden bg-slate-100 relative max-w-4xl mx-auto">
                                <iframe id="wedding-map" width="100%" height="100%" style={{ border: 0 }}
                                    src={weddingData.venueMapUrl.replace('maps/place/', 'maps/embed/place/')}
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-[#fce7f3] py-16 px-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-12 justify-between text-center md:text-left">
                    <div className="max-w-sm">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                            <Flower className="size-8 text-accent" />
                            <h2 className="text-accent text-xl font-extrabold tracking-tight">WeddingWeb</h2>
                        </div>
                        <p className="text-[#636f88] leading-relaxed mb-6">
                            Thank you for being part of our story. We can't wait to celebrate this blooming life together.
                        </p>
                        <div className="flex justify-center md:justify-start gap-4">
                            {[Share2, Mail].map((I, i) => (
                                <a key={i} className="w-10 h-10 rounded-full border border-[#fce7f3] flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors" href="#">
                                    <I className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Wedding Info</h4>
                            <ul className="space-y-2 text-sm text-[#636f88]">
                                {['Schedule', 'Travel & Stay', 'Wedding Party', 'FAQs'].map(l => <li key={l}><a className="hover:text-[#1754cf]" href="#">{l}</a></li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Quick Links</h4>
                            <ul className="space-y-2 text-sm text-[#636f88]">
                                {['Our Story', 'Gallery', 'Guestbook', 'RSVP'].map(l => <li key={l}><a className="hover:text-[#1754cf]" href={`#${l.toLowerCase().replace(' ', '')}`}>{l}</a></li>)}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 uppercase text-xs tracking-widest">Details</h4>
                            <p className="text-sm text-[#636f88]">{weddingData.venue}<br />{formattedDate}</p>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#fce7f3] text-center text-xs text-[#636f88] font-medium tracking-widest uppercase">
                    © {year} {weddingData.groomName} & {weddingData.brideName}. Designed with Love.
                </div>
            </footer>
        </div>
    );
};

export default BotanicalGarden;
