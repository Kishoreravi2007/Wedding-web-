import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, motion, Easing } from "framer-motion";
import { useTranslation } from "react-i18next";
import MusicPlayer from "./components/MusicPlayer";
import { WebsiteProvider } from "./contexts/WebsiteContext";
import { useState, useMemo, useEffect } from "react";
import { Button } from "./components/ui/button";
import { X, Music } from "lucide-react";
import CountdownTimer from "./components/CountdownTimer";
import LanguageSwitcher from './LanguageSwitcher';
import { useLocation } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import ParvathyLayout from "./pages/sister-a/Layout";
import ParvathySchedule from "./pages/sister-a/Schedule";
import ParvathyPhotoBooth from "./pages/sister-a/PhotoBooth";
import SreedeviLayout from "./pages/sister-b/Layout";
import SreedeviSchedule from "./pages/sister-b/Schedule";
import SreedeviPhotoBooth from "./pages/sister-b/PhotoBooth";
import EventInvitation from "./pages/EventInvitation";
import Wishes from "./pages/Wishes";
import PhotoGallery from "./pages/PhotoGallery";
import SreedeviEngagementVideo from "./pages/sister-b/EngagementVideo";
import ParvathyEngagementVideo from "./pages/sister-a/EngagementVideo";

import AdminDashboard from "./pages/admin/Dashboard";
import ComprehensiveAdminDashboard from "./pages/admin/ComprehensiveDashboard";
import AdminLogin from "./pages/admin/Login";
import PhotographerDashboard from "./pages/photographer/Dashboard";
import PhotographerLogin from "./pages/photographer/Login";
import CoupleDashboard from "./pages/couple/Dashboard";
import CoupleLogin from "./pages/couple/Login";
import FaceDetectionAdmin from "./pages/FaceDetectionAdmin";

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
  const { t, i18n } = useTranslation();
  const location = useLocation();

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

  return (
    <QueryClientProvider client={queryClient}>
      <WebsiteProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LanguageSwitcher />
            <Button
              variant="outline"
              size="icon"
              className="fixed bottom-4 right-4 z-50 rounded-full w-10 h-10"
              onClick={() => setShowMusicPlayer(!showMusicPlayer)}
            >
              {showMusicPlayer ? <X className="w-4 h-4" /> : <Music className="w-4 h-4" />}
            </Button>
            {showMusicPlayer && <MusicPlayer />}
            <AnimatePresence mode="wait">
              <Routes>
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

              {/* Wedding Site Routes */}
              <Route path="/parvathy" element={<ParvathyLayout />}>
                <Route index element={<ParvathySchedule />} />
                <Route path="schedule" element={<ParvathySchedule />} />
                <Route path="schedule/:eventId" element={<EventInvitation sister="a" />} />
                <Route path="photobooth" element={<ParvathyPhotoBooth />} />
                <Route path="gallery" element={<PhotoGallery sister="a" />} />
                {/* This seems like a mistake, should probably be a Parvathy video component */}
                <Route path="engagement-video" element={<ParvathyEngagementVideo />} /> 
              </Route>
              <Route path="/sreedevi" element={<SreedeviLayout />}>
                <Route index element={<SreedeviSchedule />} />
                <Route path="schedule" element={<SreedeviSchedule />} />
                <Route path="schedule/:eventId" element={<EventInvitation sister="b" />} />
                <Route path="photobooth" element={<SreedeviPhotoBooth />} />
                <Route path="gallery" element={<PhotoGallery sister="b" />} />
                <Route path="engagement-video" element={<SreedeviEngagementVideo />} />
              </Route>

              {/* Portal Routes */}
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<ComprehensiveAdminDashboard />} />
              <Route path="/photographer-login" element={<PhotographerLogin />} />
              <Route path="/photographer" element={<PhotographerDashboard />} />
              <Route path="/couple-login" element={<CoupleLogin />} />
              <Route path="/couple" element={<CoupleDashboard />} />
              <Route path="/face-admin" element={<FaceDetectionAdmin />} />

              {/* Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        <motion.footer 
          className="text-center p-4 mt-8 text-stone-500 text-sm support-text"
          variants={itemVariants}
        >
          <a href="mailto:help.weddingweb@gmail.com" className="underline hover:text-stone-700">help.weddingweb@gmail.com</a>
        </motion.footer>
        </TooltipProvider>
      </WebsiteProvider>
    </QueryClientProvider>
  );
};

export default App;
