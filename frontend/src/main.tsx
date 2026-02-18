import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './globals.css'
import './i18n.ts'
import { MusicPlayerProvider } from './contexts/MusicPlayerContext.tsx'; // Import the provider
import AuthProvider from './contexts/AuthContext';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

// Debug helpers for blank screen issues
if (typeof window !== 'undefined') {
  window.onerror = function (message, source, lineno, colno, error) {
    const errorMsg = `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nCol: ${colno}\nStack: ${error?.stack}`;
    console.error('🔴 GLOBAL ERROR:', errorMsg);
    // Only alert in development
    if (import.meta.env.DEV) {
      alert('GLOBAL ERROR DETECTED:\n' + errorMsg.substring(0, 500));
    }
  };

  window.onunhandledrejection = function (event) {
    const errorMsg = `Unhandled Rejection: ${event.reason}`;
    console.error('🔴 UNHANDLED REJECTION:', errorMsg);
    if (import.meta.env.DEV) {
      alert('UNHANDLED REJECTION DETECTED:\n' + errorMsg.substring(0, 500));
    }
  };
}

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
        <AuthProvider>
          <App />
        </AuthProvider>
      </MusicPlayerProvider>
    </React.StrictMode>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);
