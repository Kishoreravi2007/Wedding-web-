import { Link } from "react-router-dom";
import { WeddingWebHeader } from "@/components/WeddingWebHeader";
import { ArrowRight, Check, Star, Rocket, Play, Camera, Image, Video, UserCheck, Shield, Cloud, Upload, Zap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/api";

const LandingNew = () => {
    // Review logic from old landing page
    const [reviews, setReviews] = useState<any[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/reviews`);
                const data = await res.json();
                if (data.success) {
                    setReviews(data.reviews.slice(0, 3)); // Take top 3
                }
            } catch (error) {
                console.error("Failed to fetch reviews", error);
            } finally {
                setLoadingReviews(false);
            }
        };
        fetchReviews();
    }, []);

    // Placeholder images if not provided in design, but design had specific URLs. 
    // I am using the URLs from the user request.

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-[#111318] min-h-screen flex flex-col">
            <WeddingWebHeader />

            <main className="w-full flex-grow">
                {/* Hero Section */}
                <section className="relative w-full px-6 md:px-20 lg:px-40 py-12 md:py-24">
                    <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-8 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                                <Rocket className="w-4 h-4" />
                                The Future of Weddings
                            </div>
                            <h1 className="text-[#111318] dark:text-white text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight">
                                Elevate Your Wedding Experience <span className="text-primary">with AI</span>
                            </h1>
                            <p className="text-[#636f88] dark:text-gray-400 text-lg md:text-xl font-medium leading-relaxed max-w-[540px]">
                                Revolutionize your special day with AI face detection, smart galleries, and instant photo sharing. Give every guest their personal highlight reel in seconds.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/company/signup">
                                    <button className="flex items-center justify-center gap-2 min-w-[180px] h-14 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all px-6">
                                        Get Started Free
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </Link>

                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=User+${i}&background=random&color=fff`}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/logo.png';
                                                }}
                                            />
                                        </div >
                                    ))}
                                </div >
                                <p className="text-sm font-semibold text-[#636f88]">Trusted by couples nationwide</p>
                            </div >
                        </div >
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative">
                                <img
                                    alt="Wedding"
                                    className="w-full h-full object-cover"
                                    src="/hero-wedding.jpg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=2070&auto=format&fit=crop';
                                    }}
                                />
                                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                            <UserCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-primary uppercase">New Feature</p>
                                            <p className="text-[#111318] font-bold">Instant Face Identification</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative element */}
                            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10"></div>
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="bg-white dark:bg-gray-900 px-6 md:px-20 lg:px-40 py-24">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center max-w-[700px] mx-auto mb-16">
                            <h2 className="text-primary text-sm font-extrabold uppercase tracking-widest mb-3">Core Technology</h2>
                            <h3 className="text-[#111318] dark:text-white text-4xl font-extrabold tracking-tight mb-6">Smart Features for Your Big Day</h3>
                            <p className="text-[#636f88] dark:text-gray-400 text-lg">Our platform uses cutting-edge AI to ensure no memory is missed and every guest feels like a VIP.</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: <UserCheck className="w-6 h-6" />, title: "AI Face Detection", desc: "Guests find their personal photos instantly across all galleries using advanced biometric recognition." },
                                { icon: <Image className="w-6 h-6" />, title: "Smart Photo Gallery", desc: "Beautifully curated galleries that organize themselves by event stage, location, and key moments." },
                                { icon: <Video className="w-6 h-6" />, title: "Live Streaming", desc: "Share your ceremony in stunning 4K real-time with loved ones who couldn't make it in person." },
                                { icon: <Camera className="w-6 h-6" />, title: "Photographer Portal", desc: "A professional workspace for your photographer to upload, cull, and manage high-res deliverables." }
                            ].map((feature, idx) => (
                                <div key={idx} className="p-8 rounded-2xl border border-[#f0f2f4] dark:border-gray-800 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all group bg-white dark:bg-gray-800">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                        {feature.icon}
                                    </div>
                                    <h4 className="text-[#111318] dark:text-white text-xl font-bold mb-3">{feature.title}</h4>
                                    <p className="text-[#636f88] dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="bg-background-light dark:bg-gray-950 px-6 md:px-20 lg:px-40 py-24">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="flex flex-col lg:flex-row gap-16 items-center">
                            <div className="flex-1 order-2 lg:order-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {[
                                        { icon: "qr_code_2", title: "No App Required", desc: "Guests simply scan a QR code. No downloads, no friction, just magic." },
                                        { icon: "cloud_done", title: "Secure Cloud Storage", desc: "Enterprise-grade encryption for your most precious digital memories." },
                                        { icon: "bolt", title: "Real-time Uploads", desc: "Photos appear in the shared gallery the exact moment they are captured." },
                                        { icon: "unfold_more", title: "Infinite Scaling", desc: "Whether you have 50 or 5,000 guests, our tech handles it all smoothly." }
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-white dark:border-gray-800">
                                            <div className="text-primary mb-4 text-3xl material-symbols-outlined font-light">
                                                {/* Using Lucide icons mapping or just render placeholder if font icon not available */}
                                                {idx === 0 ? <Rocket className="w-8 h-8" /> : idx === 1 ? <Shield className="w-8 h-8" /> : idx === 2 ? <Zap className="w-8 h-8" /> : <Cloud className="w-8 h-8" />}
                                            </div>
                                            <h5 className="text-[#111318] dark:text-white font-bold mb-2">{item.title}</h5>
                                            <p className="text-[#636f88] dark:text-gray-400 text-sm">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 order-1 lg:order-2">
                                <h2 className="text-primary text-sm font-extrabold uppercase tracking-widest mb-3">The WeddingWeb Advantage</h2>
                                <h3 className="text-[#111318] dark:text-white text-4xl font-extrabold tracking-tight mb-6">Designed for Joy, Engineered for Speed</h3>
                                <p className="text-[#636f88] dark:text-gray-400 text-lg mb-8">We focus on the technical heavy lifting so you and your guests can focus on what matters: celebrating your love. Our "zero-app" philosophy ensures 100% guest adoption.</p>
                                <ul className="space-y-4">
                                    {[
                                        "Auto-generated highlights for every guest face",
                                        "Privacy-first guest access controls",
                                        "One-click social sharing for Instagram & TikTok"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="rounded-full bg-green-100 p-1">
                                                <Check className="w-4 h-4 text-green-600 font-bold" />
                                            </div>
                                            <span className="text-[#111318] dark:text-gray-200 font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof / Reviews */}
                <section className="bg-white dark:bg-gray-900 px-6 md:px-20 lg:px-40 py-24">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="text-center mb-16">
                            <h3 className="text-[#111318] dark:text-white text-4xl font-extrabold tracking-tight">Loved by Couples & Pros</h3>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Render actual reviews if available, else static placeholders */}
                            {reviews.length > 0 && reviews.map((review, i) => (
                                <div key={i} className="bg-background-light dark:bg-gray-800 p-8 rounded-2xl">
                                    <div className="flex gap-1 text-orange-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-[#111318] dark:text-gray-200 font-medium italic mb-6">"{review.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                                            <img
                                                alt={review.name}
                                                src={review.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=random&color=fff`}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=User&background=random`;
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[#111318] dark:text-white font-bold">{review.name}</p>
                                            <p className="text-[#636f88] dark:text-gray-400 text-sm">{review.label || review.event || 'Verified Customer'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && !loadingReviews && (
                                <div className="col-span-3 text-center py-12">
                                    <p className="text-[#636f88] italic">No reviews yet. Be the first to share your experience!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 md:px-20 lg:px-40 py-24 mb-10">
                    <div className="max-w-[1200px] mx-auto bg-primary rounded-[2.5rem] p-12 md:p-20 relative overflow-hidden text-center text-white shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary via-blue-700 to-indigo-900 opacity-90"></div>
                        <div className="relative z-10 flex flex-col items-center gap-8">
                            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Ready to Create Magic?</h2>
                            <p className="text-white/80 text-lg md:text-xl max-w-[600px]">
                                Join thousands of couples using WeddingWeb to make their special day unforgettable for every single guest.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                                <Link to="/company/signup">
                                    <button className="bg-white text-primary px-10 h-14 rounded-xl font-extrabold text-lg hover:bg-gray-100 transition-all shadow-xl shadow-black/10">
                                        Get Started Free
                                    </button>
                                </Link>
                                <Link to="/company/contact">
                                    <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 h-14 rounded-xl font-extrabold text-lg hover:bg-white/20 transition-all">
                                        Talk to Sales
                                    </button>
                                </Link>
                            </div>
                            <p className="text-white/60 text-sm">No credit card required • Unlimited storage for 30 days</p>
                        </div>
                        {/* Abstract decorations */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-gray-900 border-t border-[#f0f2f4] dark:border-gray-800 px-6 md:px-20 lg:px-40 py-20">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
                        <div className="col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/logo.png" alt="WeddingWeb" className="w-10 h-10 rounded-xl object-contain" />
                                <h2 className="text-[#111318] dark:text-white text-xl font-extrabold tracking-tight font-display">WeddingWeb</h2>
                            </div>
                            <p className="text-[#636f88] dark:text-gray-400 text-sm leading-relaxed max-w-[280px] mb-8">
                                The world's first AI-integrated wedding technology platform. We make memories accessible, instantly.
                            </p>
                            <div className="flex gap-4">
                                {/* WhatsApp */}
                                <a href="https://wa.me/917012567978" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-[#25D366] hover:text-white transition-all" title="WhatsApp">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                </a>
                                {/* Instagram */}
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:text-white transition-all" title="Instagram">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                                </a>
                                {/* X (Twitter) */}
                                <a href="#" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-black hover:text-white transition-all" title="X (Twitter)">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                </a>
                            </div>
                        </div>
                        {/* Product Links */}
                        <div>
                            <h6 className="text-[#111318] dark:text-white font-bold mb-6">Product</h6>
                            <ul className="space-y-4 text-sm text-[#636f88] dark:text-gray-400">
                                <li><Link to="/company/services" className="hover:text-primary transition-colors">AI Detection</Link></li>
                                <li><Link to="/company/services" className="hover:text-primary transition-colors">Live Stream</Link></li>
                                <li><Link to="/company/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link to="/company/services" className="hover:text-primary transition-colors">Smart Gallery</Link></li>
                            </ul>
                        </div>
                        {/* Company Links */}
                        <div>
                            <h6 className="text-[#111318] dark:text-white font-bold mb-6">Company</h6>
                            <ul className="space-y-4 text-sm text-[#636f88] dark:text-gray-400">
                                <li><Link to="/company/about" className="hover:text-primary transition-colors">About Us</Link></li>
                                <li><Link to="/company/careers" className="hover:text-primary transition-colors">Careers</Link></li>
                                <li><Link to="/company/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                                <li><Link to="/company/press" className="hover:text-primary transition-colors">Press</Link></li>
                            </ul>
                        </div>
                        {/* Support Links */}
                        <div>
                            <h6 className="text-[#111318] dark:text-white font-bold mb-6">Support</h6>
                            <ul className="space-y-4 text-sm text-[#636f88] dark:text-gray-400">
                                <li><Link to="/company/help-center" className="hover:text-primary transition-colors">Help Center</Link></li>
                                <li><Link to="/company/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-20 pt-8 border-t border-[#f0f2f4] dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[#636f88] dark:text-gray-400">© 2026 WeddingWeb AI Inc. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link to="/privacy" className="text-xs text-[#636f88] dark:text-gray-400 hover:text-primary">Privacy Policy</Link>
                            <Link to="/terms" className="text-xs text-[#636f88] dark:text-gray-400 hover:text-primary">Terms of Service</Link>
                            <Link to="/company/cookie-settings" className="text-xs text-[#636f88] dark:text-gray-400 hover:text-primary">Cookie Settings</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );

};

export default LandingNew;
