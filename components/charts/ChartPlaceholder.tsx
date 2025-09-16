import React from 'react';

interface ChartPlaceholderProps {
  chartName: string;
}

const ChartPlaceholder: React.FC<ChartPlaceholderProps> = ({ chartName }) => {
  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-50 text-gray-400 rounded-lg border border-gray-200">
      <p className="text-center">{chartName}</p>
    </div>
  );
};

export default ChartPlaceholder;
