// app/api/csv/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleFileUpload } from '@/lib/services/fileService';
import { ApiError, UploadResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File; // Changed from csvFile to file
    const requestId = formData.get('request_id') as string;

    if (!file) {
      return NextResponse.json({
        error: "No file uploaded",
        message: "Please upload a CSV file",
        example: "Use form-data with key 'file' and select a .csv file"
      } as ApiError, { status: 400 });
    }

    if (!requestId) {
      return NextResponse.json({
        error: "No request ID provided",
        message: "A request ID is required for file upload",
      } as ApiError, { status: 400 });
    }

    // Convert File to Express.Multer.File-like object
    const buffer = Buffer.from(await file.arrayBuffer());
    const multerFile = {
      fieldname: 'file',
      originalname: file.name,
      encoding: '7bit',
      mimetype: file.type,
      size: file.size,
      buffer: buffer
    } as Express.Multer.File;

    const response = handleFileUpload(multerFile, requestId); // Pass requestId
    return NextResponse.json(response);
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({
      error: "File upload failed",
      message: error instanceof Error ? error.message : "Unknown error"
    } as ApiError, { status: 500 });
  }
}
