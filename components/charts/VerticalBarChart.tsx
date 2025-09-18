import React from 'react';
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Bar } from 'recharts';
import { RechartsChartConfig } from '@/lib/types'; // Changed ChartConfig to RechartsChartConfig

interface VerticalBarChartProps {
  data: any[];
  config?: RechartsChartConfig; // Changed ChartConfig to RechartsChartConfig
  colorPalette?: string[];
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({ data, config, colorPalette }) => {
  if (!data || data.length === 0 || !config || !config.xAxisKey || !config.primaryYAxisKey) {
    return null; // Render nothing if essential data or config is missing
  }

  const { xAxisKey, primaryYAxisKey, xAxisLabel, yAxisLabel, barColors } = config;
  const defaultColor = colorPalette && colorPalette.length > 0 ? colorPalette[0] : '#2563eb'; // Default to a blue

  // Use specific colors if provided, otherwise fall back to colorPalette or default
  const getBarColor = (index: number) => {
    if (barColors && barColors[index]) {
      return barColors[index].color;
    } else if (colorPalette) {
      return colorPalette[index % colorPalette.length];
    } else {
      return defaultColor;
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{
        top: 20, right: 30, left: 20, bottom: 5,
      }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xAxisKey} angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} />
        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} tickFormatter={(value) => value.toLocaleString()} />
        <Tooltip formatter={(value: number) => value.toLocaleString()} />
        <Legend />
        <Bar dataKey={primaryYAxisKey} fill={getBarColor(0)} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VerticalBarChart;
