// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processSingleMessage, processConversation } from '@/lib/services/agentService';
import { ChatRequest, ConversationRequest, ApiResponse, ApiError } from '@/lib/types';
import { readCsvFileContent, validateFileRequest } from '@/lib/services/fileService';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, request_id: requestId, messages }: ChatRequest & ConversationRequest = body;

    if (!message) {
      return NextResponse.json({
        error: "Message is required",
        example: { 
          message: "Hello, how are you?",
          request_id: "your_unique_request_id (optional)"
        }
      } as ApiError, { status: 400 });
    }
    
    if (message) {
      let enhancedMessage = message;
      if (requestId) {
        try {
          validateFileRequest(requestId); // Ensure file exists for the requestId
          const csvContent = readCsvFileContent(requestId);
          const records = parse(csvContent, { columns: true, skip_empty_lines: true });
          const csvJson = JSON.stringify(records.slice(0,3));
          enhancedMessage = `${message}\n\nPlease refer to the following CSV data in JSON format: ${csvJson}`;
        } catch (fileError) {
          console.warn(`Could not load CSV for request ID ${requestId}:`, fileError);
          // Optionally return an error, but for chat, we might proceed without CSV context
        }
      }

      const responseText = await processSingleMessage(enhancedMessage);

      const response: ApiResponse = {
        success: true,
        response: responseText,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    if (messages) {
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({
          error: "Messages array is required",
          example: { 
            messages: [
              "Hello",
              "How are you?", 
              "Tell me about AI"
            ]
          }
        } as ApiError, { status: 400 });
      }

      const result = await processConversation(messages);

      const response: ApiResponse = {
        success: true,
        response: result.response,
        conversationLength: result.conversationLength,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    return NextResponse.json({
      error: "Either 'message' or 'messages' is required",
      example: { 
        message: "Hello, how are you?",
        messages: ["Hello", "How are you?"]
      }
    } as ApiError, { status: 400 });

  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    } as ApiError, { status: 500 });
  }
}
