import { NextRequest, NextResponse } from 'next/server';
import { GetChartDataPayload } from '@/lib/services/chartService'; // Keep types from chartService
import { ApiError } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.omnimr.staging9.com/api/v1'; // External API base URL
const CHART_DATA_ENDPOINT = `${API_BASE_URL}/get/chart/data/`;

export async function POST(request: NextRequest) {
  try {
    const body: GetChartDataPayload = await request.json();

    if (!body || !body.chart || !body.request_id) {
      return NextResponse.json({
        error: "Invalid payload",
        message: "Chart configuration and request ID are required.",
      } as ApiError, { status: 400 });
    }

    // Make the external API call directly from this Next.js API route
    const externalApiResponse = await fetch(CHART_DATA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body), // Forward the entire payload
    });

    if (!externalApiResponse.ok) {
      const errorText = await externalApiResponse.text();
      throw new Error(`External API error! status: ${externalApiResponse.status}, ${errorText}`);
    }

    const data = await externalApiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching chart data from external API:", error);
    return NextResponse.json({
      error: "Failed to fetch chart data",
      message: error instanceof Error ? error.message : "Unknown error"
    } as ApiError, { status: 500 });
  }
}
