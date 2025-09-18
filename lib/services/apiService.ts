import { UploadResponse, Suggestion, AnalyticsResponse } from '../types'; // Import AnalyticsResponse
import api from '../api';
import {
  CSV_UPLOAD_API_PATH,
  CSV_SUGGESTION_API_PATH,
} from '../constants/api';

export const uploadFile = async (requestId: string, file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('request_id', requestId);
  formData.append('file', file);

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

export const getSuggestions = async (requestId: string): Promise<AnalyticsResponse> => {
  try {
    const response = await api.post(CSV_SUGGESTION_API_PATH, { request_id: requestId });
    return response.data;
  } catch (error: any) {
    throw new Error(`Chart suggestion API error: ${error.response?.status || error.message}`);
  }
};
