import express from 'express';
import {
  uploadVideo,
  getMyVideos,
  getVideo,
  deleteVideo,
  updateVideo,
  streamVideo
} from '../controllers/videoController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../config/multer.js';
import { validateVideoUpload, handleMulterError } from '../middleware/uploadValidation.js';
import { 
  validateStreamRequest, 
  validateRangeHeader, 
  logStreamRequest 
} from '../middleware/streamValidation.js';

const router = express.Router();

router.use(protect);

router.post(
  '/upload',
  authorize('editor', 'admin'),
  upload.single('video'),
  handleMulterError,
  validateVideoUpload,
  uploadVideo
);

router.get('/', getMyVideos);

router.route('/:id')
  .get(getVideo)
  .put(authorize('editor', 'admin'), updateVideo)
  .delete(authorize('editor', 'admin'), deleteVideo);

router.get(
  '/:id/stream',
  validateStreamRequest,
  validateRangeHeader,
  logStreamRequest,
  streamVideo
);

export default router;