import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { RechartsChartConfig } from '@/lib/types'; // Changed ChartConfig to RechartsChartConfig

interface TrendLineChartProps {
  data: any[];
  config?: RechartsChartConfig; // Changed ChartConfig to RechartsChartConfig
  colorPalette?: string[];
}

const TrendLineChart: React.FC<TrendLineChartProps> = ({ data, config, colorPalette }) => {
  if (!data || data.length === 0 || !config || !config.xAxisKey || !config.yAxisKeys) {
    return null; // Render nothing if essential data or config is missing
  }

  const { xAxisKey, yAxisKeys, xAxisLabel, yAxisLabel } = config;
  const defaultColors = colorPalette || ['#2563eb', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b']; // Default palette

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xAxisKey} label={{ value: xAxisLabel, position: 'bottom' }} />
        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        {Array.isArray(yAxisKeys) && yAxisKeys.map((key, index) => (
          <Line
            key={key}
            dataKey={key}
            stroke={defaultColors[index % defaultColors.length]}
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default TrendLineChart;
