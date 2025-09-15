import { Step, ChartType, Project } from './types';

export const DASHBOARD_STEPS: Step[] = [
  { name: 'Upload', description: 'Data import' },
  { name: 'Cleanup', description: 'QC & diagnostics' },
  { name: 'Conversation', description: 'AI analysis' },
  { name: 'Export', description: 'PPT generation' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: 1, name: 'Q4 Brand Tracker Study', description: 'Quarterly brand perception and awareness tracking study', status: 'In Progress', progress: 75, startDate: '2024-01-01', endDate: '2024-01-15', fileCount: 3, theme: 'corporate_blue' },
  { id: 2, name: 'Customer Satisfaction Survey', description: 'Post-purchase satisfaction and NPS measurement', status: 'Completed', progress: 100, startDate: '2024-01-05', endDate: '2024-01-12', fileCount: 2, theme: 'research_green' },
  { id: 3, name: 'Market Segmentation Analysis', description: 'Consumer behavior and market segment identification', status: 'Draft', progress: 25, startDate: '2024-01-10', endDate: '2024-01-10', fileCount: 1, theme: 'consulting_gray' },
  { id: 4, name: 'Brand Perception Study', description: 'Competitive analysis and brand positioning research', status: 'In Progress', progress: 60, startDate: '2024-01-08', endDate: '2024-01-14', fileCount: 4, theme: 'healthcare_teal' },
];

export const THEMES = [
  { id: 'corporate_blue', name: 'Corporate Blue', description: 'Professional business theme', colors: ['#0d47a1', '#1976d2', '#42a5f5'] },
  { id: 'research_green', name: 'Research Green', description: 'Academic research style', colors: ['#2e7d32', '#4caf50', '#81c784'] },
  { id: 'consulting_gray', name: 'Consulting Gray', description: 'Management consulting style', colors: ['#424242', '#757575', '#bdbdbd'] },
  { id: 'healthcare_teal', name: 'Healthcare Teal', description: 'Medical research focus', colors: ['#00695c', '#009688', '#4db6ac'] },
];

export const CHART_TYPES: ChartType[] = [
  { id: 'BAR_CHART', name: 'Bar Chart', description: 'Compares values across different categories.', imageUrl: 'https://picsum.photos/seed/bar/400/300' },
  { id: 'LINE_CHART', name: 'Line Chart', description: 'Shows trends over a period of time.', imageUrl: 'https://picsum.photos/seed/line/400/300' },
  { id: 'SCATTER_CHART', name: 'Scatter Chart', description: 'Displays relationships between two numeric variables.', imageUrl: 'https://picsum.photos/seed/scatter_new/400/300' },
  { id: 'COMPOSED_CHART', name: 'Composed Chart', description: 'Combines multiple chart types in a single view.', imageUrl: 'https://picsum.photos/seed/composed/400/300' },
];