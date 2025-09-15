import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Slide, ChartConfig, ParsedCSVData } from '../lib/types';
import Button from './ui/Button';
import ChartWrapper from './charts/ChartWrapper';
import { processChartData } from '../lib/utils/chartDataProcessor';
import { regenerateTitleAndInsights } from '../lib/services/geminiService';

interface ChartConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    slide: Omit<Slide, 'slideNumber'>;
    csvData: ParsedCSVData;
    onSave: (data: { config: ChartConfig; title: string; insights: string[] }) => void;
}

const ChartConfigModal: React.FC<ChartConfigModalProps> = ({ isOpen, onClose, slide, csvData, onSave }) => {
    const [config, setConfig] = useState<ChartConfig>(slide.chartConfig || { xAxis: '', yAxis: '' });
    const [liveTitle, setLiveTitle] = useState(slide.title);
    const [liveInsights, setLiveInsights] = useState(slide.insights);
    const [isRegenerating, setIsRegenerating] = useState(false);
    
    const debounceTimeout = useRef<number | null>(null);
    
    useEffect(() => {
        if (slide.chartConfig) {
            setConfig(slide.chartConfig);
        }
        setLiveTitle(slide.title);
        setLiveInsights(slide.insights);
    }, [slide]);

    useEffect(() => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (config.xAxis && config.yAxis) {
            debounceTimeout.current = window.setTimeout(async () => {
                setIsRegenerating(true);
                try {
                    const result = await regenerateTitleAndInsights(slide.chartType, config.xAxis, config.yAxis, csvData.headers);
                    setLiveTitle(result.title);
                    setLiveInsights(result.insights);
                } catch (error) {
                    console.error("Failed to regenerate slide content:", error);
                } finally {
                    setIsRegenerating(false);
                }
            }, 750);
        }
        
        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };

    }, [config.xAxis, config.yAxis, slide.chartType, csvData.headers]);

    const liveChartData = useMemo(() => {
        if (config.xAxis && config.yAxis) {
            return processChartData(csvData, config, slide.chartType);
        }
        return [];
    }, [csvData, config, slide.chartType]);

    const liveSlidePreview = useMemo(() => {
        return {
            ...slide,
            title: liveTitle,
            insights: liveInsights,
            chartConfig: config,
            chartData: liveChartData,
        }
    }, [slide, config, liveChartData, liveTitle, liveInsights]);

    const handleSave = () => {
        onSave({ config, title: liveTitle, insights: liveInsights });
    };

    if (!isOpen) return null;

    const { recommendedXAxes = [], recommendedYAxes = [] } = slide.chartConfig || {};
    const xOptions = recommendedXAxes.length > 0 ? recommendedXAxes : csvData.headers;
    const yOptions = recommendedYAxes.length > 0 ? recommendedYAxes : csvData.headers;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 text-3xl leading-none">&times;</button>
                <h2 className="text-2xl font-bold text-center mb-4 flex-shrink-0">Configure Chart: {slide.title}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow min-h-0">
                    <div className="md:col-span-1 space-y-4">
                        <h3 className="font-semibold text-lg">Chart Settings</h3>
                        <div>
                            <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700 mb-1">X-Axis (Category)</label>
                            <select id="xAxis" value={config.xAxis} onChange={e => setConfig(c => ({...c, xAxis: e.target.value}))} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                                <option value="">Select Header</option>
                                {xOptions.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700 mb-1">Y-Axis (Value)</label>
                             <select id="yAxis" value={config.yAxis} onChange={e => setConfig(c => ({...c, yAxis: e.target.value}))} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                                <option value="">Select Header</option>
                                {yOptions.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg flex flex-col min-h-0">
                        <h3 className="font-semibold text-lg text-center mb-2 flex-shrink-0">Live Preview</h3>
                        <div className="flex-grow w-full min-h-0">
                           <ChartWrapper slide={liveSlidePreview} isRegenerating={isRegenerating} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 flex-shrink-0">
                    <Button variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Configuration</Button>
                </div>
            </div>
        </div>
    );
};

export default ChartConfigModal;
