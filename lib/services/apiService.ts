import { ApiResponse, AnalyticsResponse, UploadResponse } from '../types';
import api from '../api';
import {
  CHAT_API_PATH,
  CSV_UPLOAD_API_PATH,
  CSV_SUGGESTION_API_PATH,
} from '../constants/api';

export const chat = async (message: string, filePath?: string): Promise<ApiResponse> => {
  try {
    const response = await api.post(CHAT_API_PATH, { message, filePath });
    return response.data;
  } catch (error: any) {
    throw new Error(`Chat API error: ${error.response?.status || error.message}`);
  }
};

export const uploadCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('csvFile', file);

  try {
    const response = await api.post(CSV_UPLOAD_API_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Upload API error: ${error.response?.status || error.message}`);
  }
};

export const getChartSuggestion = async (filePath: string): Promise<AnalyticsResponse> => {
  try {
    const response = await api.post(CSV_SUGGESTION_API_PATH, { filePath });
    return response.data;
  } catch (error: any) {
    throw new Error(`Chart suggestion API error: ${error.response?.status || error.message}`);
  }
};
