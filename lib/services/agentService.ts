// lib/services/agentService.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { AgentConfig } from '../types';
import { readCsvFileContent } from "./fileService"; // Import readCsvFileContent

// Configuration
const config = {
  AI_MODEL: {
    name: 'gemini-1.5-flash',
    temperature: 0.7
  },
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
// Initialize the AI model
const createModel = (): ChatGoogleGenerativeAI => {
  const modelConfig: AgentConfig = {
    model: config.AI_MODEL.name,
    temperature: config.AI_MODEL.temperature,
    apiKey: config.GOOGLE_API_KEY,
  };

  return new ChatGoogleGenerativeAI(modelConfig);
};

// Initialize the enhanced LangGraph agent with tools
const createAgent = () => {
  const model = createModel();

  // Define the function that calls the model
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);
    return { messages: [response] };
  };

  // Define the function that determines whether to continue or not
  const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1] as AIMessage;
    
    // If the LLM makes a tool call, route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      console.log(`Agent wants to use ${lastMessage.tool_calls.length} tool(s)`);
      return "tools";
    }
    // Otherwise, end the conversation
    return "__end__";
  };

  // Create the enhanced workflow with tools
  const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)

  // Compile and return the agent
  return workflow.compile();
};

// Create a singleton agent instance
const agentApp = createAgent();

// Service functions
export const processSingleMessage = async (message: string): Promise<string> => {
  try {
    const result = await agentApp.invoke({
      messages: [new HumanMessage(message)]
    });

    const response = result.messages[result.messages.length - 1];
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  } catch (error) {
    console.error("Error processing single message:", error);
    throw error;
  }
};

export const processConversation = async (messages: string[]): Promise<{
  response: string;
  conversationLength: number;
}> => {
  try {
    // Convert string messages to HumanMessage objects
    const humanMessages = messages.map(msg => new HumanMessage(msg));

    const result = await agentApp.invoke({
      messages: humanMessages
    });

    const response = result.messages[result.messages.length - 1];
    
    return {
      response: typeof response.content === 'string' ? response.content : JSON.stringify(response.content),
      conversationLength: result.messages.length
    };
  } catch (error) {
    console.error("Error processing conversation:", error);
    throw error;
  }
};

export const getChartRecommendationWithData = async (requestId: string): Promise<string> => {
  try {
    console.log(`Getting chart recommendation with data for request ID: ${requestId}`);
    const csvContent = readCsvFileContent(requestId);

    const result = await agentApp.invoke({
      messages: [new HumanMessage(`
Analyze the following CSV data and provide a complete chart solution:

<csv_data>
${csvContent}
</csv_data>

1. Recommend the BEST chart type for this data (line, bar, pie, or scatter)
2. Automatically select the most meaningful X and Y axes 
3. Generate the complete Chart.js configuration with actual processed data
4. Explain why this chart type and axes were chosen

Return a JSON response with this structure:
{
  "recommendation": "Bar chart showing revenue by region",
  "reasoning": "Bar charts are ideal for comparing categorical data. Revenue by region shows clear performance differences across geographic areas.",
  "chartConfig": {
    "type": "bar",
    "data": {
      "labels": ["North", "South", "East", "West"],
      "datasets": [{
        "label": "Revenue",
        "data": [45000, 52000, 48000, 61000],
        "backgroundColor": "#36A2EB"
      }]
    },
    "options": {
      "responsive": true,
      "plugins": {
        "title": { "display": true, "text": "Revenue by Region" }
      }
    }
  }
}

Make sure the chart data is aggregated and ready to display immediately.
`)]
    });
    
    const lastMessage = result.messages[result.messages.length - 1];
    return typeof lastMessage.content === 'string' ? lastMessage.content : JSON.stringify(lastMessage.content);
  } catch (error) {
    console.error("Error getting chart recommendation with data:", error);
    throw error;
  }
};