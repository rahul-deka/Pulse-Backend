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
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    trim: true
  },
  filepath: {
    type: String,
    required: [true, 'File path is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  duration: {
    type: Number,
    default: 0,
    min: [0, 'Duration cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['uploading', 'processing', 'safe', 'flagged', 'failed'],
      message: 'Invalid status value'
    },
    default: 'uploading',
    index: true
  },
  processingProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  sensitivityScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true 
});

// Compound index for efficient queries and sorting
videoSchema.index({ userId: 1, status: 1 });
videoSchema.index({ userId: 1, uploadedAt: -1 });

videoSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { userId, ...filters };
  return this.find(query).sort({ uploadedAt: -1 });
};

videoSchema.statics.findByStatus = function(userId, status) {
  return this.find({ userId, status }).sort({ uploadedAt: -1 });
};

videoSchema.methods.updateProgress = async function(progress, status = null) {
  this.processingProgress = progress;
  if (status) {
    this.status = status;
  }
  if (progress === 100 && !this.processedAt) {
    this.processedAt = new Date();
  }
  return await this.save();
};

const Video = mongoose.model('Video', videoSchema);
export default Video;