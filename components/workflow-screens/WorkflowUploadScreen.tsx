'use client';

import React, { useState } from 'react';
import { ParsedCSVData, Suggestion } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import UploadIcon from '@/components/icons/UploadIcon';
import { useAppContext } from '@/lib/context/AppContext';

const WorkflowUploadScreen: React.FC = () => {
  const { handleUploadSuccess: onUploadSuccess, setIsSuggestionsLoading, setSuggestions } = useAppContext();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setIsSuggestionsLoading(true);

    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch('/api/csv/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      // Parse CSV data for preview
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const rows = lines.slice(1, 6).map(line => 
        line.split(',').map(v => v.trim().replace(/"/g, ''))
      );

      const csvData: ParsedCSVData = { headers, rows };
      onUploadSuccess(csvData, result.filePath);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setIsSuggestionsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Upload Your Data</h2>
        <p className="text-lg text-slate-600">Upload a CSV file to begin your market research analysis</p>
      </div>

      <Card className="p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Spinner />
              <p className="mt-4 text-gray-600">Uploading and processing your file...</p>
            </div>
          ) : (
            <div className="relative z-0">
              <div className="flex flex-col items-center">
                <UploadIcon className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your CSV file here
                </h3>
                <p className="text-gray-600 mb-6">
                  or click to browse and select a file
                </p>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button>
                    Choose File
                  </Button>
                </label>
              </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileInput}
                  className="opacity-0 absolute top-0 left-0 w-full h-full z-99"
                  id="file-upload"
                />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default WorkflowUploadScreen;
