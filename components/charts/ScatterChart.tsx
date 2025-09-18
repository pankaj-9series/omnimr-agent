import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RechartsChartConfig } from '@/lib/types';

interface ScatterChartProps {
  data: any[];
  config?: RechartsChartConfig;
  colorPalette?: string[];
}

const ScatterChart: React.FC<ScatterChartProps> = ({ data, config, colorPalette }) => {
  if (!data || data.length === 0 || !config || !config.xAxisKey || !config.primaryYAxisKey) {
    return null; // Render nothing if essential data or config is missing
  }

  const { xAxisKey, primaryYAxisKey, xAxisLabel, yAxisLabel } = config;
  const defaultColor = colorPalette && colorPalette.length > 0 ? colorPalette[0] : '#8884d8';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart
        margin={{
          top: 20, right: 20, bottom: 20, left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis dataKey={xAxisKey} name={xAxisLabel || xAxisKey} unit="" />
        <YAxis dataKey={primaryYAxisKey} name={yAxisLabel || primaryYAxisKey} unit="" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name={config.chartTitle || 'Data'} data={data} fill={defaultColor} />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChart;
