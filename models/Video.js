import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true
  },
  filename: {
    type: String,
    required: [true, 'Filename is required']
  },
  filePath: {
    type: String,
    required: [true, 'File path is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required']
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  sensitivityStatus: {
    type: String,
    enum: ['safe', 'flagged', 'pending'],
    default: 'pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
videoSchema.index({ userId: 1, uploadedAt: -1 });
videoSchema.index({ processingStatus: 1 });

const Video = mongoose.model('Video', videoSchema);

export default Video;