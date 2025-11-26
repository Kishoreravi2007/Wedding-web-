import PremiumCheckout from "./pages/premium/PremiumCheckout";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion, Easing } from "framer-motion";
import { useTranslation } from "react-i18next";
import MusicPlayer from "./components/MusicPlayer";
import { WebsiteProvider } from "./contexts/WebsiteContext";
import { useMusicPlayer } from "./contexts/MusicPlayerContext";
import { useState, useMemo, useEffect } from "react";
import { Button } from "./components/ui/button";
import { X, Music, MessageSquare } from "lucide-react";
import CountdownTimer from "./components/CountdownTimer";
import LanguageSwitcher from './LanguageSwitcher';
import { useLocation } from "react-router-dom";

import Index from "./pages/Index";
import LoginPage from "./pages/login/page";
import NotFound from "./pages/NotFound";

import ParvathyLayout from "./pages/sister-a/Layout";
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
import CompanyLanding from "./pages/company/LandingMinimal";
import CompanyLogin from "./pages/company/Login";
import CompanySignup from "./pages/company/Signup";
import CompanyAccount from "./pages/company/Account";
import CompanyForgotPassword from "./pages/company/ForgotPassword";
import CompanyAbout from "./pages/company/About";
import CompanyServices from "./pages/company/Services";
import CompanyPricing from "./pages/company/Pricing";
import CompanyPortfolio from "./pages/company/Portfolio";
import CompanyContact from "./pages/company/Contact";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminContactMessages from "./pages/admin/ContactMessages";
import AdminFeedback from "./pages/admin/Feedback";
import AdminCallSchedules from "./pages/admin/CallSchedules";
import AdminSettings from "./pages/admin/Settings";

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

  const initialMusicTrack = useMemo(() => {
    if (location.pathname.startsWith('/sreedevi')) {
      return 1; // Index for 'another-song.mp3'
    }
    return 0; // Default to 'wedding-music.mp3'
  }, [location.pathname]);

  // Check if current route has bottom navigation
  const hasBottomNav = useMemo(() => {
    return location.pathname.startsWith('/parvathy') || location.pathname.startsWith('/sreedevi');
  }, [location.pathname]);

  // Check if Book button should be shown (only on homepage and schedule pages)
  const showBookButton = useMemo(() => {
    return location.pathname === '/' || 
           location.pathname === '/parvathy' || 
           location.pathname === '/parvathy/schedule' ||
           location.pathname === '/sreedevi' ||
           location.pathname === '/sreedevi/schedule';
  }, [location.pathname]);

  // Check if on company pages (hide music player on company pages)
  const isCompanyPage = useMemo(() => {
    return location.pathname.startsWith('/company');
  }, [location.pathname]);

  // Pause music when on company pages
  useEffect(() => {
    if (isCompanyPage && isPlaying) {
      togglePlay(); // Pause the music
    }
  }, [isCompanyPage]); // Only depend on isCompanyPage, not isPlaying or togglePlay to avoid loops

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
      <WebsiteProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {/* LanguageSwitcher disabled - Malayalam removed */}
          {/* <LanguageSwitcher /> */}
          {/* Company Book Button - Bottom Right Corner - Only on homepage and schedule pages */}
          {showBookButton && (
            <Link to="/company" className={`fixed right-4 z-[45] transition-all ${hasBottomNav ? 'bottom-20' : 'bottom-4'}`}>
              <Button 
                size="lg"
                className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                Book
              </Button>
            </Link>
          )}
          {/* Music Player Toggle - Hidden on company pages and feedback page */}
          {!isCompanyPage && location.pathname !== '/feedback' && (
            <Button
              variant="outline"
              size="icon"
              className={`fixed left-4 z-50 rounded-full w-10 h-10 transition-all ${hasBottomNav ? 'bottom-[4.5rem]' : 'bottom-4'}`}
              onClick={() => setShowMusicPlayer(!showMusicPlayer)}
            >
              {showMusicPlayer ? <X className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            </Button>
          )}
          {/* Music Player - Hidden on company pages */}
          {!isCompanyPage && showMusicPlayer && <MusicPlayer />}
          
          {/* Feedback Button - Available on all pages except feedback page itself */}
          {location.pathname !== '/feedback' && (
            <Link to="/feedback" className={`fixed right-4 z-[45] transition-all duration-500 ${hasBottomNav ? 'bottom-32' : isCompanyPage ? 'bottom-20' : 'bottom-20'}`}>
              <Button 
                className={`bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 rounded-full ${
                  feedbackCompact ? 'w-12 h-12 p-0' : 'px-5 py-3'
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
            {/* Company Routes */}
            <Route path="/company/login" element={<CompanyLogin />} />
            <Route path="/company/signup" element={<CompanySignup />} />
            <Route path="/company/forgot-password" element={<CompanyForgotPassword />} />
            <Route path="/company/account" element={<CompanyAccount />} />
            <Route path="/company" element={<CompanyLanding />} />
              <Route path="/company/about" element={<CompanyAbout />} />
              <Route path="/company/services" element={<CompanyServices />} />
              <Route path="/company/pricing" element={<CompanyPricing />} />
              <Route path="/company/portfolio" element={<CompanyPortfolio />} />
              <Route path="/company/contact" element={<CompanyContact />} />
              
              {/* Company Route Redirects - Short URLs */}
              <Route path="/about" element={<Navigate to="/company/about" replace />} />
              <Route path="/services" element={<Navigate to="/company/services" replace />} />
              <Route path="/pricing" element={<Navigate to="/company/pricing" replace />} />
              <Route path="/portfolio" element={<Navigate to="/company/portfolio" replace />} />
              <Route path="/contact" element={<Navigate to="/company/contact" replace />} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
              <Route path="/admin/feedback" element={<AdminFeedback />} />
              <Route path="/admin/call-schedules" element={<AdminCallSchedules />} />
              <Route path="/admin/settings" element={<AdminSettings />} />

              {/* Public Routes */}
              <Route path="/countdown" element={
                <div className="text-center p-8">
                  <h1 className="text-4xl font-bold mb-4">{t('weddingCountdown')}</h1>
                  <div className="mb-8">
                    <h2 className="text-2xl">{t('sister1Muhurtham')}</h2>
                    <CountdownTimer targetDate={'2024-08-04T10:00:00'} gradient="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl">{t('sister2Muhurtham')}</h2>
                    <CountdownTimer targetDate={'2024-08-05T11:00:00'} gradient="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500" />
                  </div>
                </div>
              } />
              <Route path="/" element={<Index />} />
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
              <Route path="/photographer" element={<PhotographerDashboard />} />
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
    </QueryClientProvider>
  );
};

export default App;
