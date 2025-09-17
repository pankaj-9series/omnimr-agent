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

export const handleFileUpload = (file: Express.Multer.File, requestId: string): UploadResponse => {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed size of ${MAX_FILE_SIZE} bytes`);
    }

    // Validate file type
    if (!file.mimetype.includes('text/csv') && !file.originalname.endsWith('.csv')) {
      throw new Error('Only CSV files are allowed');
    }

    // Use requestId as part of the filename
    const fileName = `${requestId}_${file.originalname}`;
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

export const getFilePathFromRequestId = (requestId: string): string => {
  // Assuming a simple mapping: requestId_originalFileName.csv
  // This will require knowing the original file name, which is currently not passed around consistently.
  // For now, let's assume the `filePath` returned from upload is what's stored and passed.
  // A more robust solution would involve a server-side map (e.g., Redis, simple JSON file) or a more consistent naming convention.
  // For this exercise, let's modify `validateFilePath` and `readCsvFileContent` to accept requestId and derive the path.

  // For simplicity and given current `uploadFile` returns `filePath`, we'll need to assume `filePath` is passed.
  // This function will need refinement if `requestId` is the ONLY identifier.
  return path.join(UPLOAD_DIR, `${requestId}_*.csv`); // This is a placeholder and needs real filename
};

export const validateFileRequest = (requestId: string): string => {
  // In a real app, this would involve looking up requestId in a database/store
  // to get the actual filePath. For this example, we assume a simple filename pattern.
  const filesInUploadDir = fs.readdirSync(UPLOAD_DIR);
  const matchingFiles = filesInUploadDir.filter(f => f.startsWith(requestId + '_') && f.endsWith('.csv'));

  if (matchingFiles.length === 0) {
    throw new Error(`No CSV file found for request ID: ${requestId}`);
  }
  // Assuming only one file per requestId for simplicity
  return path.join(UPLOAD_DIR, matchingFiles[0]);
};

export const readCsvFileContent = (requestId: string): string => {
  try {
    const filePath = validateFileRequest(requestId);
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    throw new Error(`Error reading CSV file for request ID ${requestId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getSummarizedCsvContent = (requestId: string, numRows: number = 3): string => {
  try {
    const fullCsvContent = readCsvFileContent(requestId);
    const lines = fullCsvContent.trim().split(/\r\n|\n/);
    if (lines.length === 0) {
      return "";
    }

    const headers = lines[0];
    const dataRows = lines.slice(1, numRows + 1);

    return [headers, ...dataRows].join('\n');
  } catch (error) {
    throw new Error(`Error getting summarized CSV content for request ID ${requestId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
