/**
 * WebSocket Server for Live Photo Sync
 * 
 * Emits real-time updates when new photos are uploaded via live sync.
 * Clients can subscribe to specific events to receive photo updates.
 */

const { Server } = require('socket.io');
const { supabase } = require('./lib/supabase');

/**
 * Initialize WebSocket server
 * @param {http.Server} httpServer - HTTP server instance
 * @returns {Server} Socket.IO server instance
 */
function initializeWebSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'https://weddingweb.co.in',
        'https://www.weddingweb.co.in',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Store active subscriptions
  const subscriptions = new Map(); // eventId -> Set of socket IDs

  io.on('connection', (socket) => {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    /**
     * Subscribe to live photo updates for a specific event
     * @param {string} eventId - Event/wedding ID
     */
    socket.on('subscribe:event', async (eventId) => {
      if (!eventId) {
        socket.emit('error', { message: 'eventId is required' });
        return;
      }

      // Join room for this event
      socket.join(`event:${eventId}`);
      
      if (!subscriptions.has(eventId)) {
        subscriptions.set(eventId, new Set());
      }
      subscriptions.get(eventId).add(socket.id);

      console.log(`📡 Socket ${socket.id} subscribed to event: ${eventId}`);
      
      socket.emit('subscribed', { eventId });
    });

    /**
     * Subscribe to live photo updates for a sister (backwards compatibility)
     * @param {string} sister - 'sister-a' or 'sister-b'
     */
    socket.on('subscribe:sister', async (sister) => {
      if (!['sister-a', 'sister-b'].includes(sister)) {
        socket.emit('error', { message: 'Invalid sister identifier' });
        return;
      }

      socket.join(`sister:${sister}`);
      console.log(`📡 Socket ${socket.id} subscribed to sister: ${sister}`);
      
      socket.emit('subscribed', { sister });
    });

    /**
     * Unsubscribe from event updates
     */
    socket.on('unsubscribe:event', (eventId) => {
      socket.leave(`event:${eventId}`);
      if (subscriptions.has(eventId)) {
        subscriptions.get(eventId).delete(socket.id);
        if (subscriptions.get(eventId).size === 0) {
          subscriptions.delete(eventId);
        }
      }
      console.log(`📡 Socket ${socket.id} unsubscribed from event: ${eventId}`);
    });

    /**
     * Unsubscribe from sister updates
     */
    socket.on('unsubscribe:sister', (sister) => {
      socket.leave(`sister:${sister}`);
      console.log(`📡 Socket ${socket.id} unsubscribed from sister: ${sister}`);
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`🔌 WebSocket client disconnected: ${socket.id}`);
      
      // Clean up subscriptions
      for (const [eventId, socketIds] of subscriptions.entries()) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          subscriptions.delete(eventId);
        }
      }
    });

    /**
     * Ping/pong for connection health
     */
    socket.on('ping', () => {
      socket.emit('pong');
    });
  });

  // Set up Supabase Realtime subscription for new photos
  // This listens for database changes and emits WebSocket events
  const photosChannel = supabase
    .channel('live-photos')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'photos',
        filter: 'is_live_sync=eq.true'
      },
      (payload) => {
        const photo = payload.new;
        console.log(`📸 New live photo detected: ${photo.id}`);

        // Emit to event-specific room
        if (photo.event_id) {
          io.to(`event:${photo.event_id}`).emit('newPhoto', {
            photo: {
              id: photo.id,
              public_url: photo.public_url,
              filename: photo.filename,
              title: photo.title,
              uploaded_at: photo.uploaded_at || photo.created_at,
              sync_timestamp: photo.sync_timestamp
            },
            eventId: photo.event_id
          });
        }

        // Emit to sister-specific room (for backwards compatibility)
        if (photo.sister) {
          io.to(`sister:${photo.sister}`).emit('newPhoto', {
            photo: {
              id: photo.id,
              public_url: photo.public_url,
              filename: photo.filename,
              title: photo.title,
              uploaded_at: photo.uploaded_at || photo.created_at,
              sync_timestamp: photo.sync_timestamp
            },
            sister: photo.sister
          });
        }
      }
    )
    .subscribe();

  console.log('✅ WebSocket server initialized with Supabase Realtime subscription');

  return io;
}

/**
 * Emit a new photo event manually (for cases where Realtime doesn't catch it)
 * @param {Server} io - Socket.IO server instance
 * @param {Object} photoData - Photo data to emit
 */
function emitNewPhoto(io, photoData) {
  if (!io) return;

  const { photo, eventId, sister } = photoData;

  if (eventId) {
    io.to(`event:${eventId}`).emit('newPhoto', {
      photo,
      eventId
    });
  }

  if (sister) {
    io.to(`sister:${sister}`).emit('newPhoto', {
      photo,
      sister
    });
  }
}

module.exports = {
  initializeWebSocketServer,
  emitNewPhoto
};

