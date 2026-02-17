import PremiumCheckout from "./pages/premium/PremiumCheckout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion, Easing } from "framer-motion";
import { useTranslation } from "react-i18next";
import MusicPlayer from "./components/MusicPlayer";
import { WebsiteProvider } from "./contexts/WebsiteContext";
import { ThemeProvider } from "./components/theme-provider";
import { useMusicPlayer } from "./contexts/MusicPlayerContext";
import { useState, useMemo, useEffect } from "react";
import { Button } from "./components/ui/button";
import { X, Music, MessageSquare } from "lucide-react";
import CountdownTimer from "./components/CountdownTimer";
import LanguageSwitcher from './LanguageSwitcher';

import Index from "./pages/Index";
import LoginPage from "./pages/login/page";
import NotFound from "./pages/NotFound";

import ParvathyLayout from "./pages/sister-a/Layout";
import WeddingPage from "./pages/public/WeddingPage";
import ParvathySchedule from "./pages/sister-a/Schedule";
import ParvathyPhotoBooth from "./pages/sister-a/PhotoBooth";
import ParvathyLiveStream from "./pages/sister-a/LiveStream";
import SreedeviLayout from "./pages/sister-b/Layout";
import SreedeviSchedule from "./pages/sister-b/Schedule";
import SreedeviPhotoBooth from "./pages/sister-b/PhotoBooth";
import SreedeviLiveStream from "./pages/sister-b/LiveStream";
import EventInvitation from "./pages/EventInvitation";
import Wishes from "./pages/Wishes";
import PhotoGallery from "./pages/PhotoGallery";
import SreedeviEngagementVideo from "./pages/sister-b/EngagementVideo";

import PhotographerDashboard from "./pages/photographer/Dashboard";
import PhotographerLogin from "./pages/photographer/Login";
import CoupleDashboard from "./pages/couple/Dashboard";
import CoupleLogin from "./pages/couple/Login";
import Feedback from "./pages/Feedback";
import ViewFeedback from "./pages/ViewFeedback";

// Company Pages
// import CompanyLanding from "./pages/company/Landing";
import LandingNew from "./pages/company/LandingNew"; // New Landing Page
import CompanyDashboard from "./pages/company/CompanyDashboard";
import CompanyLogin from "./pages/company/Login";
import CompanySignup from "./pages/company/Signup";
import CompanyAccount from "./pages/company/Account";
import CompanyForgotPassword from "./pages/company/ForgotPassword";
import CompanyResetPassword from "./pages/company/ResetPassword";
import CompanyAbout from "./pages/company/About";
import CompanyServices from "./pages/company/Services";
import CompanyPricing from "./pages/company/Pricing";
import CompanyPortfolio from "./pages/company/Portfolio";
import CompanyContact from "./pages/company/Contact";
import CompanyLegal from "./pages/company/Legal";
import CompanyGuide from "./pages/company/Guide";
import CompanyBookings from "./pages/company/Bookings";
import CompanyPayments from "./pages/company/Payments";
import CompanySettings from "./pages/company/Settings";
import ClientGallery from "./pages/company/ClientGallery";
import ClientGuestList from "./pages/company/ClientGuestList";
import ClientWishes from "./pages/company/ClientWishes";
import CompanyScrollDemo from "./pages/company/ScrollDemo";
import { AuthGuard } from "./components/company/dashboard/AuthGuard";
import { HomeRoute } from "./components/HomeRoute";

// Client Dashboard (Premium Builder)
import ClientDashboard from "./pages/client/ClientDashboard";
import VisualEditor from "./pages/client/VisualEditor";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContactMessages from "./pages/admin/ContactMessages";
import AdminFeedback from "./pages/admin/Feedback";
import AdminCallSchedules from "./pages/admin/CallSchedules";
import AdminSettings from "./pages/admin/Settings";
import { AdminAuthGuard } from "./pages/admin/AuthGuard";

const queryClient = new QueryClient();

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as Easing
    }
  }
};

