// app/api/csv/suggestion/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChartRecommendationWithData } from '@/lib/services/agentService';
import { ApiError, AnalyticsResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { request_id: requestId } = body;

    if (!requestId) {
      return NextResponse.json({
        error: "Request ID is required",
        message: "Please provide a request_id in the request body.",
        example: { 
          request_id: "your_unique_request_id"
        }
      } as ApiError, { status: 400 });
    }

    const suggestionResult = await getChartRecommendationWithData(requestId);

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
