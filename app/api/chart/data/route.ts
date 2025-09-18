import { NextRequest, NextResponse } from 'next/server';
import { GetChartDataPayload } from '@/lib/services/chartService';
import { readCsvFileContent } from '@/lib/services/fileService';
import { runChartOps, Row } from '@/lib/utils/chartProcessingService'; // Import runChartOps and Row
import { parse } from 'csv-parse/sync'; // For CSV parsing

export async function POST(req: NextRequest) {
  try {
    const payload: GetChartDataPayload = await req.json();
    const { request_id, chart } = payload;

    if (!request_id || !chart || !chart.ops_plan) {
      return NextResponse.json({ error: "Missing request_id or chart operations plan." }, { status: 400 });
    }

    // Read the CSV content
    const csvContent = readCsvFileContent(request_id);
    if (!csvContent) {
      return NextResponse.json({ error: "CSV file not found or empty." }, { status: 404 });
    }

    // Parse CSV content using csv-parse/sync
    const records = parse(csvContent, {
      columns: true, // Treat the first row as column headers
      skip_empty_lines: true,
      cast: true, // Attempt to cast values to appropriate types (numbers, booleans, etc.)
    });

    // Run chart operations on the parsed data
    const processedChartData = runChartOps(records as Row[], chart.ops_plan);

    return NextResponse.json(processedChartData);
  } catch (error) {
    console.error("Error in chart data API route:", error);
    return NextResponse.json({ error: "Failed to process chart data." }, { status: 500 });
  }
}
