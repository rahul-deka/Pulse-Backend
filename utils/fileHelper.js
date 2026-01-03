import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const moveFileToStorage = async (tempPath, filename) => {
  const videosDir = path.join(__dirname, '..', 'uploads', 'videos');
  const newPath = path.join(videosDir, filename);

  return new Promise((resolve, reject) => {
    fs.rename(tempPath, newPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(newPath);
      }
    });
  });
};

export const deleteFile = async (filepath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filepath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

export const getFileSize = (filepath) => {
  const stats = fs.statSync(filepath);
  return stats.size;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const cleanupTempFiles = () => {
  const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
  const oneHourAgo = Date.now() - (60 * 60 * 1000);

  fs.readdir(tempDir, (err, files) => {
    if (err) {
      console.error('Error reading temp directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }

        if (stats.mtimeMs < oneHourAgo) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error('Error deleting temp file:', err);
            } else {
              console.log(`Deleted temp file: ${file}`);
            }
          });
        }
      });
    });
  });
};