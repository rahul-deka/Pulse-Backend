import Video from '../models/Video.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { deleteFile } from '../utils/fileHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const moveFileToStorage = async (tempPath, filename) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const finalPath = path.join(uploadsDir, filename);
  
  if (tempPath.includes('uploads')) {
    return path.relative(path.join(__dirname, '..'), tempPath);
  }
  
  fs.renameSync(tempPath, finalPath);
  
  return `uploads/${filename}`;
};

export const createVideo = async (userId, videoData, file) => {
  try {
    console.log('Creating video with:', { userId, videoData, file });
    
    const filePath = `uploads/temp/${file.filename}`;

    const video = await Video.create({
      userId,
      title: videoData.title || file.originalname,
      filename: file.filename,
      filePath: filePath,
      size: file.size,
      duration: 0,
      mimeType: file.mimetype,
      processingStatus: 'pending',
      uploadedAt: new Date()
    });

    console.log('Video created:', video);
    
    const processingQueue = (await import('./processingQueue.js')).default;
    processingQueue.addToQueue(video._id.toString());

    return video;
  } catch (error) {
    console.error('Error creating video:', error);
    try {
      if (file && file.path) {
        await deleteFile(file.path);
      }
    } catch (deleteError) {
      console.error('Error deleting file after failed upload:', deleteError);
    }
    throw error;
  }
};

export const getUserVideos = async (userId, filters = {}) => {
  try {
    const query = { userId, ...filters };
    const videos = await Video.find(query).sort({ uploadedAt: -1 });
    return videos;
  } catch (error) {
    console.error('Error getting user videos:', error);
    throw error;
  }
};

export const getVideoById = async (videoId, userId, userRole) => {
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    if (video.userId.toString() !== userId.toString() && userRole !== 'admin') {
      throw new Error('Access denied to this video');
    }
    
    return video;
  } catch (error) {
    console.error('Error getting video by ID:', error);
    throw error;
  }
};

export const updateVideoStatus = async (videoId, status, additionalData = {}) => {
  try {
    const updateData = { 
      processingStatus: status,
      ...additionalData
    };

    if (status === 'completed') {
      updateData.processedAt = new Date();
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      updateData,
      { new: true }
    );
    
    if (!video) {
      throw new Error('Video not found');
    }

    return video;
  } catch (error) {
    console.error('Error updating video status:', error);
    throw error;
  }
};

export const updateVideo = async (videoId, userId, userRole, updates) => {
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    if (video.userId.toString() !== userId && userRole !== 'admin') {
      throw new Error('Access denied to update this video');
    }

    const allowedUpdates = ['title'];
    const filteredUpdates = {};
    
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      filteredUpdates,
      { new: true }
    );

    return updatedVideo;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
};

export const deleteVideo = async (videoId, userId, userRole) => {
  try {
    const video = await Video.findById(videoId);
    
    if (!video) {
      throw new Error('Video not found');
    }

    if (video.userId.toString() !== userId && userRole !== 'admin') {
      throw new Error('Access denied to delete this video');
    }

    try {
      const filePath = path.join(__dirname, '..', video.filePath);
      await deleteFile(filePath);
    } catch (error) {
      console.error('Error deleting video file:', error);
    }

    await Video.findByIdAndDelete(videoId);
    
    return video;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};