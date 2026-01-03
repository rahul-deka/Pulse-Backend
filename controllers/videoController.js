import * as videoService from '../services/videoService.js';

// @desc    Upload video
// @route   POST /api/videos/upload
// @access  Private (editor, admin)
export const uploadVideo = async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;

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
    const userId = req.user.id;
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
    const userId = req.user.id;

    const video = await videoService.getVideoById(videoId, userId);

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