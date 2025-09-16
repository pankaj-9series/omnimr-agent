import React from 'react';
import { ComposedChart as RechartsComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { ChartConfig } from '@/lib/types';

interface ComposedChartProps {
  data: any[];
  config?: ChartConfig;
  colorPalette?: string[];
}

const ComposedChart: React.FC<ComposedChartProps> = ({ data, config, colorPalette }) => {
  if (!data || data.length === 0 || !config || !config.xAxisKey) {
    return null; // Render nothing if essential data or config is missing
  }

  const { xAxisKey, xAxisLabel, yAxisLabel } = config;
  const defaultColors = colorPalette || ['#003f5c', '#444e86', '#955196', '#dd5182', '#ff6e54', '#ffa600'];

  // Determine y-axis keys for bars, lines, and areas
  const barKeys = config.yAxisKeys && typeof config.yAxisKeys === 'object' && 'bar' in config.yAxisKeys ? config.yAxisKeys.bar : [];
  const lineKeys = config.yAxisKeys && typeof config.yAxisKeys === 'object' && 'line' in config.yAxisKeys ? config.yAxisKeys.line : [];
  const areaKeys = config.yAxisKeys && typeof config.yAxisKeys === 'object' && 'area' in config.yAxisKeys ? config.yAxisKeys.area : [];

  let colorIndex = 0;
  const getColor = () => defaultColors[colorIndex++ % defaultColors.length];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsComposedChart
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xAxisKey} angle={-45} textAnchor="end" height={80} interval={0} tick={{ fontSize: 12 }} label={{ value: xAxisLabel, position: 'bottom' }} />
        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        
        {areaKeys && areaKeys.map((key) => (
          <Area key={key} type="monotone" dataKey={key} fill={getColor()} stroke={getColor()} />
        ))}

        {barKeys && barKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={getColor()} />
        ))}

        {lineKeys && lineKeys.map((key) => (
          <Line key={key} type="monotone" dataKey={key} stroke={getColor()} activeDot={{ r: 8 }} />
        ))}
      </RechartsComposedChart>
    </ResponsiveContainer>
  );
};

export default ComposedChart;
