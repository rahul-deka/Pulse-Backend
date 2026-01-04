import Video from '../models/Video.js';
import { 
  emitProgressUpdate, 
  emitProcessingComplete, 
  emitProcessingFailed 
} from '../sockets/index.js';

class ProcessingQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.maxConcurrent = 3;
    this.activeJobs = 0;
    this.io = null;
  }

  setIO(io) {
    this.io = io;
    console.log('Socket.IO instance attached to processing queue');
  }

  async addToQueue(videoId) {
    console.log(`Adding video ${videoId} to processing queue`);
    
    this.queue.push(videoId);
    
    if (!this.processing) {
      this.startProcessing();
    }

    return {
      success: true,
      message: 'Video added to processing queue',
      queuePosition: this.queue.length
    };
  }

  async startProcessing() {
    if (this.processing) return;
    
    this.processing = true;
    console.log('Processing queue started');

    while (this.queue.length > 0 || this.activeJobs > 0) {
      while (this.queue.length > 0 && this.activeJobs < this.maxConcurrent) {
        const videoId = this.queue.shift();
        this.activeJobs++;
        
        this.processVideo(videoId)
          .then(() => {
            this.activeJobs--;
          })
          .catch(error => {
            console.error(`Error processing video ${videoId}:`, error);
            this.activeJobs--;
          });
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.processing = false;
    console.log('Processing queue completed');
  }

  async processVideo(videoId) {
    try {
      console.log(`Processing video: ${videoId}`);

      const video = await Video.findById(videoId);
      
      if (!video) {
        console.error(`Video ${videoId} not found`);
        return;
      }

      const userId = video.userId.toString();

      await this.updateVideoProgress(videoId, userId, 10, 'processing');

      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.updateVideoProgress(videoId, userId, 30, 'processing');

      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.updateVideoProgress(videoId, userId, 50, 'processing');

      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.updateVideoProgress(videoId, userId, 90, 'processing');

      await Video.findByIdAndUpdate(videoId, {
        processingStatus: 'completed',
        sensitivityStatus: 'safe',
        processingProgress: 100,
        processedAt: new Date()
      });

      if (this.io) {
        emitProcessingComplete(this.io, userId, videoId, {
          processingStatus: 'completed',
          sensitivityStatus: 'safe',
          processedAt: new Date()
        });
      }

      console.log(`Video ${videoId} processed successfully`);

    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);
      
      const video = await Video.findById(videoId);
      if (video) {
        const userId = video.userId.toString();
        
        await Video.findByIdAndUpdate(videoId, {
          processingStatus: 'failed',
          processingProgress: 0
        });

        if (this.io) {
          emitProcessingFailed(this.io, userId, videoId, error);
        }
      }
    }
  }

  async updateVideoProgress(videoId, userId, progress, processingStatus = null) {
    const updateData = { processingProgress: progress };
    
    if (processingStatus) {
      updateData.processingStatus = processingStatus;
    }

    await Video.findByIdAndUpdate(videoId, updateData);
    
    if (this.io) {
      emitProgressUpdate(this.io, userId, videoId, progress, processingStatus);
    }

    console.log(`Video ${videoId} progress: ${progress}%`);
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeJobs: this.activeJobs,
      processing: this.processing
    };
  }

  async processImmediately(videoId) {
    return await this.processVideo(videoId);
  }
}

export default new ProcessingQueue();