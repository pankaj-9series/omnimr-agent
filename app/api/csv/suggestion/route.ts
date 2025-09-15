// app/api/csv/suggestion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChartRecommendationWithData } from '@/lib/services/agentService';
import { validateFilePath } from '@/lib/services/fileService';
import { ApiError, AnalyticsResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath } = body;

    if (!filePath || !validateFilePath(filePath)) {
      return NextResponse.json({
        error: "Valid file path is required",
        message: "Please upload a CSV file first using /api/csv/upload endpoint",
        example: { 
          filePath: "/path/to/uploaded/file.csv"
        }
      } as ApiError, { status: 400 });
    }

    // Get chart recommendation AND chart data in one call
    const suggestionResult = await getChartRecommendationWithData(filePath);

    const response: AnalyticsResponse = {
      success: true,
      response: suggestionResult,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chart suggestion error:", error);
    return NextResponse.json({
      error: "Chart suggestion failed",
      message: error instanceof Error ? error.message : "Unknown error"
    } as ApiError, { status: 500 });
  }
}
