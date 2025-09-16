import React from 'react';
import { Slide } from '@/lib/types';
import VerticalBarChart from './VerticalBarChart';
import TrendLineChart from './TrendLineChart';
import ChartPlaceholder from './ChartPlaceholder';
import Spinner from '@/components/ui/Spinner';
import ScatterChart from './ScatterChart';
import ComposedChart from './ComposedChart';

interface ChartWrapperProps {
  slide: Omit<Slide, 'slideNumber'>;
  isRegenerating?: boolean;
}

const ChartWrapper: React.FC<ChartWrapperProps> = ({ slide, isRegenerating = false }) => {
  const renderChart = () => {
    const chartProps = {
      data: slide.chartData,
      config: slide.chartConfig,
      colorPalette: slide.colorPalette,
    };

    if (!slide.chartData || slide.chartData.length === 0) {
      return <ChartPlaceholder chartName={`${slide.title} (No data to display)`} />;
    }

    switch (slide.chartType) {
      case 'BAR_CHART':
        return <VerticalBarChart {...chartProps} />;
      case 'LINE_CHART':
        return <TrendLineChart {...chartProps}/>;
      case 'SCATTER_CHART':
        return <ScatterChart {...chartProps}/>;
      case 'COMPOSED_CHART':
        return <ComposedChart {...chartProps}/>;
      default:
        const chartName = slide.chartType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        return <ChartPlaceholder chartName={chartName} />;
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-inner h-full flex flex-col">
      <h3 className="text-xl font-bold text-brand-charcoal mb-2 flex-shrink-0 flex items-center gap-2">
        <span>{slide.title}</span>
        {isRegenerating && <Spinner />}
      </h3>
      <div className="flex-grow w-full min-h-0">
        {renderChart()}
      </div>
      <div className="mt-4 max-h-28 overflow-y-auto pr-2 flex-shrink-0">
        <h4 className="font-semibold text-gray-700">Key Insights:</h4>
        {isRegenerating ? (
          <p className="text-sm text-gray-500 italic mt-1">Generating new insights...</p>
        ) : (
          <ul className="list-disc list-inside text-sm text-gray-600 mt-1 space-y-1">
            {Array.isArray(slide.insights) && slide.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ChartWrapper;
