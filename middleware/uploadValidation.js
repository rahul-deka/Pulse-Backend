import path from 'path';
import multer from 'multer';

export const validateVideoUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload a video file'
    });
  }

  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 500 * 1024 * 1024;
  if (req.file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`
    });
  }

  const { title } = req.body;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Video title is required'
    });
  }

  if (title.length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Title cannot exceed 200 characters'
    });
  }

  next();
};

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field name'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};