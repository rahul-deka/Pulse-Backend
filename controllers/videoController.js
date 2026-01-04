// import Video from '../models/Video.js';
import path from 'path';
// import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import StreamService from '../services/streamService.js';
import * as videoService from '../services/videoService.js'; 
// import { deleteFile } from '../utils/fileHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private (editor, admin)
export const uploadVideo = async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user._id;

    const video = await videoService.createVideo(
      userId,
      { title },
      req.file
    );

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully',
      video: {
        id: video._id,
        title: video.title,
        filename: video.filename,
        size: video.size,
        status: video.status,
        uploadedAt: video.uploadedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all videos for logged in user
// @route   GET /api/videos
// @access  Private
export const getMyVideos = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filters = status ? { status } : {};
    const videos = await videoService.getUserVideos(userId, filters);

    res.status(200).json({
      success: true,
      count: videos.length,
      videos
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
export const getVideo = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const userId = req.user._id.toString();
    const userRole = req.user.role;

    const video = await videoService.getVideoById(videoId, userId, userRole);

    res.status(200).json({
      success: true,
      video
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (editor, admin)
export const deleteVideo = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    await videoService.deleteVideo(videoId, userId);

    res.status(200).json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update video metadata
// @route   PUT /api/videos/:id
// @access  Private (editor, admin)
export const updateVideo = async (req, res, next) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    const { title } = req.body;

    const video = await videoService.getVideoById(videoId, userId);

    if (title) {
      video.title = title;
      await video.save();
    }

    res.status(200).json({
      success: true,
      message: 'Video updated successfully',
      video
    });
  } catch (error) {
    next(error);
  }
};

export const streamVideo = async (req, res, next) => {
  let stream = null;

  try {
    const video = req.video; 
    const rangeHeader = req.headers.range;

    const filePath = path.join(__dirname, '..', video.filePath);

    const validation = await StreamService.validateForStreaming(filePath);
    
    if (!validation.isValid) {
      return res.status(404).json({
        success: false,
        message: 'Video file not available for streaming',
        error: validation.error
      });
    }

    const streamConfig = await StreamService.prepareStream(filePath, rangeHeader);

    if (streamConfig.status === 416) {
      return res.status(416)
        .set(streamConfig.headers)
        .json({
          success: false,
          message: 'Requested range not satisfiable',
          fileSize: validation.size
        });
    }

    res.status(streamConfig.status).set(streamConfig.headers);

    stream = streamConfig.stream;

    StreamService.handleStreamError(stream, res);

    req.on('close', () => {
      console.log('[STREAM] Client disconnected');
      StreamService.cleanupStream(stream);
    });

    stream.pipe(res);

    console.log(`[STREAM] Started: ${video.filename} | Status: ${streamConfig.status} | Size: ${streamConfig.size} bytes`);

  } catch (error) {
    console.error('Streaming error:', error);
    
    if (stream) {
      StreamService.cleanupStream(stream);
    }

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error streaming video',
        error: error.message
      });
    }
  }
};