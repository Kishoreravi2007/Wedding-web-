/**
 * Live Sync WebSocket Hook
 * 
 * Manages WebSocket connection for real-time photo updates
 * Enhanced with face embedding support for live photo matching
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

interface UseLiveSyncOptions {
  eventId?: string;
  sister?: 'sister-a' | 'sister-b';
  enabled?: boolean;
  faceEmbedding?: number[] | null;
  onNewMatchingPhoto?: (photo: NewPhotoEvent['photo'], matchScore: number) => void;
}

interface NewPhotoEvent {
  photo: {
    id: string;
    public_url: string;
    filename: string;
    title?: string;
    uploaded_at?: string;
    sync_timestamp?: string;
    face_embeddings?: number[][];  // Face embeddings in the photo
  };
  eventId?: string;
  sister?: string;
}

/**
 * Check if a photo matches the user's face embedding via backend API
 */
async function checkPhotoForFace(
  photoId: string,
  userEmbedding: number[],
  weddingName: string
): Promise<{ matches: boolean; score: number }> {
  try {
    const formData = new FormData();
    formData.append('wedding_name', weddingName);
    formData.append('face_descriptor', JSON.stringify(userEmbedding));
    formData.append('photo_id', photoId);

    const response = await fetch(`${API_BASE_URL}/api/photos/check-face-match`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      console.warn('Face match check failed:', response.status);
      return { matches: false, score: 0 };
    }

    const result = await response.json();
    return {
      matches: result.matches || false,
      score: result.similarity || 0
    };
  } catch (error) {
    console.error('Error checking photo for face:', error);
    return { matches: false, score: 0 };
  }
}

export function useLiveSync(options: UseLiveSyncOptions = {}) {
  const {
    eventId,
    sister,
    enabled = true,
    faceEmbedding = null,
    onNewMatchingPhoto
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newPhotos, setNewPhotos] = useState<NewPhotoEvent[]>([]);
  const [matchingPhotos, setMatchingPhotos] = useState<NewPhotoEvent['photo'][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingPhoto, setIsCheckingPhoto] = useState(false);

  // Store the latest face embedding in a ref for use in callbacks
  const faceEmbeddingRef = useRef<number[] | null>(faceEmbedding);
  useEffect(() => {
    faceEmbeddingRef.current = faceEmbedding;
  }, [faceEmbedding]);

  // Get WebSocket URL from API base URL
  const getWebSocketUrl = () => {
    const url = new URL(API_BASE_URL);
    return url.origin;
  };

  // Handle new photo with face matching
  const handleNewPhoto = useCallback(async (data: NewPhotoEvent) => {
    console.log('📸 New photo received:', data);
    setNewPhotos((prev) => [data, ...prev]);

    // If we have a face embedding, check if the new photo matches
    const embedding = faceEmbeddingRef.current;
    if (embedding && embedding.length > 0 && (eventId || sister)) {
      setIsCheckingPhoto(true);

      try {
        const weddingName = sister || eventId || '';
        const result = await checkPhotoForFace(data.photo.id, embedding, weddingName);

        if (result.matches) {
          console.log(`✅ New photo matches user's face! Score: ${result.score}`);
          setMatchingPhotos((prev) => [data.photo, ...prev]);

          // Call the callback if provided
          if (onNewMatchingPhoto) {
            onNewMatchingPhoto(data.photo, result.score);
          }
        }
      } catch (error) {
        console.error('Error checking new photo for face:', error);
      } finally {
        setIsCheckingPhoto(false);
      }
    }
  }, [eventId, sister, onNewMatchingPhoto]);

  const connect = useCallback(() => {
    if (!enabled) return;

    const wsUrl = getWebSocketUrl();
    console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

    const socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id);
      setIsConnected(true);
      setError(null);

      // Subscribe to event or sister
      if (eventId) {
        socket.emit('subscribe:event', eventId);
        console.log(`📡 Subscribed to event: ${eventId}`);
      } else if (sister) {
        socket.emit('subscribe:sister', sister);
        console.log(`📡 Subscribed to sister: ${sister}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ WebSocket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on('subscribed', (data) => {
      console.log('✅ Subscribed:', data);
    });

    socket.on('newPhoto', handleNewPhoto);

    socket.on('error', (data: { message: string }) => {
      console.error('❌ WebSocket error:', data);
      setError(data.message);
    });

    socket.on('pong', () => {
      // Health check response
    });

    socketRef.current = socket;
  }, [enabled, eventId, sister, handleNewPhoto]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      if (eventId) {
        socketRef.current.emit('unsubscribe:event', eventId);
      } else if (sister) {
        socketRef.current.emit('unsubscribe:sister', sister);
      }
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, [eventId, sister]);

  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  const clearNewPhotos = useCallback(() => {
    setNewPhotos([]);
  }, []);

  const clearMatchingPhotos = useCallback(() => {
    setMatchingPhotos([]);
  }, []);

  return {
    isConnected,
    newPhotos,
    matchingPhotos,
    matchingPhotoCount: matchingPhotos.length,
    error,
    isCheckingPhoto,
    clearNewPhotos,
    clearMatchingPhotos,
    reconnect: connect,
    disconnect,
  };
}

