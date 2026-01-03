import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import mongoose from 'mongoose';
import connectDB from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';
import { cleanupTempFiles } from './utils/fileHelper.js';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupSocketIO } from './sockets/index.js';
import processingQueue from './services/processingQueue.js';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

const io = setupSocketIO(httpServer);

processingQueue.setIO(io);

app.set('io', io);

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-upload.html'));
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Pulse Assignment',
    version: '1.0.0',
    features: {
      authentication: true,
      videoUpload: true,
      realTimeUpdates: true,
      processing: true
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Pulse Assignment API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      videos: '/api/videos',
      health: '/api/health'
    },
    websocket: {
      url: `ws://localhost:${process.env.PORT || 5000}`,
      events: [
        'video:progress',
        'video:complete',
        'video:failed',
        'video:update'
      ]
    }
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    socketIO: io ? 'active' : 'inactive',
    processingQueue: processingQueue.getQueueStatus()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running at: http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  
  cleanupTempFiles();
  setInterval(cleanupTempFiles, 60 * 60 * 1000);
});