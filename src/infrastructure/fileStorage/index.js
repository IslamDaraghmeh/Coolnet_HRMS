const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const { v4: uuidv4 } = require("uuid");

/**
 * File Storage Infrastructure
 * Handles file uploads and storage
 */
class FileStorageService {
  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || "uploads";
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB
    this.allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
  }

  /**
   * Configure multer storage
   * @returns {Object} Multer storage configuration
   */
  getStorage() {
    return multer.diskStorage({
      destination: async (req, file, cb) => {
        const uploadPath = path.join(process.cwd(), this.uploadDir);

        try {
          await fs.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        } catch (error) {
          cb(error);
        }
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(
          file.originalname
        )}`;
        cb(null, uniqueName);
      },
    });
  }

  /**
   * File filter function
   * @param {Object} req - Express request object
   * @param {Object} file - Uploaded file object
   * @param {Function} cb - Callback function
   */
  fileFilter(req, file, cb) {
    if (this.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }

  /**
   * Get multer configuration
   * @param {Object} options - Configuration options
   * @returns {Object} Multer instance
   */
  getMulterConfig(options = {}) {
    const config = {
      storage: this.getStorage(),
      fileFilter: this.fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: options.maxFiles || 1,
      },
    };

    return multer(config);
  }

  /**
   * Upload single file
   * @param {string} fieldName - Form field name
   * @returns {Function} Multer middleware
   */
  uploadSingle(fieldName = "file") {
    return this.getMulterConfig().single(fieldName);
  }

  /**
   * Upload multiple files
   * @param {string} fieldName - Form field name
   * @param {number} maxFiles - Maximum number of files
   * @returns {Function} Multer middleware
   */
  uploadMultiple(fieldName = "files", maxFiles = 5) {
    return this.getMulterConfig({ maxFiles }).array(fieldName, maxFiles);
  }

  /**
   * Upload multiple files with different field names
   * @param {Array} fields - Array of field configurations
   * @returns {Function} Multer middleware
   */
  uploadFields(fields = []) {
    return this.getMulterConfig().fields(fields);
  }

  /**
   * Delete file
   * @param {string} filename - File name to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteFile(filename) {
    try {
      const filePath = path.join(process.cwd(), this.uploadDir, filename);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Get file info
   * @param {string} filename - File name
   * @returns {Promise<Object>} File information
   */
  async getFileInfo(filename) {
    try {
      const filePath = path.join(process.cwd(), this.uploadDir, filename);
      const stats = await fs.stat(filePath);

      return {
        filename,
        path: filePath,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true,
      };
    } catch (error) {
      return {
        filename,
        exists: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate file
   * @param {Object} file - File object
   * @returns {Object} Validation result
   */
  validateFile(file) {
    const errors = [];

    if (!file) {
      errors.push("No file uploaded");
      return { isValid: false, errors };
    }

    if (file.size > this.maxFileSize) {
      errors.push(
        `File size exceeds maximum limit of ${
          this.maxFileSize / (1024 * 1024)
        }MB`
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate file URL
   * @param {string} filename - File name
   * @returns {string} File URL
   */
  getFileUrl(filename) {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return `${baseUrl}/uploads/${filename}`;
  }
}

// Create singleton instance
const fileStorageService = new FileStorageService();

module.exports = fileStorageService;
