import React from 'react';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartConfig } from '@/lib/types';

interface ScatterChartProps {
  data: any[];
  config?: ChartConfig;
  colorPalette?: string[];
}

const ScatterChart: React.FC<ScatterChartProps> = ({ data, config, colorPalette }) => {
  if (!data || data.length === 0 || !config || !config.xAxisKey || !config.yAxisKey) {
    return null; // Render nothing if essential data or config is missing
  }

  const { xAxisKey, yAxisKey, xAxisLabel, yAxisLabel } = config;
  const defaultColor = colorPalette && colorPalette.length > 0 ? colorPalette[0] : '#8884d8';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsScatterChart
        margin={{
          top: 20, right: 20, bottom: 20, left: 20,
        }}
      >
        <CartesianGrid />
        <XAxis type="number" dataKey={xAxisKey} name={xAxisLabel || xAxisKey} unit="" />
        <YAxis type="number" dataKey={yAxisKey} name={yAxisLabel || yAxisKey} unit="" />
        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
        <Scatter name={config.chartTitle || 'Data'} data={data} fill={defaultColor} />
      </RechartsScatterChart>
    </ResponsiveContainer>
  );
};

export default ScatterChart;
