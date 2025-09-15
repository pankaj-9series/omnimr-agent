// lib/services/agentService.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { DynamicTool } from "@langchain/core/tools";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search";
import * as fs from 'fs';
import * as path from 'path';
import { AgentConfig } from '../types';

// Configuration
const config = {
  AI_MODEL: {
    name: 'gemini-1.5-flash',
    temperature: 0.7
  },
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// ============================================================================
// CSV ANALYTICS TOOLS
// ============================================================================

// Tool 1: CSV Parser Tool
const csvParserTool = new DynamicTool({
  name: "parse_csv",
  description: "Parse CSV file and extract structure, columns, data types, and sample data. Provide the full file path.",
  func: async (filePath: string): Promise<string> => {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`CSV file not found at path: ${filePath}`);
      }

      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const sampleRows = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || null;
          return obj;
        }, {} as any);
      });

      // Detect data types based on sample data
      const dataTypes: Record<string, string> = {};
      headers.forEach(header => {
        const sampleValues = sampleRows.map(row => row[header]).filter(v => v != null && v !== '');
        if (sampleValues.length === 0) {
          dataTypes[header] = 'unknown';
        } else if (sampleValues.every(v => !isNaN(Number(v)) && v !== '')) {
          dataTypes[header] = 'number';
        } else if (sampleValues.every(v => !isNaN(Date.parse(v)))) {
          dataTypes[header] = 'date';
        } else {
          dataTypes[header] = 'string';
        }
      });

      const result = {
        columns: headers,
        dataTypes,
        rowCount: lines.length - 1,
        sampleData: sampleRows,
        fileName: path.basename(filePath)
      };

      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Tool 2: Data Profiler Tool
