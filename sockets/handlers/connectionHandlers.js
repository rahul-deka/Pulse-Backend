export const setupConnectionHandlers = (io, socket) => {
  socket.on('disconnect', (reason) => {
    console.log(`User ${socket.user.email} disconnected: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`Socket error for user ${socket.user.email}:`, error);
  });

  socket.on('ping', () => {
    socket.emit('pong', { timestamp: Date.now() });
  });

  console.log(`User ${socket.user.email} connected (Socket ID: ${socket.id})`);
  
  socket.emit('connected', {
    message: 'Successfully connected to real-time updates',
    userId: socket.user._id,
    timestamp: new Date()
  });
};