# Pulse Backend

Backend API server for Pulse (Assignment) - a video streaming and management platform with real-time processing updates.

## Live Demo

- **Backend API**: [https://pulse-backend-ci7j.onrender.com](https://pulse-backend-ci7j.onrender.com)
- **Frontend**: [https://pulse-streaming.vercel.app](https://pulse-streaming.vercel.app)
- **Health Check**: [https://pulse-backend-ci7j.onrender.com/api/health](https://pulse-backend-ci7j.onrender.com/api/health)

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Secure password hashing with bcrypt

- **Video Management**
  - Video upload with file validation
  - Async video processing queue
  - Video streaming with range request support
  - Video metadata management (title, duration, size)
  - User-specific video library

- **Real-time Updates**
  - WebSocket integration with Socket.IO
  - Live processing status updates
  - Real-time notifications for video completion/failures

- **Admin Features**
  - User management (list, update roles, delete users)
  - Video count tracking per user
  - System health monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Real-time**: Socket.IO
- **Security**: bcryptjs, CORS

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   ├── multer.js            # File upload configuration
│   └── socket.js            # Socket.IO configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── videoController.js   # Video management logic
├── middleware/
│   ├── auth.js              # JWT authentication & authorization
│   ├── errorHandler.js      # Global error handler
│   ├── socketAuth.js        # Socket authentication
│   ├── streamValidation.js  # Video streaming validation
│   └── uploadValidation.js  # File upload validation
├── models/
│   ├── User.js              # User schema
│   └── Video.js             # Video schema
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── videoRoutes.js       # Video routes
├── services/
│   ├── processingQueue.js   # Async video processing
│   ├── streamService.js     # Video streaming service
│   └── videoService.js      # Video business logic
├── sockets/
│   ├── index.js             # Socket.IO setup
│   └── handlers/
│       ├── connectionHandlers.js  # Connection events
│       └── videoHandlers.js       # Video events
├── uploads/
│   ├── temp/                # Temporary upload storage
│   └── videos/              # Processed videos
├── utils/
│   ├── fileHelper.js        # File operations
│   ├── jwt.js               # JWT utilities
│   └── rangeParser.js       # HTTP range parser
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── .gitignore
├── package.json
├── server.js                # Application entry point
└── README.md
```

## API Endpoints

### Authentication
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/profile           Get current user profile
GET    /api/auth/users             Get all users (Admin only)
PUT    /api/auth/users/:id/role    Update user role (Admin only)
DELETE /api/auth/users/:id         Delete user (Admin only)
```

### Videos
```
POST   /api/videos/upload          Upload video
GET    /api/videos                 Get all user videos
GET    /api/videos/:id             Get video by ID
PUT    /api/videos/:id             Update video metadata
DELETE /api/videos/:id             Delete video
GET    /api/videos/:id/stream      Stream video with range support
```

### System
```
GET    /                           API info
GET    /api                        API endpoints list
GET    /api/health                 Health check & system status
```

## WebSocket Events

### Client → Server
```javascript
authenticate(token)              // Authenticate socket connection
video:watch(videoId)             // Join video room
```

### Server → Client
```javascript
video:progress(data)            // Processing progress update
video:complete(videoData)       // Video processing complete
video:failed(error)             // Video processing failed
video:update(videoData)         // Video metadata updated
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/rahul-deka/Pulse-Backend.git
cd Pulse-Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env     # Copy the example env file
```
Edit `.env` with your values

Required environment variables:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pulse
JWT_SECRET=jwt_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

4. **Create upload directories**
```bash
mkdir -p uploads/temp uploads/videos
```

5. **Run the server**

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start at `http://localhost:5000`

## Testing

Visit these endpoints to test:
- API Info: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/api/health`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | Required |
| `JWT_SECRET` | JWT signing secret | Required |
| `FRONTEND_URL` | Frontend URL for CORS | Required |
| `NODE_ENV` | Environment | `development` |

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Role-based authorization
- CORS configuration for specific origins
- File type validation (video files only)
- File size limits
- Token authentication for video streaming (query param support)

## 📦 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables from `.env.example`
6. Deploy

<span style="color: red;">**Note**: Free tier spins down after 15 minutes of inactivity.</span>

### MongoDB Atlas Setup

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (for Render)
4. Get connection string
5. Add to `MONGODB_URI` environment variable

## 🐛 Troubleshooting

### Server won't start
- Check MongoDB connection string
- Verify all required environment variables are set
- Ensure upload directories exist

### CORS errors
- Verify `FRONTEND_URL` matches your frontend exactly
- Check CORS configuration in `server.js`

### Video upload fails
- Check `MAX_FILE_SIZE` setting
- Verify upload directories have write permissions
- Check available disk space

### WebSocket connection fails
- Ensure frontend is using correct backend URL
- Check CORS settings
- Verify JWT token is valid