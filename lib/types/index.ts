export interface Step {
  name: string;
  description: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  theme: string; // Theme ID from constants.ts
  status: 'In Progress' | 'Completed' | 'Draft';
  progress: number;
  startDate: string;
  endDate: string;
  fileCount: number;
}

export interface ChartConfig {
  xAxis: string;
  yAxis: string;
  value?: string;
  recommendedXAxes?: string[];
  recommendedYAxes?: string[];
}

export interface Slide {
  slideNumber: number;
  chartType: string;
  title: string;
  insights: string[];
  chartConfig?: ChartConfig;
  chartData?: any[];
  colorPalette?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isAwaitingConfirmation?: boolean;
  slideData?: Omit<Slide, 'slideNumber'>;
}

export interface ChartType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: (string | number)[][];
}

export interface QualityCheck {
  id: string;
  title: string;
  description: string;
  issueCount: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  status: 'active' | 'resolved';
  isAutoFixable: boolean;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  updated_at: string;
}

export interface Suggestion {
  chart_type: string;
  reasoning: string;
  config: {
    chartTitle: string;
    xAxisKey: string;
    yAxisKeys?: string[];
    yAxisKey?: string; // for scatter
    [key: string]: any;
  };
}

// API Types
export interface ChatRequest {
  message: string;
  filePath?: string;
}

export interface ConversationRequest {
  messages: string[];
}

export interface ApiResponse {
  success: boolean;
  response: string;
  conversationLength?: number;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  example?: any;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: string;
}

export interface AnalyticsResponse {
  success: boolean;
  response: string;
  timestamp: string;
}

export interface ApiDocumentation {
  name: string;
  version: string;
  description: string;
  endpoints: Record<string, string>;
  examples: Record<string, any>;
}

export interface AgentConfig {
  model: string;
  temperature: number;
  apiKey: string;
}

export interface UploadResponse {
  success: boolean;
  filePath: string;
  fileName: string;
  fileSize: number;
  message: string;
  timestamp: string;
}
