import api from '../api';
import { CHART_DATA_API_PATH } from '../constants/api';
import { RechartsChartConfig, OpsPlanAggregate, OpsPlanOperation, OpsPlan } from '../types'; // Import from types

// No longer define ChartConfig here, it's RechartsChartConfig from types

// These interfaces are now imported from ../types/index.ts
// export interface OpsPlanAggregate {
//   fn: string;
//   col: string;
// }

// export interface OpsPlanOperation {
//   op: string;
//   by?: string[];
//   aggs?: OpsPlanAggregate[];
// }

// export interface OpsPlan {
//   plan_version: string;
//   x: string;
//   y: Array<{ field: string; fn: string }>;
//   seriesBy: string | null;
//   output_format: string;
//   ops: OpsPlanOperation[];
// }

export interface ChartRequestPayload {
  chart_type: string;
  reasoning: string;
  config: RechartsChartConfig; // Use RechartsChartConfig
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
