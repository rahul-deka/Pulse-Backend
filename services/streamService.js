import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import RangeParser from '../utils/rangeParser.js';

const stat = promisify(fs.stat);

class StreamService {
  
   // @param {string} filePath - Path to video file
   // @param {string} rangeHeader - HTTP Range header
   // @returns {Promise<Object>} - Stream configuration object
  static async prepareStream(filePath, rangeHeader) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('Video file not found');
      }

      const stats = await stat(filePath);
      const fileSize = stats.size;

      const range = RangeParser.parse(rangeHeader, fileSize);

      if (rangeHeader && !range) {
        return {
          status: 416,
          headers: {
            'Content-Range': `bytes */${fileSize}`
          },
          stream: null
        };
      }

      if (range) {
        const { start, end, contentLength } = range;
        
        const stream = fs.createReadStream(filePath, {
          start,
          end,
          highWaterMark: RangeParser.getOptimalChunkSize(fileSize)
        });

        return {
          status: 206, 
          headers: {
            'Content-Range': RangeParser.formatContentRange(start, end, fileSize),
            'Accept-Ranges': 'bytes',
            'Content-Length': contentLength,
            'Content-Type': this.getMimeType(filePath)
          },
          stream,
          size: contentLength
        };
      } else {
        const stream = fs.createReadStream(filePath, {
          highWaterMark: RangeParser.getOptimalChunkSize(fileSize)
        });

        return {
          status: 200,
          headers: {
            'Accept-Ranges': 'bytes',
            'Content-Length': fileSize,
            'Content-Type': this.getMimeType(filePath)
          },
          stream,
          size: fileSize
        };
      }
    } catch (error) {
      throw new Error(`Stream preparation failed: ${error.message}`);
    }
  }

   // @param {string} filePath - File path
   // @returns {string} - MIME type
  static getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mkv': 'video/x-matroska'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }
   // @param {string} filePath - Path to video file
   // @returns {Promise<Object>} - Validation result
  static async validateForStreaming(filePath) {
    try {
      const stats = await stat(filePath);
      
      return {
        isValid: true,
        size: stats.size,
        isFile: stats.isFile(),
        mimeType: this.getMimeType(filePath)
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

   // @param {Stream} stream - Readable stream
  static cleanupStream(stream) {
    if (stream && !stream.destroyed) {
      stream.destroy();
    }
  }

   // @param {Stream} stream - Readable stream
   // @param {Response} res - Express response object
  static handleStreamError(stream, res) {
    stream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error streaming video',
          error: error.message
        });
      }
      this.cleanupStream(stream);
    });
  }
}

export default StreamService;