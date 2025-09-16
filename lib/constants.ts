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

export const CHART_COLOR_PALETTES: { [key: string]: string[] } = {
  corporate: ['#003f5c', '#444e86', '#955196', '#dd5182', '#ff6e54', '#ffa600'],
  vibrant: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
  ocean: ['#3d5a80', '#98c1d9', '#e0fbfc', '#ee6c4d', '#293241'],
  sunset: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590'],
  forest: ['#004d40', '#00796b', '#009688', '#4db6ac', '#80cbc4', '#b2dfdb'],
  pastel: ['#f7d6e0', '#f2b5d4', '#e492b4', '#d66e94', '#c84a74'],
};

export const CHART_TYPES: ChartType[] = [
    { id: 'BAR_CHART', name: 'Bar Chart', description: 'Compares values across different categories.', imageUrl: 'https://picsum.photos/seed/bar/400/300' },
    { id: 'LINE_CHART', name: 'Line Chart', description: 'Shows trends over a period of time.', imageUrl: 'https://picsum.photos/seed/line/400/300' },
    { id: 'SCATTER_CHART', name: 'Scatter Chart', description: 'Displays relationships between two numeric variables.', imageUrl: 'https://picsum.photos/seed/scatter_new/400/300' },
    { id: 'COMPOSED_CHART', name: 'Composed Chart', description: 'Combines multiple chart types in a single view.', imageUrl: 'https://picsum.photos/seed/composed/400/300' },
];

export const SAMPLE_CSV_DATA = `ID,Age,Gender,Awareness,Consideration,Purchase,Advocacy,BrandA_Price,BrandB_Price,BrandC_Price
1,25,Male,1,1,0,0,5.99,6.49,5.79
2,45,Female,1,1,1,1,6.10,6.49,5.89
3,33,Female,1,0,0,0,5.99,6.59,5.79
4,52,Male,1,1,1,0,6.25,6.49,5.99
5,28,Non-binary,0,0,0,0,6.05,6.39,5.79
6,61,Female,1,1,1,1,5.99,6.49,5.89
7,19,Male,1,1,0,0,6.15,6.49,5.79
8,38,Female,1,1,1,0,5.99,6.59,5.99
9,41,Male,1,1,1,1,6.00,6.49,5.79
10,22,Female,1,0,0,0,6.30,6.29,5.89`;
