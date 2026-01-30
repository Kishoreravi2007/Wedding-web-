import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import CompanyNavSimple from "@/components/CompanyNavSimple";
import { LandingToolbar } from "@/components/LandingToolbar";
import {
    BookOpen,
    MousePointer2,
    Sparkles,
    Camera,
    Share2,
    CheckCircle2,
    Zap,
    ArrowRight,
    Monitor,
    Smartphone,
    ShieldCheck,
    Heart
} from "lucide-react";

const Guide = () => {
    const steps = [
        {
            title: "1. Create Your Website",
            icon: <Monitor className="w-8 h-8" />,
            description: "Sign up and use our intuitive drag-and-drop builder to create your personalized wedding website.",
            details: [
                "Choose from premium templates",
                "Add your love story and event details",
                "Customize colors and fonts",
                "No coding required"
            ],
            video: "/videos/guide-builder.mp4",
            poster: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
            color: "from-rose-500 to-pink-500"
        },
        {
            title: "2. Management & RSVPs",
            icon: <MousePointer2 className="w-8 h-8" />,
            description: "Keep track of your guests and events with our powerful management dashboard.",
            details: [
                "Manage guest lists and RSVPs",
                "Create interactive event timelines",
                "Share venue locations via maps",
                "Send real-time updates"
            ],
            video: "/videos/guide-dashboard.mp4",
            poster: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop",
            color: "from-purple-500 to-indigo-500"
        },
        {
            title: "3. AI Photo Experience",
            icon: <Sparkles className="w-8 h-8" />,
            description: "Our AI automatically processes photos so guests can find their moments instantly.",
            details: [
                "Advanced facial recognition",
                "Instant photo matching for guests",
                "Privacy-focused processing",
                "Unlimited photo storage"
            ],
            video: "/videos/guide-ai.mp4",
            poster: "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=2006&auto=format&fit=crop",
            color: "from-blue-500 to-cyan-500"
        },
        {
            title: "4. Share the Magic",
            icon: <Share2 className="w-8 h-8" />,
            description: "Connect with guests around the world through live streaming and digital wishes.",
            details: [
                "HD live streaming for distant guests",
                "Digital guestbook for wishes",
                "Easy social media sharing",
                "High-resolution downloads"
            ],
            video: "/videos/guide-sharing.mp4",
            poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop",
            color: "from-green-500 to-emerald-500"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <CompanyNavSimple />
            <LandingToolbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 lg:pt-40 overflow-hidden bg-white">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="inline-block mb-6 px-4 py-2 bg-rose-100 rounded-full">
                            <span className="text-rose-600 font-semibold flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Platform Guide
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight text-center">
                            How WeddingWeb Works
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed text-center">
                            Experience the future of weddings. Hover over the tutorials below to see our platform in action.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Guide Steps */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid gap-24">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center`}
                            >
                                <div className="flex-1 space-y-6">
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
                                        {step.icon}
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900">{step.title}</h2>
                                    <p className="text-lg text-slate-600 leading-relaxed italic border-l-4 border-rose-500 pl-4 bg-rose-50/30 py-2 rounded-r-xl">
                                        {step.description}
                                    </p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {step.details.map((detail, dIndex) => (
                                            <li key={dIndex} className="flex items-start gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                                <span className="text-slate-700 font-medium">{detail}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className={`relative group w-full aspect-video rounded-[2rem] bg-gradient-to-br ${step.color} p-1 shadow-2xl transition-all duration-500 hover:scale-[1.02]`}>
                                        <div className="w-full h-full bg-slate-900 rounded-[1.8rem] overflow-hidden relative group">
                                            <video
                                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 cursor-pointer"
                                                poster={step.poster}
                                                muted
                                                loop
                                                playsInline
                                                onMouseOver={(e) => e.currentTarget.play()}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.pause();
                                                    e.currentTarget.currentTime = 0;
                                                }}
                                                onClick={(e) => {
                                                    if (e.currentTarget.paused) e.currentTarget.play();
                                                    else e.currentTarget.pause();
                                                }}
                                            >
                                                <source src={step.video} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>

                                            {/* Play Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
                                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                                    <Zap className="w-10 h-10 text-white fill-white" />
                                                </div>
                                            </div>

                                            {/* Info Badge */}
                                            <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 text-center">
                                                <p className="text-white font-bold flex items-center justify-center gap-2">
                                                    <Sparkles className="w-4 h-4 text-rose-400" />
                                                    {step.title.split('.')[1].trim()} Tutorial
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 px-4 bg-slate-900 text-white overflow-hidden relative">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Powerful Features for Everyone</h2>
                        <p className="text-xl text-slate-400">Everything you need, built into one seamless platform.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="bg-slate-800 border-slate-700 text-white">
                            <CardContent className="p-8 space-y-4">
                                <Smartphone className="w-12 h-12 text-rose-500" />
                                <h3 className="text-xl font-bold">Mobile First</h3>
                                <p className="text-slate-400">Perfect experience on all devices - from smartphones to grand displays.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700 text-white">
                            <CardContent className="p-8 space-y-4">
                                <ShieldCheck className="w-12 h-12 text-purple-500" />
                                <h3 className="text-xl font-bold">Enterprise Security</h3>
                                <p className="text-slate-400">Your memories are precious. We ensure top-tier privacy and data protection.</p>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-800 border-slate-700 text-white">
                            <CardContent className="p-8 space-y-4">
                                <Zap className="w-12 h-12 text-indigo-500" />
                                <h3 className="text-xl font-bold">Lightning Fast</h3>
                                <p className="text-slate-400">Global content delivery for instant photo loading and smooth streaming.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                {/* Abstract shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 blur-[100px] -mr-48 -mt-48" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] -ml-48 -mb-48" />
            </section>

            {/* CTA section */}
            <section className="py-24 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 rounded-[3rem] p-12 md:p-20 shadow-2xl space-y-8"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                            Ready to create your perfect digital wedding?
                        </h2>
                        <p className="text-xl text-white/80 max-w-xl mx-auto">
                            Join hundreds of couples who have revolutionized their wedding experience with WeddingWeb.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link to="/company/signup">
                                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 px-10 py-7 text-xl rounded-2xl shadow-xl font-bold transition-transform hover:scale-105">
                                    Get Started Free
                                </Button>
                            </Link>
                            <Link to="/company/contact">
                                <Button size="lg" className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 px-10 py-7 text-xl rounded-2xl font-bold transition-transform hover:scale-105">
                                    Contact Support
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-slate-100">
                <div className="container mx-auto px-4 text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <img src="/logo.png" className="w-8 h-8" alt="Logo" />
                        <span className="text-2xl font-bold text-slate-900">WeddingWeb</span>
                    </div>
                    <p className="text-slate-500 font-medium">&copy; 2025 WeddingWeb. All rights reserved.</p>
                    <p className="text-slate-400 text-sm flex items-center justify-center gap-1">
                        Made with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> in Kerala
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Guide;
