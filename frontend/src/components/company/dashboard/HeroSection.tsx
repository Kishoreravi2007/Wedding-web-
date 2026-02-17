import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle2, ArrowRight, Plus, Eye, Award, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { UploadPhotoModal } from "./UploadPhotoModal";
import { StepUp2FAModal } from "./StepUp2FAModal";

export function HeroSection() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [isReturning, setIsReturning] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isStepUpOpen, setIsStepUpOpen] = useState(false);

    // Unified role logic
    const isProfessional = ['vendor', 'photographer', 'admin'].includes(currentUser?.role || '');

    useEffect(() => {
        const visited = localStorage.getItem("weddingweb_dashboard_visited");
        if (visited) {
            setIsReturning(true);
        } else {
            localStorage.setItem("weddingweb_dashboard_visited", "true");
        }
    }, []);

    // Fallback data if user is not fully set up
    const companyName = currentUser?.profile?.full_name || "WeddingWeb Events";
    const firstName = companyName.split(" ")[0];
    const locationName = currentUser?.profile?.location || "Palakkad, Kerala";
    const avatarUrl = currentUser?.profile?.avatar_url || "/placeholder-user.jpg";

    const handleUploadSuccess = () => {
        window.dispatchEvent(new Event('portfolio-updated'));
    };

    const handleEnterBuilder = () => {
        if (currentUser?.is_2fa_enabled) {
            setIsStepUpOpen(true);
        } else {
            navigate("/client");
        }
    };

    return (
        <section className="relative w-full py-12 md:py-20 lg:py-24 overflow-hidden bg-white">
            <div className="container px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

                    {/* Left Side: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col justify-center space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-rose-100 text-rose-600 hover:bg-rose-100/80">
                                Premium Partner
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl xl:text-6xl text-slate-900 leading-tight">
                                {currentUser ? (
                                    <>
                                        {isReturning ? "Welcome back," : "Welcome,"} <br className="md:hidden" />
                                        <span className="text-rose-600"> {firstName}</span>
                                    </>
                                ) : (
                                    <>
                                        WeddingWeb <span className="text-rose-600">Events</span>
                                    </>
                                )}
                            </h1>
                            <p className="text-xl font-medium text-slate-500">
                                Turning your moments into timeless memories.
                            </p>
                            <p className="max-w-[600px] text-slate-500 md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed leading-7">
                                {isProfessional ?
                                    "Welcome back! Manage your portfolio, track leads, and grow your business with WeddingWeb." :
                                    "Your journey starts here. Design your dream wedding website, manage your guests, and showcase your special moments."
                                }
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 relative">
                            {isProfessional && (
                                <>
                                    <UploadPhotoModal
                                        open={isUploadOpen}
                                        onOpenChange={setIsUploadOpen}
                                        onSuccess={handleUploadSuccess}
                                    >
                                        <Button size="lg" className="h-12 px-8 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all hover:-translate-y-1">
                                            <Plus className="mr-2 h-4 w-4" /> Add Portfolio
                                        </Button>
                                    </UploadPhotoModal>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 px-8 border-slate-200 text-slate-700 hover:border-rose-200 hover:bg-rose-50 transition-all hover:-translate-y-1"
                                        onClick={() => document.getElementById('leads')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        <Eye className="mr-2 h-4 w-4" /> View Leads
                                    </Button>
                                </>
                            )}

                            {currentUser?.has_premium_access ? (
                                <Button
                                    size="lg"
                                    className="h-12 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-1"
                                    onClick={handleEnterBuilder}
                                >
                                    <Sparkles className="mr-2 h-4 w-4" /> Enter Premium Builder
                                </Button>
                            ) : (
                                <Button
                                    size="lg"
                                    className="h-12 px-8 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-all hover:-translate-y-1"
                                    onClick={() => navigate('/company/pricing')}
                                >
                                    <Sparkles className="mr-2 h-4 w-4 text-purple-600" /> Unlock Premium Builder
                                </Button>
                            )}

                            {/* Rotating Decorative Badge */}
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute -right-4 -top-16 hidden lg:flex h-24 w-24 rounded-full border-2 border-dashed border-rose-200 items-center justify-center opacity-50 pointer-events-none"
                            >
                                <Award className="h-8 w-8 text-rose-300" />
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span>Verified Business</span>
                            </div>
                            <div className="h-4 w-px bg-slate-200"></div>
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span>4.9 Rating</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Side: Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                        className="relative lg:ml-auto w-full max-w-[600px]"
                    >
                        {/* Main Banner Image */}
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                            <img
                                src="/hero-wedding.jpg"
                                alt="Company Work"
                                className="object-cover w-full h-full hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>

                        {/* Profile Overlay Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="absolute -bottom-6 -left-6 md:bottom-8 md:-left-8 bg-white p-4 rounded-xl shadow-xl border border-slate-100 max-w-[280px] w-full"
                        >
                            <div className="flex items-start gap-3">
                                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-rose-50 flex items-center justify-center">
                                    {currentUser?.profile?.avatar_url ? (
                                        <img src={avatarUrl} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 leading-tight">{companyName}</h3>
                                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        <span>{locationName}</span>
                                    </div>
                                    <div className="flex items-center gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        ))}
                                        <span className="text-xs font-medium ml-1 text-slate-700">5.0</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>

            <StepUp2FAModal
                open={isStepUpOpen}
                onOpenChange={setIsStepUpOpen}
                onSuccess={() => navigate("/client")}
            />
        </section>
    );
}
