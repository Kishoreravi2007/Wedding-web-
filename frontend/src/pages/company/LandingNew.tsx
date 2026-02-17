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
                                <Link to="/weddings/demo">
                                    <button className="flex items-center justify-center gap-2 min-w-[180px] h-14 rounded-xl bg-white border border-[#dcdfe5] text-[#111318] font-bold text-lg hover:bg-gray-50 transition-all px-6">
                                        View Demo
                                    </button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 pt-4">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                                                alt="User"
                                                className="w-full h-full object-cover"
                                            />
                                        </div >
                                    ))}
                                </div >
                                <p className="text-sm font-semibold text-[#636f88]">Joined by 2,000+ couples this month</p>
                            </div >
                        </div >
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative">
                                <img
                                    alt="Wedding"
                                    className="w-full h-full object-cover"
                                    src="/hero-wedding.jpg"
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
                            {(reviews.length > 0 ? reviews : [
                                {
                                    text: "WeddingWeb was the talk of our reception! Our guests were blown away when they got a notification with their own photos just minutes after the ceremony.",
                                    name: "Sarah & Michael",
                                    label: "Married in June 2023",
                                    image: "/wedding.jpg"
                                },
                                {
                                    text: "As a professional photographer, this platform has saved me hours of sorting and delivering previews. The AI face detection is incredibly accurate.",
                                    name: "David Chen",
                                    label: "Professional Photographer",
                                    image: "/kishore-photo.jpg"
                                },
                                {
                                    text: "The live streaming quality was flawless. My grandmother in London felt like she was sitting in the front row. Best investment we made!",
                                    name: "James & Elena",
                                    label: "Married in Oct 2023",
                                    image: "/hero-gallery.jpg"
                                }
                            ]).map((review, i) => (
                                <div key={i} className="bg-background-light dark:bg-gray-800 p-8 rounded-2xl">
                                    <div className="flex gap-1 text-orange-400 mb-4">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="text-[#111318] dark:text-gray-200 font-medium italic mb-6">"{review.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                                            <img alt={review.name} src={review.image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-[#111318] dark:text-white font-bold">{review.name}</p>
                                            <p className="text-[#636f88] dark:text-gray-400 text-sm">{review.label || review.event}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                            <div className="flex items-center gap-2 text-primary mb-6">
                                <Sparkles className="w-8 h-8 font-bold" />
                                <h2 className="text-[#111318] dark:text-white text-xl font-extrabold tracking-tight font-display">WeddingWeb</h2>
                            </div>
                            <p className="text-[#636f88] dark:text-gray-400 text-sm leading-relaxed max-w-[280px] mb-8">
                                The world's first AI-integrated wedding technology platform. We make memories accessible, instantly.
                            </p>
                            <div className="flex gap-4">
                                {['public', 'share', 'mail'].map((icon, i) => (
                                    <a key={i} href="javascript:void(0)" onClick={(e) => e.preventDefault()} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-white transition-all">
                                        {/* Placeholder for social icons */}
                                        <div className="w-4 h-4 bg-current rounded-sm opacity-50"></div>
                                    </a>
                                ))}
                            </div>
                        </div>
                        {[
                            { title: "Product", links: ["AI Detection", "Live Stream", "Pricing", "Smart Gallery"] },
                            { title: "Company", links: ["About Us", "Careers", "Blog", "Press"] },
                            { title: "Support", links: ["Help Center", "Contact", "Privacy", "Terms"] }
                        ].map((col, i) => (
                            <div key={i}>
                                <h6 className="text-[#111318] dark:text-white font-bold mb-6">{col.title}</h6>
                                <ul className="space-y-4 text-sm text-[#636f88] dark:text-gray-400">
                                    {col.links.map((link, j) => (
                                        <li key={j}><Link to={`/company/${link.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors">{link}</Link></li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mt-20 pt-8 border-t border-[#f0f2f4] dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-xs text-[#636f88] dark:text-gray-400">© 2026 WeddingWeb AI Inc. All rights reserved.</p>
                        <div className="flex items-center gap-6">
                            <Link to="/privacy" className="text-xs text-[#636f88] dark:text-gray-400 hover:text-primary">Privacy Policy</Link>
                            <Link to="/terms" className="text-xs text-[#636f88] dark:text-gray-400 hover:text-primary">Terms of Service</Link>
                            <p className="text-xs text-[#636f88] dark:text-gray-400">Cookie Settings</p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );

};

export default LandingNew;
