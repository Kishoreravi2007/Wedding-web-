"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode, useCallback } from 'react';

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
  musicSources: { title: string; src: string;}[];
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

interface MusicPlayerProviderProps {
  children: ReactNode;
  initialTrackIndex?: number;
}

export const MusicPlayerProvider: React.FC<MusicPlayerProviderProps> = ({ children, initialTrackIndex = 0 }) => {
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

  const musicSources = [
    { title: 'Wedding Music', src: '/wedding-music.mp3' },
    { title: 'Another Song', src: '/another-song.mp3' },
  ];

  const playCurrentTrack = useCallback(async () => {
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
  }, [hasUserInteracted]);

  useEffect(() => {
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
  }, [hasUserInteracted, playCurrentTrack]);

  useEffect(() => {
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
  }, [hasUserInteracted, playCurrentTrack]);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playCurrentTrack();
    }
  }, [isPlaying, playCurrentTrack]);

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
      if (hasUserInteracted && !isPlaying) {
        playCurrentTrack();
      }
    }
  }, [volume, hasUserInteracted, isPlaying, playCurrentTrack]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
    console.log(`Music file not found for track ${currentTrackIndex + 1}. Please add the music files to the public folder.`);
  }, [currentTrackIndex]);

  const playTrack = useCallback((src: string) => { // Changed to accept src string
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
  }, [musicSources, hasUserInteracted, playCurrentTrack]); // Added musicSources to dependencies

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
