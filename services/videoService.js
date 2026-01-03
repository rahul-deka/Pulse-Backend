import Video from '../models/Video.js';
import { moveFileToStorage, deleteFile } from '../utils/fileHelper.js';
import path from 'path';

export const createVideo = async (userId, videoData, file) => {
  try {
    const finalPath = await moveFileToStorage(file.path, file.filename);

    const video = await Video.create({
      userId,
      title: videoData.title,
      filename: file.filename,
      filepath: finalPath,
      size: file.size,
      status: 'uploading'
    });

    return video;
  } catch (error) {
    try {
      await deleteFile(file.path);
    } catch (deleteError) {
      console.error('Error deleting file after failed upload:', deleteError);
    }
    throw error;
  }
};

export const getUserVideos = async (userId, filters = {}) => {
  const query = { userId, ...filters };
  const videos = await Video.find(query).sort({ uploadedAt: -1 });
  return videos;
};

export const getVideoById = async (videoId, userId) => {
  const video = await Video.findOne({ _id: videoId, userId });
  
  if (!video) {
    throw new Error('Video not found');
  }
  
  return video;
};

export const updateVideoStatus = async (videoId, status, additionalData = {}) => {
  const video = await Video.findByIdAndUpdate(
    videoId,
    { 
      status,
      ...additionalData,
      ...(status === 'safe' || status === 'flagged' ? { processedAt: new Date() } : {})
    },
    { new: true }
  );
  
  return video;
};

export const deleteVideo = async (videoId, userId) => {
  const video = await Video.findOne({ _id: videoId, userId });
  
  if (!video) {
    throw new Error('Video not found');
  }

  try {
    await deleteFile(video.filepath);
  } catch (error) {
    console.error('Error deleting video file:', error);
  }

  await Video.findByIdAndDelete(videoId);
  
  return video;
};