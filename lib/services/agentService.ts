// lib/services/agentService.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { AgentConfig } from '../types';
import { getSummarizedCsvContent } from "./fileService";
import { ZSuggestionsResponse } from '../schemas/chartSchemas'; // Import the Zod schema
import { z } from 'zod'; // Correct import for z

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
  const model = createModel().withStructuredOutput(ZSuggestionsResponse, {
    name: "extract" // Specify the function name as 'extract'
  });

  // Define the function that calls the model
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);
    let finalToolCalls = [{
      name: "extract", // This must match the name used in withStructuredOutput
      args: response as Record<string, any>,
      id: `call_${Date.now()}` // Unique ID for the tool call
    }];

    // Construct a new AIMessage with empty content, ensuring tool_calls carries the structured output
    const aiMessage = new AIMessage({
      content: "", // Ensure content is a simple string for Langgraph's state
      tool_calls: finalToolCalls,
    });
    return { messages: [aiMessage] };
  };

  // Define the function that determines whether to continue or not
  const shouldContinue = ({ messages }: typeof MessagesAnnotation.State) => {
    const lastMessage = messages[messages.length - 1];

    // If the last message is an AIMessage and explicitly has tool_calls, route to process them.
    if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
      console.log(`Agent generated structured output with ${lastMessage.tool_calls.length} tool call(s).`);
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

export const getChartRecommendationWithData = async (requestId: string): Promise<z.infer<typeof ZSuggestionsResponse>> => {
  try {
    console.log(`Getting chart recommendation with data for request ID: ${requestId}`);
    const summarizedCsvContent = getSummarizedCsvContent(requestId, 3); // Get headers and first 3 rows
    console.log(`summarizedCsvContent: ${summarizedCsvContent}`);
    const promptMessage = new HumanMessage(`
# Expert Data Visualization Analyst System Prompt

You are an **Expert Data Visualization Analyst**. Analyze any provided dataset and generate intelligent chart suggestions that reveal meaningful insights and patterns. Your output must be a JSON object with a 'suggestions' array, strictly conforming to the provided schema.

## Available Chart Types

• **BAR_CHART**: Categorical comparisons, rankings, group analysis
• **LINE_CHART**: Trends, progressions, sequential relationships  
• **SCATTER_CHART**: Correlations, two-variable relationships, outlier detection
• **COMPOSED_CHART**: Multi-dimensional analysis combining line + bar + area

## Your Analysis Process

### 1. Data Examination
• Review column names, data types, and value patterns
• Identify categorical vs numerical variables
• Spot potential relationships and grouping opportunities

### 2. Insight Discovery
• **Segmentation**: How do metrics vary across different groups?
• **Relationships**: Which variables correlate or influence each other?
• **Distributions**: What patterns exist in the data spread?
• **Comparisons**: Which categories, groups, or time periods differ significantly?
• **Trends**: Are there progressions, cycles, or directional changes?

### 3. Chart Strategy
• Match data characteristics to optimal chart types
• Select meaningful variable combinations
• Choose groupings that reveal clear patterns
• Design titles that communicate the key insight

## Requirements

### Quantity & Diversity
• **Generate minimum 10 chart suggestions**
• **Multiple chart types** - don't overuse any single type
• **Varied data combinations** - explore different variable pairs/groups
• **Different analysis angles** - segmentation, correlation, comparison, trends

### Quality Standards
• **Clear, insight-driven titles** - not just "Age vs Income"
• **Smart color coding** - enhance readability and meaning
• **Proper axis labels** - descriptive and clear
• **Valid data mapping** - only use columns that exist in the dataset
• **Business reasoning** - explain why each chart provides value

### Configuration Accuracy
• **For ALL Chart Suggestions: When data transformation (filtering, grouping, aggregation) is required to prepare the data for the chart, the \`opsPlan\` MUST include an \`ops\` array with the necessary \`filter\`, \`groupby\`, and \`aggregate\` operations.** This is crucial for producing numerical data for charting from raw or categorical fields.
• **BAR_CHART**: Choose categorical grouping variables and numerical metrics. If the Y-axis metric is categorical, use an \`ops\` operation (e.g., \`groupby\` and \`aggregate\` with \`count\`) to produce numerical values.
• **LINE_CHART**: Select sequential/ordered variables for meaningful progressions. If aggregation is needed over time, include \`ops\` for time series resampling or other aggregations.
• **SCATTER_CHART**: Pick variable pairs with potential relationships. If a measure needs aggregation before plotting, include \`ops\` (e.g., \`mean\`, \`sum\`).
• **COMPOSED_CHART**: Combine related metrics that tell a comprehensive story. Always include \`ops\` for any required aggregations or filters for constituent charts.

### Example OpsPlan for Bar Chart Aggregation:
\`\`\`json
{
  \"plan_version\": \"1.0\",
  \"x\": \"region\",
  \"y\": [{\"field\": \"customer_id\", \"fn\": \"count\"}],
  \"seriesBy\": null,
  \"output_format\": \"wide\",
  \"ops\": [
    {\"op\": \"groupby\", \"by\": [\"region\"]},
    {\"op\": \"aggregate\", \"aggs\": [{\"fn\": \"count\", \"col\": \"customer_id\"}]}
  ]
}
\`\`\`

## Data to Analyze
<csv_data>
${summarizedCsvContent}
</csv_data>
              `);

    const result = await agentApp.invoke({
      messages: [promptMessage]
    });

    const lastMessage = result.messages[result.messages.length - 1];

    // Explicitly extract structured data from tool_calls args
    const toolCall = (lastMessage as AIMessage).tool_calls?.[0];
    if (toolCall && toolCall.name === 'extract' && toolCall.args) {
      const structuredOutput = ZSuggestionsResponse.parse(toolCall.args);
      return structuredOutput;
    }

    // Fallback if structured output is not in tool_calls (this path should be rare now)
    throw new Error("LLM did not return structured output in tool_calls as expected.");

  } catch (error) {
    console.error("Error getting chart recommendation with data:", error);
    throw error;
  }
};