const App = () => {
  const [showMusicPlayer, setShowMusicPlayer] = useState(true);
  const [feedbackCompact, setFeedbackCompact] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { isPlaying, togglePlay } = useMusicPlayer();

  // Set language attribute on document root
  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  // Admin Subdomain Routing
  const isAdminSubdomain = window.location.hostname.startsWith('admin.');

  // Redirect root to admin dashboard if on admin subdomain
  if (isAdminSubdomain && location.pathname === '/') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Check if current route has bottom navigation
  const hasBottomNav = useMemo(() => {
    return location.pathname.startsWith('/parvathy') || location.pathname.startsWith('/sreedevi');
  }, [location.pathname]);

  // Check if Book button should be shown (only on homepage and schedule pages)
  const showBookButton = useMemo(() => {
    return location.pathname === '/weddings' ||
      location.pathname === '/parvathy' ||
      location.pathname === '/parvathy/schedule' ||
      location.pathname === '/sreedevi' ||
      location.pathname === '/sreedevi/schedule';
  }, [location.pathname]);

  // Check if on company or photographer pages (hide music player)
  const isExcludedPage = useMemo(() => {
    return location.pathname === '/' ||
      location.pathname.startsWith('/company') ||
      location.pathname.startsWith('/client') ||
      location.pathname.startsWith('/photographer') ||
      location.pathname.startsWith('/admin') ||
      location.pathname === '/privacy' ||
      location.pathname === '/terms';
  }, [location.pathname]);

  // Note: Music pause/resume is now handled globally in MusicPlayerContext

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Smooth scroll animation
    });
  }, [location.pathname]);

  // Feedback button animation - shrink to icon only after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeedbackCompact(true);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, [location.pathname]); // Reset on page change

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="wedding-web-theme">
        <WebsiteProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {/* LanguageSwitcher disabled - Malayalam removed */}
            {/* <LanguageSwitcher /> */}
            {/* Company Book Button - Bottom Right Corner - Only on homepage and schedule pages */}
            {showBookButton && (
              <Link to="/" className={`fixed right-4 z-[45] transition-all ${hasBottomNav ? 'bottom-20' : 'bottom-4'}`}>
                <Button
                  size="lg"
                  className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Book
                </Button>
              </Link>
            )}
            {/* Music Player Toggle - Hidden on excluded pages, feedback page, and wedding pages (which have their own player) */}
            {!isExcludedPage && !location.pathname.startsWith('/weddings/') && !location.pathname.startsWith('/w/') && location.pathname !== '/feedback' && (
              <Button
                variant="outline"
                size="icon"
                className={`fixed left-4 z-50 rounded-full w-10 h-10 transition-all ${hasBottomNav ? 'bottom-[4.5rem]' : 'bottom-4'}`}
                onClick={() => setShowMusicPlayer(!showMusicPlayer)}
              >
                {showMusicPlayer ? <X className="w-4 h-4" /> : <Music className="w-4 h-4" />}
              </Button>
            )}
            {/* Music Player - Hidden on excluded pages and wedding pages */}
            {!isExcludedPage && !location.pathname.startsWith('/weddings/') && !location.pathname.startsWith('/w/') && showMusicPlayer && <MusicPlayer />}

            {/* Feedback Button - Available on all pages except feedback page itself */}
            {location.pathname !== '/feedback' && (
              <Link to="/feedback" className={`fixed right-4 z-[45] transition-all duration-500 ${hasBottomNav ? 'bottom-32' : isExcludedPage ? 'bottom-20' : 'bottom-20'}`}>
                <Button
                  className={`bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-full ${feedbackCompact ? 'w-12 h-12 p-0' : 'px-5 py-3'
                    }`}
                  title="Give Feedback"
                  onMouseEnter={() => setFeedbackCompact(false)}
                >
                  <MessageSquare className={`w-5 h-5 transition-all duration-500 ${feedbackCompact ? '' : 'mr-2'}`} />
                  {!feedbackCompact && <span className="transition-opacity duration-500">Feedback</span>}
                </Button>
              </Link>
            )}
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public Wedding Routes (High Priority) */}
                <Route path="/weddings/:slug" element={<WeddingPage />} />
                <Route path="/weddings/:slug/" element={<WeddingPage />} />
                <Route path="/w/:slug" element={<WeddingPage />} />
                <Route path="/w/:slug/" element={<WeddingPage />} />

                {/* Company & Client Hub Routes */}
                <Route path="/company/login" element={<CompanyLogin />} />
                <Route path="/company/signup" element={<CompanySignup />} />
                <Route path="/company/forgot-password" element={<CompanyForgotPassword />} />
                <Route path="/company/reset-password" element={<CompanyResetPassword />} />
                <Route path="/company/account" element={<AuthGuard><CompanyAccount /></AuthGuard>} />
                <Route path="/company" element={<AuthGuard><CompanyDashboard /></AuthGuard>} />
                <Route path="/company/wishes" element={<AuthGuard><ClientWishes /></AuthGuard>} />
                <Route path="/company/guests" element={<AuthGuard><ClientGuestList /></AuthGuard>} />
                <Route path="/company/gallery" element={<AuthGuard><ClientGallery /></AuthGuard>} />

                <Route path="/vendor" element={<AuthGuard><CompanyDashboard /></AuthGuard>} />

                {/* Client Dashboard (Premium Builder) */}
                <Route path="/client/editor" element={<AuthGuard><VisualEditor /></AuthGuard>} />
                <Route path="/client" element={<AuthGuard><ClientDashboard /></AuthGuard>} />
                <Route path="/client/*" element={<AuthGuard><ClientDashboard /></AuthGuard>} />

                <Route path="/about-platform" element={<LandingNew />} />
                <Route path="/privacy" element={<CompanyLegal />} />
                <Route path="/terms" element={<CompanyLegal />} />
                <Route path="/all-weddings" element={<Index />} />
                <Route path="/company/about" element={<CompanyAbout />} />
                <Route path="/company/services" element={<CompanyServices />} />
                <Route path="/company/pricing" element={<CompanyPricing />} />
                <Route path="/company/portfolio" element={<CompanyPortfolio />} />
                <Route path="/company/contact" element={<CompanyContact />} />
                <Route path="/company/bookings" element={<AuthGuard><CompanyBookings /></AuthGuard>} />
                <Route path="/company/payments" element={<AuthGuard><CompanyPayments /></AuthGuard>} />
                <Route path="/company/settings" element={<AuthGuard><CompanySettings /></AuthGuard>} />
                <Route path="/company/guide" element={<CompanyGuide />} />
                <Route path="/company/scroll" element={<CompanyScrollDemo />} />

                {/* Company Route Redirects - Short URLs */}
                <Route path="/about" element={<Navigate to="/company/about" replace />} />
                <Route path="/services" element={<Navigate to="/company/services" replace />} />
                <Route path="/pricing" element={<Navigate to="/company/pricing" replace />} />
                <Route path="/portfolio" element={<Navigate to="/company/portfolio" replace />} />
                <Route path="/contact" element={<Navigate to="/company/contact" replace />} />
                <Route path="/guide" element={<Navigate to="/company/guide" replace />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminAuthGuard><AdminDashboard /></AdminAuthGuard>} />
                <Route path="/admin/contact-messages" element={<AdminAuthGuard><AdminContactMessages /></AdminAuthGuard>} />
                <Route path="/admin/feedback" element={<AdminAuthGuard><AdminFeedback /></AdminAuthGuard>} />
                <Route path="/admin/call-schedules" element={<AdminAuthGuard><AdminCallSchedules /></AdminAuthGuard>} />
                <Route path="/admin/settings" element={<AdminAuthGuard><AdminSettings /></AdminAuthGuard>} />

                {/* Public Routes */}
                <Route path="/countdown" element={
                  <div className="text-center p-8">
                    <h1 className="text-4xl font-bold mb-4">{t('weddingCountdown')}</h1>
                    <div className="mb-8">
                      <h2 className="text-2xl">{t('sister1Muhurtham')}</h2>
                      <CountdownTimer targetDate={'2026-12-25T10:00:00'} gradient="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500" />
                    </div>
                    <div>
                      <h2 className="text-2xl">{t('sister2Muhurtham')}</h2>
                      <CountdownTimer targetDate={'2026-12-31T11:00:00'} gradient="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500" />
                    </div>
                  </div>
                } />
                <Route path="/" element={<HomeRoute />} />
                <Route path="/wishes" element={<Wishes />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/premium" element={<PremiumCheckout />} />

                {/* Wedding Site Routes */}
                <Route path="/parvathy" element={<ParvathyLayout />}>
                  <Route index element={<ParvathySchedule />} />
                  <Route path="schedule" element={<ParvathySchedule />} />
                  <Route path="schedule/:eventId" element={<EventInvitation sister="a" />} />
                  <Route path="photobooth" element={<ParvathyPhotoBooth />} />
                  <Route path="gallery" element={<PhotoGallery sister="a" />} />
                  <Route path="live" element={<ParvathyLiveStream />} />
                </Route>
                <Route path="/sreedevi" element={<SreedeviLayout />}>
                  <Route index element={<SreedeviSchedule />} />
                  <Route path="schedule" element={<SreedeviSchedule />} />
                  <Route path="schedule/:eventId" element={<EventInvitation sister="b" />} />
                  <Route path="photobooth" element={<SreedeviPhotoBooth />} />
                  <Route path="gallery" element={<PhotoGallery sister="b" />} />
                  <Route path="engagement-video" element={<SreedeviEngagementVideo />} />
                  <Route path="live" element={<SreedeviLiveStream />} />
                </Route>

                {/* Portal Routes */}
                <Route path="/photographer-login" element={<PhotographerLogin />} />
                <Route path="/photographer" element={<AuthGuard><PhotographerDashboard /></AuthGuard>} />
                <Route path="/couple-login" element={<CoupleLogin />} />
                <Route path="/couple" element={<CoupleDashboard />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/view-feedback" element={<ViewFeedback />} />

                {/* Not Found Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </TooltipProvider>
        </WebsiteProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
