class RangeParser {
   // @param {string} rangeHeader - The Range header value
   // @param {number} fileSize - Total file size in bytes
   // @returns {Object|null} - Parsed range object or null if invalid
  static parse(rangeHeader, fileSize) {
    if (!rangeHeader) {
      return null;
    }

    const matches = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    
    if (!matches) {
      return null;
    }

    const start = matches[1] ? parseInt(matches[1], 10) : 0;
    const end = matches[2] ? parseInt(matches[2], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      return null;
    }

    return {
      start,
      end,
      contentLength: end - start + 1
    };
  }

   // @param {number} start - Start byte
   // @param {number} end - End byte
   // @param {number} fileSize - Total file size
   // @returns {boolean}
  static isValidRange(start, end, fileSize) {
    return start >= 0 && end < fileSize && start <= end;
  }

   // @param {number} fileSize - Total file size in bytes
   // @returns {number} - Chunk size in bytes
  static getOptimalChunkSize(fileSize) {
    if (fileSize < 10 * 1024 * 1024) {
      return 256 * 1024;
    } else if (fileSize < 100 * 1024 * 1024) {
      return 512 * 1024; 
    } else {
      return 1024 * 1024; 
    }
  }

   // @param {number} start - Start byte
   // @param {number} end - End byte
   // @param {number} fileSize - Total file size
   // @returns {string}
  static formatContentRange(start, end, fileSize) {
    return `bytes ${start}-${end}/${fileSize}`;
  }
}

export default RangeParser;