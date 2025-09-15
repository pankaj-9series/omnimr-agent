// lib/services/apiService.ts
import { ApiResponse, AnalyticsResponse, UploadResponse } from '../types';

const API_BASE_URL = '/api';

export const chat = async (message: string, filePath?: string): Promise<ApiResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, filePath }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.status}`);
  }

  return response.json();
};

export const uploadCSV = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('csvFile', file);

  const response = await fetch(`${API_BASE_URL}/csv/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload API error: ${response.status}`);
  }

  return response.json();
};

export const getChartSuggestion = async (filePath: string): Promise<AnalyticsResponse> => {
  const response = await fetch(`${API_BASE_URL}/csv/suggestion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ filePath }),
  });

  if (!response.ok) {
    throw new Error(`Chart suggestion API error: ${response.status}`);
  }

  return response.json();
};

export const getHealthStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  
  if (!response.ok) {
    throw new Error(`Health check API error: ${response.status}`);
  }

  return response.json();
};
