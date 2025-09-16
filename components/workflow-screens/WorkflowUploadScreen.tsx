'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ParsedCSVData, Suggestion } from '@/lib/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import UploadIcon from '@/components/icons/UploadIcon';
import FileUploadIcon from '@/components/icons/FileUploadIcon';
import DocumentTextIcon from '@/components/icons/DocumentTextIcon';
import CheckIcon from '@/components/icons/CheckIcon';
import DownloadIcon from '@/components/icons/DownloadIcon';
import { useAppContext } from '@/lib/context/AppContext';
import { uploadFile, getSuggestions } from '@/lib/services/apiService';
import { SAMPLE_CSV_DATA } from '@/lib/constants';

const generateUniqueId = (): string => {
  return `upload-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const parseCSV = (csvText: string): ParsedCSVData => {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length === 0) {
        return { headers: [], rows: [] };
    }

    const parseLine = (line: string): string[] => {
        const result: string[] = [];
        let currentField = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    currentField += '"';
                    i++; 
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
        }
        result.push(currentField);
        return result;
    };
    
    const headers = parseLine(lines[0]);
    const rows = lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => parseLine(line));

    return { headers, rows };
};

interface FileDetails {
    name: string;
    size: string;
    rows: number;
    cols: number;
}

const WorkflowUploadScreen: React.FC = () => {
  const { handleUploadSuccess: onUploadSuccess, setIsSuggestionsLoading, setSuggestions } = useAppContext();
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const [fullData, setFullData] = useState<ParsedCSVData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dragActive, setDragActive] = useState(false);

  const { paginatedRows, totalPages, startIndex } = useMemo(() => {
    if (!fullData) return { paginatedRows: [], totalPages: 0, startIndex: 0 };
    
    const total = Math.ceil(fullData.rows.length / rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    const rows = fullData.rows.slice(start, start + rowsPerPage);

    return { paginatedRows: rows, totalPages: total, startIndex: start };
  }, [fullData, currentPage, rowsPerPage]);

  const processFile = async (file: File, fileContent: string) => {
    setIsUploading(true);
    const parsedData = parseCSV(fileContent);

    if (parsedData.headers.length === 0 || parsedData.rows.length === 0) {
        alert('Validation failed: The CSV file is empty or invalid.');
        setIsUploading(false);
        return;
    }

    const isConsistent = parsedData.rows.every(row => row.length === parsedData.headers.length);
    if (isConsistent) {
        setFullData(parsedData);
        setFileDetails({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            rows: parsedData.rows.length,
            cols: parsedData.headers.length
        });
        setCurrentPage(1);

        try {
            const requestId = generateUniqueId();
            await uploadFile(requestId, file);
            onUploadSuccess(parsedData, requestId); // Call onUploadSuccess immediately
            
            // Fetch suggestions in background
            setIsSuggestionsLoading(true);
            getSuggestions(requestId)
                .then(response => setSuggestions(response.suggestions || []))
                .catch(error => console.error("Failed to get suggestions:", error))
                .finally(() => setIsSuggestionsLoading(false));
        } catch (error) {
            console.error("Upload failed:", error);
            alert(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

    } else {
        alert('Validation failed: Rows have an inconsistent number of columns.');
    }
    setIsUploading(false);
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        const text = event.target?.result as string;
        if (text) {
           await processFile(file, text);
        }
    };
    reader.readAsText(file);
  };
  
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false); // Reset drag state
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            if (text) {
                await processFile(file, text);
            }
        };
        reader.readAsText(file);
    } else {
        alert("Please drop a single CSV file.");
    }
  }, [onUploadSuccess, setIsSuggestionsLoading, setSuggestions]); // Added dependencies

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true); // Set drag active when dragging over
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false); // Reset drag active when dragging leaves
  };

  const handleSampleData = async () => {
    setIsUploading(true);
    const parsedData = parseCSV(SAMPLE_CSV_DATA);
    setFullData(parsedData);
    setFileDetails({
        name: 'realistic_survey_data.csv',
        size: '0.61 MB',
        rows: parsedData.rows.length, 
        cols: parsedData.headers.length
    });
    setCurrentPage(1);
    
    try {
        const requestId = generateUniqueId();
        const sampleFile = new File([SAMPLE_CSV_DATA], 'sample_data.csv', { type: 'text/csv' });
        await uploadFile(requestId, sampleFile);
        onUploadSuccess(parsedData, requestId); // Call onUploadSuccess immediately
        
        // Fetch suggestions in background
        setIsSuggestionsLoading(true);
        getSuggestions(requestId)
            .then(response => setSuggestions(response.suggestions || []))
            .catch(error => console.error("Sample data upload failed:", error))
            .finally(() => setIsSuggestionsLoading(false));
    } catch (error) {
        console.error("Sample data upload failed:", error);
        alert(`Sample data upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    setIsUploading(false);
  };

  const handleDownloadTemplate = () => {
    const headers = fullData?.headers ?? parseCSV(SAMPLE_CSV_DATA).headers;
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Data Upload</h1>
        <p className="mt-2 text-md text-slate-500">Upload your research data files to begin the analysis workflow.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`relative p-8 text-center border-2 border-dashed rounded-xl bg-white transition-colors duration-200 group ${dragActive ? 'border-sky-500 bg-sky-50' : 'border-slate-300 hover:border-sky-500'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div 
                className="cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
            >
                {isUploading ? (
                    <div className="flex flex-col items-center">
                        <Spinner />
                        <p className="mt-4 text-gray-600">Processing file...</p>
                    </div>
                ) : (
                    <>
                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-sky-100 transition-colors">
                            <FileUploadIcon className="w-8 h-8 text-slate-500 group-hover:text-sky-600 transition-colors" />
                        </div>
                        <p className="mt-4 text-lg font-semibold text-slate-900">Drag & drop or <span className="text-sky-600">browse files</span></p>
                        <p className="mt-1 text-sm text-slate-500">Supported formats: CSV, XLSX, TSV</p>
                        <Button onClick={(e) => {e.stopPropagation(); handleSampleData()}} variant="secondary" size="sm" className="mt-4" disabled={isUploading}>
                            {isUploading ? 'Processing...' : 'Use Sample Data'}
                        </Button>
                    </>
                )}
            </div>
            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".csv, .xlsx, .xls, .tsv" disabled={isUploading} />
          </div>

          {fileDetails && (
            <Card className="p-4">
              <h2 className="text-lg font-semibold leading-6 text-slate-900 mb-4">Uploaded File</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-sky-100 p-3 rounded-lg flex-shrink-0">
                    <DocumentTextIcon className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{fileDetails.name}</p>
                    <p className="text-sm text-slate-500">
                      {fileDetails.size} &bull; {fileDetails.rows} rows &times; {fileDetails.cols} columns
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  <CheckIcon className="w-4 h-4" />
                  Validated
                </div>
              </div>
            </Card>
          )}

          {fullData && (
             <Card>
                <div className="p-4 flex justify-between items-center border-b border-slate-200">
                     <h2 className="text-lg font-semibold leading-6 text-slate-900">Data Preview</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-500 w-12 text-center">#</th>
                                {fullData.headers.map(header => (
                                    <th key={header} className="px-4 py-3 text-left font-semibold text-slate-500 whitespace-nowrap">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                            {paginatedRows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-slate-50">
                                    <td className="px-4 py-2 text-slate-500 text-center">{startIndex + rowIndex + 1}</td>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-2 text-slate-700 whitespace-nowrap truncate max-w-xs">{String(cell)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 0 && (
                    <div className="p-4 border-t border-slate-200 flex justify-between items-center text-sm">
                         <button onClick={handleDownloadTemplate} className="text-sm text-sky-600 hover:underline flex items-center gap-1.5">
                            <DownloadIcon className="w-4 h-4" />
                            Download Template
                        </button>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label htmlFor="rows-per-page-upload" className="text-slate-700 text-sm">Rows:</label>
                                <select
                                    id="rows-per-page-upload"
                                    value={rowsPerPage}
                                    onChange={e => {
                                        setRowsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="block w-auto pl-2 pr-7 py-1 text-sm border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 rounded-md bg-white border"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                </select>
                            </div>
                             <span className="text-sm text-slate-700">
                                {startIndex + 1}-{Math.min(startIndex + rowsPerPage, fullData.rows.length)} of {fullData.rows.length}
                            </span>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} variant="secondary" size="sm">
                                Prev
                            </Button>
                            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} variant="secondary" size="sm">
                                Next
                            </Button>
                        </div>
                    </div>
                )}
             </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Supported Formats</h3>
                <ul className="space-y-3 text-sm">
                    <li className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                        <div>
                            <p className="font-medium text-slate-800">CSV</p>
                            <p className="text-xs text-slate-500">Comma-separated values</p>
                        </div>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                        <div>
                            <p className="font-medium text-slate-800">XLSX</p>
                            <p className="text-xs text-slate-500">Excel spreadsheet</p>
                        </div>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                        <div>
                            <p className="font-medium text-slate-800">XLS</p>
                            <p className="text-xs text-slate-500">Legacy Excel format</p>
                        </div>
                    </li>
                    <li className="flex items-center gap-3">
                        <span className="h-2 w-2 bg-yellow-400 rounded-full"></span>
                        <div>
                            <p className="font-medium text-slate-800">TSV</p>
                            <p className="text-xs text-slate-500">Tab-separated values</p>
                        </div>
                    </li>
                </ul>
            </Card>
             <Card className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Upload Guidelines</h3>
                 <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                        <span>First row should contain column headers</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                        <span>Use consistent data formats within columns</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                        <span>Maximum file size: 50MB</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"/>
                        <span>UTF-8 encoding recommended</span>
                    </li>
                </ul>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkflowUploadScreen;
