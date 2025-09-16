import api from '../api';
import { CHART_DATA_API_PATH } from '../constants/api';
import { ChartConfig, OpsPlanAggregate, OpsPlanOperation, OpsPlan } from '../types';

export interface ChartConfig {
  chartTitle: string;
  xAxisKey: string;
  yAxisKey?: string; // For scatter charts that might define a single yAxisKey directly
  yAxisKeys?: string[] | { // Optional, can be string[] for simple charts or object for composed
    bar?: string[];
    line?: string[];
    area?: string[];
  };
  primaryYAxisKey?: string; // Derived in ConversationScreen for single-axis charts
  barColors?: Array<{ key: string; color: string }>;
  colors?: { // For composed charts
    bar?: Array<{ key: string; color: string }>;
    line?: Array<{ key: string; color: string }>;
    area?: Array<{ key: string; color: string }>;
  };
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface OpsPlanAggregate {
  fn: string;
  col: string;
}

export interface OpsPlanOperation {
  op: string;
  by?: string[];
  aggs?: OpsPlanAggregate[];
}

export interface OpsPlan {
  plan_version: string;
  x: string;
  y: Array<{ field: string; fn: string }>;
  seriesBy: string | null;
  output_format: string;
  ops: OpsPlanOperation[];
}

export interface ChartRequestPayload {
  chart_type: string;
  reasoning: string;
  config: ChartConfig;
  ops_plan: OpsPlan;
}

export interface GetChartDataPayload {
  chart: ChartRequestPayload;
  request_id: string;
}

export const getChartData = async (payload: GetChartDataPayload): Promise<any[]> => {
  try {
    const response = await api.post(CHART_DATA_API_PATH, payload);
    return response.data;
  } catch (error: any) {
    console.error("Error fetching chart data:", error);
    throw new Error(`Chart data API error: ${error.response?.status || error.message}`);
  }
};
