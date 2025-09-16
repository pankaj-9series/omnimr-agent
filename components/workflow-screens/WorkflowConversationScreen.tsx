'use client';

import React, { useState, useEffect } from 'react';
import { Slide, Suggestion } from '@/lib/types';
import Spinner from '@/components/ui/Spinner';
import { useAppContext } from '@/lib/context/AppContext';
import { CHART_COLOR_PALETTES } from '@/lib/constants';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { getSuggestions } from '@/lib/services/apiService';
import SuggestionPrompts from '@/components/workflow-screens/SuggestionPrompts';

const WorkflowConversationScreen: React.FC = () => {
  const {
    requestId,
    suggestions,
    setSuggestions,
    isSuggestionsLoading,
    setIsSuggestionsLoading,
  } = useAppContext();

  const [isLoading, setIsLoading] = useState(false); 
  const [currentChartPreview, setCurrentChartPreview] = useState<Omit<Slide, 'slideNumber'> | null>(null); 
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null); 

  useEffect(() => {
    setSelectedSuggestionIndex(null); 
    setSuggestions([]); 
  }, [requestId, setSuggestions, setSelectedSuggestionIndex]);

  useEffect(() => {
    if (requestId && !isSuggestionsLoading && suggestions.length === 0) {
      setIsSuggestionsLoading(true);
      getSuggestions(requestId)
        .then(response => {
          const cleanedResponse = response.suggestions.replace(/```json\n|```/g, '').trim();
          const parsedSuggestion = JSON.parse(cleanedResponse);
          setSuggestions([parsedSuggestion]);
        })
        .catch(error => console.error("Failed to re-fetch suggestions:", error))
        .finally(() => setIsSuggestionsLoading(false));
    }
  }, [requestId, isSuggestionsLoading, setSuggestions]);

  const handleSendMessage = async (messageObject: Suggestion, index: number) => { 
    if (isLoading || !requestId) return; 

    setIsLoading(true); 
    setCurrentChartPreview(null); 
    setSelectedSuggestionIndex(index); 

    try {
      // Transform Chart.js config to Recharts compatible format
      const rechartsChartConfig: any = {
        chartTitle: messageObject.chartConfig.options.plugins.title.text || messageObject.recommendation,
      };
      const rechartsChartData: any[] = [];
      const chartJsConfig = messageObject.chartConfig;

      // For Bar Charts
      if (chartJsConfig.type === 'bar') {
        rechartsChartConfig.xAxisKey = chartJsConfig.data.labels[0]; // Assuming first label is x-axis
        rechartsChartConfig.primaryYAxisKey = chartJsConfig.data.datasets[0].label; // Assuming first dataset label is primary y-axis
        rechartsChartConfig.xAxisLabel = chartJsConfig.options?.plugins?.title?.text;
        rechartsChartConfig.yAxisLabel = chartJsConfig.data.datasets[0].label;

        chartJsConfig.data.labels.forEach((label: string, idx: number) => {
          rechartsChartData.push({
            [rechartsChartConfig.xAxisKey]: label,
            [rechartsChartConfig.primaryYAxisKey]: chartJsConfig.data.datasets[0].data[idx],
          });
        });
      } else if (chartJsConfig.type === 'line') {
        // Similar transformation for line chart if needed, adjust based on your API's line chart response
        rechartsChartConfig.xAxisKey = chartJsConfig.data.labels[0];
        rechartsChartConfig.yAxisKeys = chartJsConfig.data.datasets.map((ds: any) => ds.label);
        rechartsChartConfig.xAxisLabel = chartJsConfig.options?.plugins?.title?.text;
        rechartsChartConfig.yAxisLabel = chartJsConfig.data.datasets[0].label;

        chartJsConfig.data.labels.forEach((label: string, idx: number) => {
          const dataPoint: any = { [rechartsChartConfig.xAxisKey]: label };
          chartJsConfig.data.datasets.forEach((dataset: any) => {
            dataPoint[dataset.label] = dataset.data[idx];
          });
          rechartsChartData.push(dataPoint);
        });
      } else if (chartJsConfig.type === 'scatter') {
        // Assuming scatter data comes as { x: value, y: value }
        rechartsChartConfig.xAxisKey = messageObject.chartConfig.options.scales.x.title.text; // Assuming x-axis title from options
        rechartsChartConfig.yAxisKey = messageObject.chartConfig.options.scales.y.title.text; // Assuming y-axis title from options
        rechartsChartConfig.xAxisLabel = rechartsChartConfig.xAxisKey;
        rechartsChartConfig.yAxisLabel = rechartsChartConfig.yAxisKey;
        rechartsChartData.push(...chartJsConfig.data.datasets[0].data.map((d: any) => ({ [rechartsChartConfig.xAxisKey]: d.x, [rechartsChartConfig.yAxisKey]: d.y })));
      }
      
      const newSlide: Omit<Slide, 'slideNumber'> = {
        title: messageObject.chartConfig.options.plugins.title.text || messageObject.recommendation,
        insights: [messageObject.reasoning],
        chartType: messageObject.chartConfig.type.toUpperCase() + '_CHART', // e.g., 'BAR_CHART'
        chartConfig: rechartsChartConfig,
        chartData: rechartsChartData,
        colorPalette: chartJsConfig.data.datasets[0].backgroundColor ? [chartJsConfig.data.datasets[0].backgroundColor] : CHART_COLOR_PALETTES.corporate, // Use first color or default
      };
      setCurrentChartPreview(newSlide); 

    } catch (error) {
      console.error("Failed to process chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex lg:flex-row gap-6 relative w-full">
     <div className="h-full bg-white p-4 rounded-lg shadow-sm w-1/4">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Suggested Analyses</h2>
        <div className="flex-grow overflow-y-auto pr-2 h-full">
          <SuggestionPrompts
            suggestions={suggestions}
            onSelect={handleSendMessage}
            isLoading={isLoading} 
            isSuggestionsLoading={isSuggestionsLoading}
            selectedSuggestionIndex={selectedSuggestionIndex} 
          />
        </div>
      </div>
      
      <div className="h-full w-3/4">
        {isLoading && (
            <div className="bg-white p-4 rounded-lg shadow-sm h-full flex items-center justify-center flex-1">
                <Spinner />
                <p className="ml-2 text-slate-500">Generating chart...</p>
            </div>
        )}
        {!isLoading && currentChartPreview && (
          <div className="bg-white p-4 rounded-lg shadow-sm h-full flex flex-col flex-1">
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 relative h-full flex-1">
              {/* Render Recharts chart using ChartWrapper */}
              <ChartWrapper slide={{
                ...currentChartPreview,
                slideNumber: 1,
              } as Slide} />
            </div>
          </div>
        )}
        {!isLoading && !currentChartPreview && (
          <div className="bg-white p-4 rounded-lg shadow-sm h-full flex items-center justify-center flex-1">
            <p className="text-slate-500">Select a suggestion to generate a chart preview.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowConversationScreen;
