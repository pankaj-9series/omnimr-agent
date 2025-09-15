// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getHealthStatus } from '@/lib/services/agentService';
import { HealthResponse } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const healthData = getHealthStatus();
    
    const response: HealthResponse = {
      status: healthData.status,
      timestamp: new Date().toISOString(),
      version: healthData.version,
      uptime: healthData.uptime
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      error: "Health check failed",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
