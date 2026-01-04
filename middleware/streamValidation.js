import Video from '../models/Video.js';

export const validateStreamRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid video ID format'
      });
    }

    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    if (video.processingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Video is still processing',
        status: video.processingStatus
      });
    }

    if (video.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this video'
      });
    }

    req.video = video;
    next();
  } catch (error) {
    next(error);
  }
};

export const validateRangeHeader = (req, res, next) => {
  const rangeHeader = req.headers.range;

  if (rangeHeader) {
    if (!rangeHeader.startsWith('bytes=')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Range header format. Must start with "bytes="'
      });
    }

    const rangePattern = /^bytes=(\d*)-(\d*)$/;
    const rangeValue = rangeHeader.substring(6); 

    if (!rangePattern.test(`bytes=${rangeValue}`)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Range header format. Expected format: bytes=start-end'
      });
    }
  }

  next();
};

export const logStreamRequest = (req, res, next) => {
  const { id } = req.params;
  const rangeHeader = req.headers.range || 'full';
  const userAgent = req.headers['user-agent'];

  console.log(`[STREAM] Video: ${id} | Range: ${rangeHeader} | User: ${req.user._id} | UA: ${userAgent}`);

  next();
};