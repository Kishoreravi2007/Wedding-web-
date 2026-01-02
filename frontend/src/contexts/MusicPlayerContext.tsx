"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

interface MusicPlayerContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrackIndex: number;
  isLoaded: boolean; // Added
  hasError: boolean; // Added
  hasUserInteracted: boolean; // Added
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  goToNextTrack: () => void;
  goToPrevTrack: () => void;
  playTrack: (src: string) => void; // Changed to accept src string
  musicSources: { title: string; src: string; }[];
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

interface MusicPlayerProviderProps {
  children: ReactNode;
  initialTrackIndex?: number;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children, initialTrackIndex = 0 }) => {
  const location = useLocation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(() => {
    return sessionStorage.getItem('musicUserInteracted') === 'true';
  });
  const [hasError, setHasError] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Track if music was playing before navigating to company page (for resume)
  const wasPlayingBeforeCompanyPage = useRef(false);

  // Check if we're on a company page - reactive to route changes
  const isCompanyPage = useMemo(() => {
    return location.pathname.startsWith('/company');
  }, [location.pathname]);

  const musicSources = [
    { title: 'Wedding Music', src: './wedding-music.mp3' },
    { title: 'Another Song', src: './another-song.mp3' },
  ];

  const playCurrentTrack = useCallback(async () => {
    // NEVER play on company pages
    if (isCompanyPage) {
      return;
    }
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.log('Playback error:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError' && !hasUserInteracted) {
        console.log('Autoplay blocked by browser, waiting for user interaction');
      } else {
        setHasError(true);
      }
    }
  }, [hasUserInteracted, isCompanyPage]);

  // Handle music pause/resume based on company page navigation
  useEffect(() => {
    if (isCompanyPage) {
      // Navigating TO company page - pause music and remember state
      if (isPlaying && audioRef.current) {
        wasPlayingBeforeCompanyPage.current = true;
        audioRef.current.pause();
        setIsPlaying(false);
      }
      // If music wasn't playing, don't change the flag (preserve previous state)
    } else {
      // Navigating AWAY from company page - resume if it was playing before
      if (wasPlayingBeforeCompanyPage.current && audioRef.current) {
        wasPlayingBeforeCompanyPage.current = false;
        // Small delay to ensure audio is ready, then resume
        const resumeTimer = setTimeout(() => {
          if (hasUserInteracted) {
            playCurrentTrack();
          } else {
            // Try to play even without interaction (user clicked a link, which counts as interaction)
            audioRef.current?.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {
              // If autoplay is blocked, wait for next user interaction
            });
          }
        }, 100);
        return () => clearTimeout(resumeTimer);
      }
    }
  }, [isCompanyPage, isPlaying, hasUserInteracted, playCurrentTrack]);

  useEffect(() => {
    // Don't auto-play on company pages
    if (isCompanyPage) {
      return;
    }

    const tryAutoplay = async () => {
      if (audioRef.current) {
        if (hasUserInteracted) {
          playCurrentTrack();
        } else {
          try {
            await audioRef.current.play();
            setIsPlaying(true);
          } catch (error) {
            console.log('Autoplay blocked by browser, waiting for user interaction');
          }
        }
      }
    };

    const timer = setTimeout(tryAutoplay, 100);
    return () => clearTimeout(timer);
  }, [hasUserInteracted, playCurrentTrack, isCompanyPage]);

  useEffect(() => {
    // Don't auto-play on company pages even after user interaction
    if (isCompanyPage) {
      return;
    }

    const handleFirstInteraction = async () => {
      if (!hasUserInteracted && audioRef.current) {
        setHasUserInteracted(true);
        sessionStorage.setItem('musicUserInteracted', 'true');
        playCurrentTrack();
      }
    };

    const events = ['click', 'touchstart', 'keydown'];
    events.forEach(event => {
      document.addEventListener(event, handleFirstInteraction, { once: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFirstInteraction);
      });
    };
  }, [hasUserInteracted, playCurrentTrack, isCompanyPage]);

  const togglePlay = useCallback(async () => {
    // Never allow play on company pages
    if (isCompanyPage) {
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playCurrentTrack();
    }
  }, [isPlaying, playCurrentTrack, isCompanyPage]);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      } else if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
      }
    }
  }, [isMuted]);

  const handleLoadedData = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
    if (audioRef.current) {
      audioRef.current.volume = volume;
      // Don't auto-play on company pages
      if (hasUserInteracted && !isPlaying && !isCompanyPage) {
        playCurrentTrack();
      }
    }
  }, [volume, hasUserInteracted, isPlaying, playCurrentTrack, isCompanyPage]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    console.log(`Music file not found for track ${currentTrackIndex + 1}. Please add the music files to the public folder.`);
  }, [currentTrackIndex]);

  const playTrack = useCallback((src: string) => { // Changed to accept src string
    // Never allow play on company pages
    if (isCompanyPage) {
      return;
    }
    const index = musicSources.findIndex(source => source.src === src);
    if (index === -1) {
      console.error(`Track with source ${src} not found.`);
      return;
    }
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.load();
      if (hasUserInteracted) {
        playCurrentTrack();
      }
    }
  }, [musicSources, hasUserInteracted, playCurrentTrack, isCompanyPage]); // Added musicSources to dependencies

  const goToPrevTrack = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + musicSources.length) % musicSources.length;
    playTrack(musicSources[prevIndex].src); // Changed to pass src
  }, [currentTrackIndex, musicSources, playTrack]); // Added musicSources to dependencies

  const goToNextTrack = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % musicSources.length;
    playTrack(musicSources[nextIndex].src); // Changed to pass src
  }, [currentTrackIndex, musicSources, playTrack]); // Added musicSources to dependencies

  const contextValue = {
    isPlaying,
    isMuted,
    volume,
    currentTrackIndex,
    isLoaded,
    hasError,
    hasUserInteracted,
    togglePlay,
    toggleMute,
    setVolume,
    goToNextTrack,
    goToPrevTrack,
    playTrack,
    musicSources,
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      <audio
        ref={audioRef}
        loop
        preload="auto"
        onLoadedData={handleLoadedData}
        onError={handleError}
      >
        <source src={musicSources[currentTrackIndex].src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};
