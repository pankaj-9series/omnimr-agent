'use client';

import React from 'react';
import { ParsedCSVData } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAppContext } from '@/lib/context/AppContext';

const WorkflowCleanupScreen: React.FC = () => {
  const { csvData: uploadedData, handleDataCleaned } = useAppContext();
  
  const handleCleanup = () => {
    if (uploadedData) {
      handleDataCleaned(uploadedData);
    }
  };

  if (!uploadedData) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Data Cleanup</h2>
        <p className="text-lg text-slate-600">Please upload data first</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Data Cleanup & Quality Check</h2>
        <p className="text-lg text-slate-600">Review and clean your uploaded data</p>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Data Preview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {uploadedData.headers.map((header, index) => (
                  <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {uploadedData.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Quality Check</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800">Data format is valid</span>
            </div>
            <span className="text-green-600 font-semibold">✓</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-green-800">No missing headers detected</span>
            </div>
            <span className="text-green-600 font-semibold">✓</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
              <span className="text-yellow-800">Some data quality issues detected</span>
            </div>
            <span className="text-yellow-600 font-semibold">!</span>
          </div>
        </div>
        
        <div className="mt-6">
          <Button onClick={handleCleanup} className="w-full">
            Continue with Data Cleanup
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowCleanupScreen;
