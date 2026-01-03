import { Server } from 'socket.io';
import { socketConfig } from '../config/socket.js';
import { authenticateSocket } from '../middleware/socketAuth.js';
import { setupVideoHandlers } from './handlers/videoHandlers.js';
import { setupConnectionHandlers } from './handlers/connectionHandlers.js';

export const setupSocketIO = (httpServer) => {
  const io = new Server(httpServer, socketConfig);

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    setupConnectionHandlers(io, socket);
    setupVideoHandlers(io, socket);
  });

  console.log('Socket.IO server initialized');

  return io;
};

export const emitVideoUpdate = (io, userId, videoId, data) => {
  io.to(`user:${userId}`).emit('video:update', {
    videoId,
    ...data,
    timestamp: new Date()
  });
};

export const emitProgressUpdate = (io, userId, videoId, progress, status) => {
  io.to(`user:${userId}`).emit('video:progress', {
    videoId,
    progress,
    status,
    timestamp: new Date()
  });
};

export const emitProcessingComplete = (io, userId, videoId, result) => {
  io.to(`user:${userId}`).emit('video:complete', {
    videoId,
    ...result,
    timestamp: new Date()
  });
};

export const emitProcessingFailed = (io, userId, videoId, error) => {
  io.to(`user:${userId}`).emit('video:failed', {
    videoId,
    error: error.message || 'Processing failed',
    timestamp: new Date()
  });
};

export const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};