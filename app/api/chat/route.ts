// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processSingleMessage, processConversation } from '@/lib/services/agentService';
import { ChatRequest, ConversationRequest, ApiResponse, ApiError } from '@/lib/types';
import { readCsvFileContent, validateFilePath } from '@/lib/services/fileService';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, filePath, messages }: ChatRequest & ConversationRequest = body;

    // Handle single message chat
    if (!message) {
      return NextResponse.json({
        error: "Message is required",
        example: { 
          message: "Hello, how are you?",
          filePath: "/path/to/uploaded/file.csv (optional)"
        }
      } as ApiError, { status: 400 });
    }
    
    // Handle single message
    if (message) {

      // If filePath is provided, enhance the message with CSV context
      let enhancedMessage = message;
      if (filePath) {
        if (!validateFilePath(filePath)) {
          return NextResponse.json({
            error: "Invalid file path",
            message: "The provided file path is invalid or not a CSV file.",
            filePath: filePath
          } as ApiError, { status: 400 });
        }
        const csvContent = readCsvFileContent(filePath);
        const records = parse(csvContent, { columns: true, skip_empty_lines: true });
        const csvJson = JSON.stringify(records.slice(0,3));
        enhancedMessage = `${message}\n\nPlease refer to the following CSV data in JSON format: ${csvJson}`;
      }

      const responseText = await processSingleMessage(enhancedMessage);

      const response: ApiResponse = {
        success: true,
        response: responseText,
        timestamp: new Date().toISOString()
      };

      return NextResponse.json(response);
    }

    // Handle conversation
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
