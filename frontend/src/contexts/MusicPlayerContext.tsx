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
  playTrack: (src: string) => void;
  setWeddingMusic: (data: { url: string | null, source?: 'upload' | 'playlist', playlistUrl?: string | null, volume?: number } | string | null) => void;
  musicSource?: 'upload' | 'playlist';
  playlistUrl?: string | null;
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

  // Check if we're on a company or photographer page (hide/pause music)
  const isExcludedPage = useMemo(() => {
    return location.pathname === '/' ||
      location.pathname.startsWith('/company') ||
      location.pathname.startsWith('/client') ||
      location.pathname.startsWith('/photographer') ||
      location.pathname === '/privacy' ||
      location.pathname === '/terms';
  }, [location.pathname]);

  const [weddingMusicUrl, setWeddingMusicUrl] = useState<string | null>(null);
  const [weddingMusicSource, setWeddingMusicSource] = useState<'upload' | 'playlist'>('upload');
  const [weddingPlaylistUrl, setWeddingPlaylistUrl] = useState<string | null>(null);

  const musicSources = useMemo(() => {
    if (weddingMusicUrl) {
      try {
        if (weddingMusicUrl.startsWith('[')) {
          const urls = JSON.parse(weddingMusicUrl);
          if (Array.isArray(urls)) {
            return urls.map((url, index) => ({ title: `Track ${index + 1}`, src: url }));
          }
        }
      } catch (e) {
        // Fallback to simple string
      }
      return [{ title: 'Our Song', src: weddingMusicUrl }];
    }
    return [];
  }, [weddingMusicUrl]);

  const setWeddingMusic = useCallback((data: { url: string | null, source?: 'upload' | 'playlist', playlistUrl?: string | null, volume?: number } | string | null) => {
    if (typeof data === 'string') {
      // Legacy support
      setWeddingMusicUrl(data);
      setCurrentTrackIndex(0);
    } else if (data) {
      setWeddingMusicUrl(data.url);
      setWeddingMusicSource(data.source || 'upload');
      setWeddingPlaylistUrl(data.playlistUrl || null);
      if (data.volume !== undefined) {
        setVolumeState(data.volume / 100);
        if (audioRef.current) audioRef.current.volume = data.volume / 100;
      }
      if (data.url) setCurrentTrackIndex(0);
    } else {
      setWeddingMusicUrl(null);
    }
  }, []);

  // Sync volume state to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Reload audio when music sources change (e.g. switching to custom track)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (hasUserInteracted && !isExcludedPage) {
        // playCurrentTrack(); // Don't auto-play immediately to avoid conflicts? 
        // Actually we do want to play if user has interacted.
        audioRef.current.play().catch(err => console.log("Autoplay prevented on source change", err));
        setIsPlaying(true);
      }
    }
  }, [musicSources, hasUserInteracted, isExcludedPage]);


  const playCurrentTrack = useCallback(async () => {
    // NEVER play on excluded pages
    if (isExcludedPage) {
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
  }, [hasUserInteracted, isExcludedPage]);

  // Handle music pause/resume based on page navigation
  useEffect(() => {
    if (isExcludedPage) {
      // Navigating TO excluded page - pause music and remember state
      if (isPlaying && audioRef.current) {
        wasPlayingBeforeCompanyPage.current = true;
        audioRef.current.pause();
        setIsPlaying(false);
      }
      // If music wasn't playing, don't change the flag (preserve previous state)
    } else {
      // Navigating AWAY from excluded page - resume if it was playing before
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
  }, [isExcludedPage, isPlaying, hasUserInteracted, playCurrentTrack]);

  useEffect(() => {
    // Don't auto-play on excluded pages
    if (isExcludedPage) {
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
  }, [hasUserInteracted, playCurrentTrack, isExcludedPage]);

  useEffect(() => {
    // Don't auto-play on excluded pages even after user interaction
    if (isExcludedPage) {
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
  }, [hasUserInteracted, playCurrentTrack, isExcludedPage]);

  const togglePlay = useCallback(async () => {
    // Never allow play on excluded pages
    if (isExcludedPage) {
      return;
    }
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playCurrentTrack();
    }
  }, [isPlaying, playCurrentTrack, isExcludedPage]);

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
      // Don't auto-play on excluded pages
      if (hasUserInteracted && !isPlaying && !isExcludedPage) {
        playCurrentTrack();
      }
    }
  }, [volume, hasUserInteracted, isPlaying, playCurrentTrack, isExcludedPage]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    console.log(`Music file not found for track ${currentTrackIndex + 1}. Please add the music files to the public folder.`);
  }, [currentTrackIndex]);

  const playTrack = useCallback((src: string) => { // Changed to accept src string
    // Never allow play on excluded pages
    if (isExcludedPage) {
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
  }, [musicSources, hasUserInteracted, playCurrentTrack, isExcludedPage]); // Added musicSources to dependencies

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
    setWeddingMusic,
    musicSources,
    musicSource: weddingMusicSource,
    playlistUrl: weddingPlaylistUrl
  };

  return (
    <MusicPlayerContext.Provider value={contextValue}>
      <audio
        ref={audioRef}
        preload="auto"
        onLoadedData={handleLoadedData}
        onError={handleError}
        onEnded={goToNextTrack}
      >
        {musicSources.length > 0 && (
          <source src={musicSources[currentTrackIndex]?.src} type="audio/mpeg" />
        )}
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
