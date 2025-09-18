'use client';

import React, { useState, useEffect } from 'react';
import { ChartJsChartConfig, Slide, Suggestion, OpsPlan, RechartsChartConfig } from '@/lib/types'; // Import RechartsChartConfig
import Spinner from '@/components/ui/Spinner';
import { useAppContext } from '@/lib/context/AppContext';
import { CHART_COLOR_PALETTES } from '@/lib/constants';
import ChartWrapper from '@/components/charts/ChartWrapper';
import { getSuggestions } from '@/lib/services/apiService';
import SuggestionPrompts from '@/components/workflow-screens/SuggestionPrompts';
import { getChartData, ChartRequestPayload, GetChartDataPayload } from '@/lib/services/chartService';

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
          // response.response is now an array of suggestions
          setSuggestions(response.response.suggestions);
        })
        .catch(error => console.error("Failed to re-fetch suggestions:", error))
        .finally(() => setIsSuggestionsLoading(false));
    }
  }, [requestId, setSuggestions]);

  const handleSendMessage = async (messageObject: Suggestion, index: number) => {
    if (isLoading || !requestId) return;

    setIsLoading(true);
    setCurrentChartPreview(null);
    setSelectedSuggestionIndex(index);

    try {
      const { chartConfig: chartJsChartConfig, recommendation, reasoning, opsPlan } = messageObject;

      if (!requestId || !opsPlan) {
        console.error("Missing requestId or opsPlan for chart data API call.");
        setIsLoading(false);
        return;
      }

      const rechartsChartConfig: RechartsChartConfig = {
        chartTitle: chartJsChartConfig.options?.plugins?.title?.text || recommendation || '',
        xAxisKey: opsPlan.x, // Use opsPlan.x for the exact data key
        yAxisKeys: opsPlan.y.map(y => y.field),
        primaryYAxisKey: opsPlan.y[0]?.field, // Use opsPlan.y[0].field for primary Y-axis
        colors: {
          bar: chartJsChartConfig.data.datasets[0]?.backgroundColor ? [{ key: chartJsChartConfig.data.datasets[0].label, color: chartJsChartConfig.data.datasets[0].backgroundColor }] : undefined,
          line: chartJsChartConfig.data.datasets[0]?.borderColor ? [{ key: chartJsChartConfig.data.datasets[0].label, color: chartJsChartConfig.data.datasets[0].borderColor }] : undefined,
        },
        xAxisLabel: chartJsChartConfig.options?.scales?.x?.title?.text,
        yAxisLabel: chartJsChartConfig.options?.scales?.y?.title?.text || opsPlan.y[0]?.field, // Use opsPlan.y[0].field as fallback for label
      };

      const chartRequestPayload: ChartRequestPayload = {
        chart_type: chartJsChartConfig.type,
        reasoning: reasoning,
        config: rechartsChartConfig,
        ops_plan: opsPlan,
      };

      const getChartDataPayload: GetChartDataPayload = {
        chart: chartRequestPayload,
        request_id: requestId,
      };

      const chartDataResponse = await getChartData(getChartDataPayload);

      let transformedChartData: any[] = [];

      if (chartDataResponse && Array.isArray(chartDataResponse) && chartDataResponse.length > 0) {
        transformedChartData = chartDataResponse;
      } else if (chartJsChartConfig.data.labels && chartJsChartConfig.data.labels.length > 0) {
        console.warn("Chart data API returned unexpected format or empty data. Falling back to initial chartConfig.data:", chartDataResponse);
        transformedChartData = chartJsChartConfig.data.labels.map((label: string, idx: number) => {
          const dataPoint: { [key: string]: any } = { [rechartsChartConfig.xAxisKey || 'name']: label };
          chartJsChartConfig.data.datasets.forEach((dataset: any) => {
            // Use datasetType instead of type for consistency with Zod schema
            if (dataset.datasetType === 'bar' || dataset.datasetType === 'line' || dataset.datasetType === 'area') {
              dataPoint[dataset.label] = dataset.data[idx];
            } else {
              dataPoint[dataset.label] = dataset.data[idx]; // Default handling
            }
          });
          return dataPoint;
        });
      } else {
        console.warn("Chart data API returned unexpected format or empty data, and no fallback labels available.", chartDataResponse);
        transformedChartData = [];
      }
      
      setCurrentChartPreview({
        title: rechartsChartConfig.chartTitle,
        insights: [reasoning],
        chartType: chartJsChartConfig.type,
        chartConfig: { ...rechartsChartConfig },
        chartData: transformedChartData,
        colorPalette: CHART_COLOR_PALETTES.corporate,
      });

    } catch (error) {
      console.error("Failed to process chart data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="h-full flex lg:flex-row gap-6 relative w-full">
     <div className="h-full bg-white p-4 rounded-lg shadow-sm w-1/4 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Suggested Analyses</h2>
        <div className="flex-grow pr-2">
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
