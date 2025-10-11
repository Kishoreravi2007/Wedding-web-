import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'
import './i18n.ts'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext.tsx'; // Import the provider
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const Root = () => {
  const location = useLocation();

  const initialMusicTrack = useMemo(() => {
    if (location.pathname.startsWith('/sreedevi')) {
      return 1; // Index for 'another-song.mp3'
    }
    return 0; // Default to 'wedding-music.mp3'
  }, [location.pathname]);

  return (
    <React.StrictMode>
      <MusicPlayerProvider initialTrackIndex={initialMusicTrack}>
        <App />
      </MusicPlayerProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);
