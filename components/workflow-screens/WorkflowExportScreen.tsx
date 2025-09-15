'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DownloadIcon from '@/components/icons/DownloadIcon';
import { useAppContext } from '@/lib/context/AppContext';

const WorkflowExportScreen: React.FC = () => {
  const { slides, currentProject: project } = useAppContext();

  const handleExportPPT = () => {
    alert('PPT export functionality will be implemented here');
  };

  const handleExportPDF = () => {
    alert('PDF export functionality will be implemented here');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Export Your Analysis</h2>
        <p className="text-lg text-slate-600">Generate professional reports from your insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">PowerPoint Presentation</h3>
          <p className="text-gray-600 mb-4">
            Export your slides as a professional PowerPoint presentation ready for client meetings.
          </p>
          <Button onClick={handleExportPPT} className="w-full flex items-center justify-center gap-2">
            <DownloadIcon className="w-5 h-5" />
            Export as PPTX
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">PDF Report</h3>
          <p className="text-gray-600 mb-4">
            Generate a comprehensive PDF report with all your analysis and insights.
          </p>
          <Button onClick={handleExportPDF} variant="secondary" className="w-full flex items-center justify-center gap-2">
            <DownloadIcon className="w-5 h-5" />
            Export as PDF
          </Button>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Slide Summary</h3>
        {slides.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No slides to export yet.</p>
            <p className="text-sm mt-2">Create some slides in the conversation step first.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-700">
                Total Slides: {slides.length}
              </span>
              <span className="text-sm text-gray-500">
                Project: {project?.name || 'Untitled'}
              </span>
            </div>

            <div className="space-y-3">
              {slides.map((slide) => (
                <div key={slide.slideNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">{slide.title}</h4>
                    <p className="text-sm text-gray-600">Slide {slide.slideNumber} • {slide.chartType}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {slide.insights.length} insights
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WorkflowExportScreen;
