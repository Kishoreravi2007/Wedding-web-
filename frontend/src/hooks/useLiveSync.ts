/**
 * Live Sync WebSocket Hook
 * 
 * Manages WebSocket connection for real-time photo updates
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';

interface UseLiveSyncOptions {
  eventId?: string;
  sister?: 'sister-a' | 'sister-b';
  enabled?: boolean;
}

interface NewPhotoEvent {
  photo: {
    id: string;
    public_url: string;
    filename: string;
    title?: string;
    uploaded_at?: string;
    sync_timestamp?: string;
  };
  eventId?: string;
  sister?: string;
}

export function useLiveSync(options: UseLiveSyncOptions = {}) {
  const { eventId, sister, enabled = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [newPhotos, setNewPhotos] = useState<NewPhotoEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Get WebSocket URL from API base URL
  const getWebSocketUrl = () => {
    const url = new URL(API_BASE_URL);
    return url.origin;
  };

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

    socket.on('newPhoto', (data: NewPhotoEvent) => {
      console.log('📸 New photo received:', data);
      setNewPhotos((prev) => [data, ...prev]);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('❌ WebSocket error:', data);
      setError(data.message);
    });

    socket.on('pong', () => {
      // Health check response
    });

    socketRef.current = socket;
  }, [enabled, eventId, sister]);

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

  return {
    isConnected,
    newPhotos,
    error,
    clearNewPhotos,
    reconnect: connect,
    disconnect,
  };
}

