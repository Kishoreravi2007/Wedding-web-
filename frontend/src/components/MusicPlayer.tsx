"use client";

import React, { useRef, useMemo } from 'react'; // Removed unused imports
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, Play, Pause, Music, Rewind, FastForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'; // Import the context hook
import { useLocation } from 'react-router-dom';

interface MusicPlayerProps {
  className?: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ className }) => {
  const {
    isPlaying,
    isMuted,
    volume,
    togglePlay,
    toggleMute,
    setVolume,
    musicSources,
  } = useMusicPlayer();

  const location = useLocation();

  // Check if current route has bottom navigation
  const hasBottomNav = useMemo(() => {
    return location.pathname.startsWith('/parvathy') || location.pathname.startsWith('/sreedevi');
  }, [location.pathname]);

  // Removed local state and audioRef, as they are managed by the provider.

  // Removed toggleMinimize function as it's no longer needed.

  // The MusicPlayer component itself should not render the audio tag directly if the provider handles it.
  // However, the original component structure included it. For now, let's assume the provider
  // renders the audio tag and this component is just the UI controls.
  // If the provider does NOT render the audio tag, we would need to re-add it here,
  // but the context approach usually means the provider manages the audio element.
  // For now, we'll focus on the UI controls.

  return (
    <div
      className={cn(
        `fixed left-4 z-40 bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-stone-200 p-3 animate-fade-in`,
        "hover:shadow-3xl transition-all duration-300 cursor-hover",
        hasBottomNav ? "bottom-40" : "bottom-14",
        className
      )}
      style={{ animationDelay: '1s' }}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Music className="w-5 h-5 text-stone-600" />
          {isPlaying && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          )}
        </div>

        <Button
          onClick={togglePlay}
          size="sm"
          variant="ghost"
          className="w-8 h-8 p-0 rounded-full hover:bg-stone-100 transition-all duration-300 hover:scale-110"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-stone-700" />
          ) : (
            <Play className="w-4 h-4 text-stone-700 ml-0.5" />
          )}
        </Button>

        <Button
          onClick={toggleMute}
          size="sm"
          variant="ghost"
          className="w-8 h-8 p-0 rounded-full hover:bg-stone-100 transition-all duration-300 hover:scale-110"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-stone-700" />
          ) : (
            <Volume2 className="w-4 h-4 text-stone-700" />
          )}
        </Button>
      </div>

    </div>
  );
};

export default MusicPlayer;