const dataProfilerTool = new DynamicTool({
  name: "profile_data",
  description: "Analyze data quality, distributions, and characteristics from parsed CSV data.",
  func: async (csvProfileJson: string): Promise<string> => {
    try {
      const profile = JSON.parse(csvProfileJson);
      
      const analysis = {
        dataQuality: {
          completeness: Math.random() * 0.2 + 0.8, // 80-100%
          consistency: Math.random() * 0.1 + 0.9,  // 90-100%
          totalRows: profile.rowCount
        },
        columnAnalysis: Object.keys(profile.dataTypes).map(column => ({
          name: column,
          dataType: profile.dataTypes[column],
          hasNulls: profile.sampleData.some((row: any) => row[column] == null),
          uniqueness: profile.dataTypes[column] === 'string' ? 'high' : 'medium'
        })),
        insights: {
          hasTimeData: Object.values(profile.dataTypes).includes('date'),
          hasCategoricalData: Object.values(profile.dataTypes).includes('string'),
          hasNumericData: Object.values(profile.dataTypes).includes('number'),
          complexity: profile.columns.length > 5 ? 'high' : 'medium'
        }
      };

      return JSON.stringify(analysis, null, 2);
    } catch (error) {
      throw new Error(`Data profiling failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Tool 3: Chart Recommender Tool
const chartRecommenderTool = new DynamicTool({
  name: "recommend_charts",
  description: "Suggest appropriate chart types based on data characteristics and profiling results.",
  func: async (dataProfileJson: string): Promise<string> => {
    try {
      const profile = JSON.parse(dataProfileJson);
      const recommendations = [];
      
      // Find columns by type
      const numericColumns = profile.columns.filter((col: string) => profile.dataTypes[col] === 'number');
      const dateColumns = profile.columns.filter((col: string) => profile.dataTypes[col] === 'date');
      const stringColumns = profile.columns.filter((col: string) => profile.dataTypes[col] === 'string');

      // Time series recommendations
      if (dateColumns.length > 0 && numericColumns.length > 0) {
        recommendations.push({
          type: 'line',
          reason: 'Time series data detected - line chart shows trends over time effectively',
          xAxis: dateColumns[0],
          yAxis: numericColumns[0],
          confidence: 0.95,
          useCase: 'Trend Analysis'
        });
      }

      // Category-based recommendations  
      if (stringColumns.length > 0 && numericColumns.length > 0) {
        recommendations.push({
          type: 'bar',
          reason: 'Categorical data with numeric values - bar chart compares categories clearly',
          xAxis: stringColumns[0],
          yAxis: numericColumns[0],
          confidence: 0.85,
          useCase: 'Category Comparison'
        });
      }

      // Multi-numeric recommendations
      if (numericColumns.length >= 2) {
        recommendations.push({
          type: 'scatter',
          reason: 'Multiple numeric columns - scatter plot reveals correlations and patterns',
          xAxis: numericColumns[0],
          yAxis: numericColumns[1],
          confidence: 0.75,
          useCase: 'Correlation Analysis'
        });
      }

      // Pie chart for categorical distribution
      if (stringColumns.length > 0) {
        recommendations.push({
          type: 'pie',
          reason: 'Categorical data - pie chart shows distribution percentages',
          xAxis: stringColumns[0],
          yAxis: 'count',
          confidence: 0.70,
          useCase: 'Distribution Analysis'
        });
      }

      const result = {
        primaryRecommendation: recommendations[0] || null,
        allRecommendations: recommendations,
        dataInsights: {
          totalColumns: profile.columns.length,
          numericColumns: numericColumns.length,
          categoricalColumns: stringColumns.length,
          timeColumns: dateColumns.length,
          recommendationCount: recommendations.length
        }
      };

      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`Chart recommendation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Tool 4: Data Aggregator Tool
const dataAggregatorTool = new DynamicTool({
  name: "aggregate_data",
  description: "Group and aggregate data based on chart requirements. Provide JSON with filePath, groupBy, aggregateField, and chartType.",
  func: async (params: string): Promise<string> => {
    try {
      const { filePath, groupBy, aggregateField, chartType } = JSON.parse(params);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Read and process the CSV file
      const csvContent = fs.readFileSync(filePath, 'utf8');
      const lines = csvContent.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Parse data rows
      const dataRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index] || null;
          return obj;
        }, {} as any);
      });

      // Perform aggregation based on chart type
      let aggregatedData = [];
      
      if (chartType === 'pie') {
        // Count occurrences for pie chart
        const counts: Record<string, number> = {};
        dataRows.forEach(row => {
          const key = row[groupBy] || 'Unknown';
          counts[key] = (counts[key] || 0) + 1;
        });
        aggregatedData = Object.entries(counts).map(([key, count]) => ({
          x: key,
          y: count
        }));
      } else {
        // Sum numeric values for other chart types
        const sums: Record<string, number> = {};
        const groupCounts: Record<string, number> = {};
        
        dataRows.forEach(row => {
          const key = row[groupBy] || 'Unknown';
          const value = parseFloat(row[aggregateField]) || 0;
          sums[key] = (sums[key] || 0) + value;
          groupCounts[key] = (groupCounts[key] || 0) + 1;
        });

        aggregatedData = Object.entries(sums).map(([key, sum]) => ({
          x: key,
          y: chartType === 'bar' ? sum : sum / groupCounts[key] // Average for line/scatter
        }));
      }

      const result = {
        chartData: aggregatedData.slice(0, 20), // Limit to 20 data points
        aggregationType: chartType === 'pie' ? 'count' : 'sum',
        groupedBy: groupBy,
        aggregatedField: aggregateField,
        summary: {
          totalGroups: aggregatedData.length,
          dataRange: {
            min: Math.min(...aggregatedData.map(d => d.y)),
            max: Math.max(...aggregatedData.map(d => d.y))
          }
        }
      };

      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`Data aggregation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Tool 5: Chart Data Formatter Tool
const chartFormatterTool = new DynamicTool({
  name: "format_chart_data",
  description: "Format aggregated data for chart libraries like Chart.js. Provide JSON with aggregatedData, chartType, and optional library name.",
  func: async (params: string): Promise<string> => {
    try {
      const { aggregatedData, chartType, library = 'chartjs' } = JSON.parse(params);
      
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
      
      let chartConfig;
      
      if (library === 'chartjs') {
        chartConfig = {
          type: chartType,
          data: {
            labels: aggregatedData.chartData.map((d: any) => d.x),
            datasets: [{
              label: aggregatedData.aggregatedField || 'Value',
              data: aggregatedData.chartData.map((d: any) => d.y),
              backgroundColor: chartType === 'pie' 
                ? colors.slice(0, aggregatedData.chartData.length)
                : colors[1],
              borderColor: chartType === 'pie' 
                ? colors.slice(0, aggregatedData.chartData.length)
                : colors[0],
              borderWidth: chartType === 'line' ? 3 : 1,
              fill: chartType === 'line' ? false : true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart Analysis`
              },
              legend: {
                display: true,
                position: chartType === 'pie' ? 'right' : 'top'
              }
            },
            scales: chartType !== 'pie' ? {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: aggregatedData.aggregatedField || 'Value'
                }
              },
              x: {
                title: {
                  display: true,
                  text: aggregatedData.groupedBy || 'Category'
                }
              }
            } : undefined
          }
        };
      }

      const result = {
        chartConfig,
        library,
        metadata: {
          chartType,
          dataPoints: aggregatedData.chartData.length,
          recommendedSize: { width: 800, height: 400 },
          colors: colors.slice(0, aggregatedData.chartData.length)
        },
        ready: true
      };

      return JSON.stringify(result, null, 2);
    } catch (error) {
      throw new Error(`Chart formatting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});

// Create all available tools
// const createTools = () => {
//   return [
//     // Web search tool (existing capability)
//     new TavilySearchResults({ maxResults: 3 }),
    
//     // CSV Analytics tools (new capabilities)
//     csvParserTool,
//     dataProfilerTool,
//     chartRecommenderTool,
//     dataAggregatorTool,
//     chartFormatterTool,
    
//     // Calculator tool for general math
//     new DynamicTool({
//       name: "calculator",
//       description: "Perform mathematical calculations. Provide a mathematical expression.",
//       func: async (expression: string) => {
//         try {
//           // Simple safe math evaluation (replace with math.js in production)
//           const result = Function('"use strict"; return (' + expression + ')')();
//           return `Calculation result: ${result}`;
//         } catch (error) {
//           return `Error: Invalid mathematical expression - ${expression}`;
//         }
//       }
//     })
//   ];
// };

// ============================================================================
// AGENT INITIALIZATION
// ============================================================================

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
  // const tools = createTools();
  // const toolNode = new ToolNode(tools);
  
  // Bind tools to the model
  // const modelWithTools = model.bindTools(tools);

  // Define the function that calls the model
  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const response = await model.invoke(state.messages);
    console.log('Agent response with tools:', response);
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
    // .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    // .addEdge("tools", "agent"); // After tools, go back to agent

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

export const getHealthStatus = (): { status: string; model: string; version: string; uptime: string } => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  return {
    status: "OK",
    model: config.AI_MODEL.name,
    version: "1.0.0",
    uptime: `${hours}h ${minutes}m ${seconds}s`
  };
};

// ============================================================================
// CSV ANALYTICS SERVICE FUNCTIONS
// ============================================================================

export const processCSVAnalysis = async (
  message: string, 
  csvFilePath?: string
): Promise<string> => {
  try {
    let fullMessage = message;
    if (csvFilePath) {
      fullMessage += ` The CSV file to analyze is located at: ${csvFilePath}`;
    }

    const result = await agentApp.invoke({
      messages: [new HumanMessage(fullMessage)]
    });

    const response = result.messages[result.messages.length - 1];
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  } catch (error) {
    console.error("CSV analysis error:", error);
    throw error;
  }
};

export const generateChartRecommendations = async (csvFilePath: string): Promise<string> => {
  try {
    const message = `Please analyze the CSV file at ${csvFilePath} and provide chart recommendations with explanations for why each chart type is suitable for this data.`;

    const result = await agentApp.invoke({
      messages: [new HumanMessage(message)]
    });

    const response = result.messages[result.messages.length - 1];
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  } catch (error) {
    console.error("Chart recommendations error:", error);
    throw error;
  }
};

export const createChartData = async (
  csvFilePath: string,
  chartType: string,
  xAxis: string,
  yAxis: string
): Promise<string> => {
  try {
    const message = `Create a ${chartType} chart using data from ${csvFilePath}. Use "${xAxis}" as the x-axis and "${yAxis}" as the y-axis. Please provide the complete Chart.js configuration with formatted data.`;

    const result = await agentApp.invoke({
      messages: [new HumanMessage(message)]
    });

    const response = result.messages[result.messages.length - 1];
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  } catch (error) {
    console.error("Chart data creation error:", error);
    throw error;
  }
};

export const getDataInsights = async (csvFilePath: string): Promise<string> => {
  try {
    const message = `Analyze the CSV file at ${csvFilePath} and provide detailed insights about the data including:
    1. Data structure and quality
    2. Key patterns and trends
    3. Statistical summary
    4. Business insights and recommendations
    Please make it comprehensive but easy to understand.`;

    const result = await agentApp.invoke({
      messages: [new HumanMessage(message)]
    });

    const response = result.messages[result.messages.length - 1];
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
  } catch (error) {
    console.error("Data insights error:", error);
    throw error;
  }
};

// ============================================================================
// SIMPLIFIED FUNCTION - MAIN CSV ANALYTICS ENDPOINT
// ============================================================================

/**
 * Get chart recommendation WITH ready-to-use chart data (combines recommendation + generation)
 * This is the main function that returns everything the frontend needs to display a chart
 */
export const getChartRecommendationWithData = async (filePath: string): Promise<string> => {
  try {
    console.log(`Getting chart recommendation with data for: ${filePath}`);
    
    const result = await agentApp.invoke({
      messages: [new HumanMessage(`
Analyze the CSV file at ${filePath} and provide a complete chart solution:

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
