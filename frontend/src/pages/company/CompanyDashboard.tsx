import { CompanyNavbar } from "@/components/company/dashboard/CompanyNavbar";
import { HeroSection } from "@/components/company/dashboard/HeroSection";
import { FloatingToolbar } from "@/components/company/dashboard/FloatingToolbar";
import { StatsCards } from "@/components/company/dashboard/StatsCards";
import { LeadsTable } from "@/components/company/dashboard/LeadsTable";
import { PortfolioGrid } from "@/components/company/dashboard/PortfolioGrid";
import { ServicesCards } from "@/components/company/dashboard/ServicesCards";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Sparkles, Pencil, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const CompanyDashboard = () => {
    const { currentUser } = useAuth();
    const { hash } = useLocation();
    const navigate = useNavigate();

    // Unified role logic
    const isProfessional = ['vendor', 'photographer', 'admin'].includes(currentUser?.role || '');
    const isClient = !isProfessional;


    useEffect(() => {
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <div className="min-h-screen bg-slate-50/50 font-sans">
            <CompanyNavbar />

            <main className="relative">
                <HeroSection />

                {/* Floating Toolbar - Fixed relative to viewport */}
                <FloatingToolbar />

                {/* Dashboard Content Sections */}
                <div className="container px-4 md:px-6 py-12 space-y-20 pb-24 md:pb-12">

                    {/* Section A: Quick Stats */}
                    <section id="overview">
                        <StatsCards />
                    </section>

                    {/* Section: Premium Upgrade (Non-Premium Clients Only) */}
                    {isClient && !currentUser?.has_premium_access && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 p-8 md:p-12 text-white shadow-2xl"
                        >
                            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                        <Sparkles className="w-3 h-3" /> Exclusive Offer
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                                        Unlock the Full Power of <br />
                                        <span className="text-rose-200">Your Wedding Experience</span>
                                    </h2>
                                    <p className="text-indigo-50 text-lg max-w-md">
                                        Upgrade to Premium to access our Visual Website Builder, AI-powered Face Detection for guests, and unlimited photo storage.
                                    </p>
                                    <div className="flex flex-wrap gap-4 pt-2">
                                        <Button
                                            size="lg"
                                            className="bg-white text-indigo-600 hover:bg-rose-50 font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1"
                                            onClick={() => navigate('/company/pricing')}
                                        >
                                            Explore Plans & Pricing
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="text-white hover:bg-white/10 font-medium"
                                            onClick={() => navigate('/company/pricing')}
                                        >
                                            See All Features →
                                        </Button>
                                    </div>
                                </div>
                                <div className="hidden md:grid grid-cols-2 gap-4">
                                    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20">
                                        <div className="w-10 h-10 bg-rose-400/30 rounded-full flex items-center justify-center mb-3">
                                            <Sparkles className="w-5 h-5 text-rose-200" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">AI Face Detection</h4>
                                        <p className="text-xs text-indigo-100/80">Guests find their photos in seconds using AI.</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 mt-4">
                                        <div className="w-10 h-10 bg-indigo-400/30 rounded-full flex items-center justify-center mb-3">
                                            <Pencil className="w-5 h-5 text-indigo-200" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">Visual Builder</h4>
                                        <p className="text-xs text-indigo-100/80">Design your site with No-Code drag & drop.</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 lg:-mt-4">
                                        <div className="w-10 h-10 bg-purple-400/30 rounded-full flex items-center justify-center mb-3">
                                            <Users className="w-5 h-5 text-purple-200" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">Guest Manager</h4>
                                        <p className="text-xs text-indigo-100/80">Advanced RSVP tracking and RSVPs.</p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-lg p-4 rounded-2xl border border-white/20 mt-0 lg:mt-0">
                                        <div className="w-10 h-10 bg-blue-400/30 rounded-full flex items-center justify-center mb-3">
                                            <Globe className="w-5 h-5 text-blue-200" />
                                        </div>
                                        <h4 className="font-bold text-sm mb-1">Custom Domain</h4>
                                        <p className="text-xs text-indigo-100/80">Your own personalized wedding URL.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative background shapes */}
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-rose-400/20 rounded-full blur-3xl"></div>
                        </motion.section>
                    )}

                    {/* Section B: Recent Leads (Professionals Only) */}
                    {isProfessional && (
                        <section id="leads">
                            <LeadsTable />
                        </section>
                    )}

                    {/* Section C: Portfolio (Professionals Only) */}
                    {isProfessional && (
                        <section id="portfolio">
                            <PortfolioGrid />
                        </section>
                    )}

                    {/* Section D: Services (Professionals Only) */}
                    {isProfessional && (
                        <section id="services">
                            <ServicesCards />
                        </section>
                    )}

                </div>
            </main>

            {/* Simple Footer */}
            <footer className="bg-white border-t border-slate-200 py-12">
                <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© 2025 WeddingWeb Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-slate-900">Terms of Service</Link>
                        <Link to="/company/contact" className="hover:text-slate-900">Support</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanyDashboard;
