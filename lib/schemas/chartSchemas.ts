import { z } from 'zod';

const ZBarColors = z.object({
  key: z.string(),
  color: z.string(),
}).array().optional();

const ZYAxisKeysComposed = z.object({
  bar: z.string().array().optional(),
  line: z.string().array().optional(),
  area: z.string().array().optional(),
}).optional();

export const ZChartJsChartConfig = z.object({
  type: z.string(),
  data: z.object({
    labels: z.array(z.string()).optional(),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.any()), // Can be numbers or objects like {x, y}
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      fill: z.boolean().optional(),
      type: z.string().optional(), // For composed charts, can be 'bar', 'line', 'scatter'
    })),
  }),
  options: z.object({
    responsive: z.boolean().optional(),
    plugins: z.object({
      title: z.object({
        display: z.boolean().optional(),
        text: z.string().optional(),
      }).optional(),
    }).optional(),
    scales: z.record(z.string(), z.any()).optional(), // Made scales a generic record
  }).optional(),
});

export const ZOpsPlanAggregate = z.object({
  fn: z.string(),
  col: z.string(),
});

export const ZFilterCondition = z.object({
  col: z.string(),
  op: z.string(),
  val: z.any().optional(), // Made optional
});

export const ZOpsPlanOperation = z.object({
  op: z.string().describe("Operation type (e.g., \"filter\", \"groupby\", \"aggregate\")."),
  by: z.array(z.string()).optional().describe("List of columns to group by (for \"groupby\" operation)."),
  aggs: z.array(ZOpsPlanAggregate).optional().describe("List of aggregations to apply (for \"aggregate\" operation)."),
  where: z.array(z.object({
    col: z.string().describe("Column name for filtering."),
    op: z.string().describe("Filter operator (e.g., \"eq\", \"gt\")."),
    val: z.any().optional().describe("Value to filter by."),
  })).optional().describe("List of filter conditions (for \"filter\" operation)."),
});

export const ZOpsPlan = z.object({
  plan_version: z.string(),
  x: z.string(),
  y: z.object({
    field: z.string(),
    fn: z.string(),
  }).array().describe("List of Y-axis fields and their aggregation functions."),
  seriesBy: z.string().optional().describe("Optional dimension field to create series (e.g., for multi-line charts)."), // Removed .nullable()
  output_format: z.string().describe("Desired output format (e.g., \"wide\")."),
  ops: ZOpsPlanOperation.array().describe("Array of data transformation operations (filter, groupby, aggregate)."),
});

// Specific schema for the chartConfig within a Suggestion, aligning with the LLM output
export const ZSuggestionChartConfig = z.object({
  type: z.string(), // BAR_CHART, LINE_CHART, etc.
  data: z.object({
    labels: z.string().array(),
    datasets: z.array(z.object({
      label: z.string(),
      data: z.array(z.number()),
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      fill: z.boolean().optional(),
      datasetType: z.string().optional(), // Renamed 'type' to 'datasetType'
    })),
  }),
  options: z.object({
    responsive: z.boolean().optional(),
    plugins: z.object({
      title: z.object({
        display: z.boolean().optional(),
        text: z.string().optional(),
      }).optional(),
    }).optional(),
    scales: z.object({
      x: z.object({
        title: z.object({
          display: z.boolean().optional(),
          text: z.string().optional(),
        }).optional(),
      }).optional(),
      y: z.object({
        title: z.object({
          display: z.boolean().optional(),
          text: z.string().optional(),
        }).optional(),
      }).optional(),
    }).optional(),
  }).optional(),
});

export const ZSuggestion = z.object({
  recommendation: z.string(),
  reasoning: z.string(),
  chartConfig: ZSuggestionChartConfig,
  opsPlan: ZOpsPlan.optional(), // Added optional OpsPlan schema
});

export const ZSuggestionsResponse = z.object({
  suggestions: z.array(ZSuggestion),
});
