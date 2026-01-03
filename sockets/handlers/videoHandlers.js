import Video from '../../models/Video.js';

export const setupVideoHandlers = (io, socket) => {
  const joinUserRoom = () => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    console.log(`User ${socket.user.email} joined room: user:${userId}`);
  };

  const joinVideoRoom = async (videoId) => {
    try {
      const video = await Video.findOne({ 
        _id: videoId, 
        userId: socket.user._id 
      });

      if (!video) {
        socket.emit('error', { message: 'Video not found or access denied' });
        return;
      }

      socket.join(`video:${videoId}`);
      console.log(`User ${socket.user.email} joined video room: ${videoId}`);

      socket.emit('video:status', {
        videoId: video._id,
        title: video.title,
        status: video.status,
        processingProgress: video.processingProgress,
        uploadedAt: video.uploadedAt,
        processedAt: video.processedAt
      });

    } catch (error) {
      console.error('Error joining video room:', error);
      socket.emit('error', { message: 'Failed to join video room' });
    }
  };

  const leaveVideoRoom = (videoId) => {
    socket.leave(`video:${videoId}`);
    console.log(`User ${socket.user.email} left video room: ${videoId}`);
  };

  const getUserVideosStatus = async () => {
    try {
      const videos = await Video.find({ 
        userId: socket.user._id 
      }).select('_id title status processingProgress uploadedAt processedAt').sort({ uploadedAt: -1 });

      socket.emit('videos:list', { 
        videos,
        count: videos.length 
      });
    } catch (error) {
      console.error('Error getting user videos:', error);
      socket.emit('error', { message: 'Failed to fetch videos' });
    }
  };

  const requestVideoStatus = async (videoId) => {
    try {
      const video = await Video.findOne({ 
        _id: videoId, 
        userId: socket.user._id 
      });

      if (!video) {
        socket.emit('error', { message: 'Video not found' });
        return;
      }

      socket.emit('video:status', {
        videoId: video._id,
        title: video.title,
        filename: video.filename,
        size: video.size,
        status: video.status,
        processingProgress: video.processingProgress,
        uploadedAt: video.uploadedAt,
        processedAt: video.processedAt
      });

    } catch (error) {
      console.error('Error fetching video status:', error);
      socket.emit('error', { message: 'Failed to fetch video status' });
    }
  };

  socket.on('video:join', joinVideoRoom);
  socket.on('video:leave', leaveVideoRoom);
  socket.on('videos:getStatus', getUserVideosStatus);
  socket.on('video:requestStatus', requestVideoStatus);

  joinUserRoom();
};