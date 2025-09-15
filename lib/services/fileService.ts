// lib/services/fileService.ts
import * as fs from 'fs';
import * as path from 'path';
import { UploadResponse } from '../types';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const handleFileUpload = (file: Express.Multer.File): UploadResponse => {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
    }

    // Validate file type
    if (!file.mimetype.includes('text/csv') && !file.originalname.endsWith('.csv')) {
      throw new Error('Only CSV files are allowed');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Save file
    fs.writeFileSync(filePath, file.buffer);

    return {
      success: true,
      filePath: filePath,
      fileName: fileName,
      fileSize: file.size,
      message: 'File uploaded successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const validateFilePath = (filePath: string): boolean => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Check if it's within the upload directory (security check)
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(UPLOAD_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return false;
    }

    // Check if it's a CSV file
    if (!filePath.endsWith('.csv')) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const deleteFile = (filePath: string): boolean => {
  try {
    if (validateFilePath(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const getFileStats = (filePath: string) => {
  try {
    if (!validateFilePath(filePath)) {
      throw new Error('Invalid file path');
    }

    const stats = fs.statSync(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      isFile: stats.isFile()
    };
  } catch (error) {
    throw new Error(`Error getting file stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
