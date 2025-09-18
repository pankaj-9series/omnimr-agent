import { OpsPlan, OpsPlanOperation, OpsPlanAggregate } from '@/lib/types';

export interface Row {
  [key: string]: any;
}

interface FilterCondition {
  col: string;
  op: string;
  val?: any; // Made optional
}

const applyFilter = (data: Row[], where: FilterCondition[]): Row[] => {
  let filteredData = [...data];

  for (const cond of where) {
    const { col, op, val } = cond;
    filteredData = filteredData.filter(row => {
      const cellValue = row[col];

      switch (op) {
        case "eq": return cellValue == val;
        case "neq": return cellValue != val;
        case "in": return (val as any[]).includes(cellValue);
        case "nin": return !(val as any[]).includes(cellValue);
        case "gte": return cellValue >= val;
        case "lte": return cellValue <= val;
        case "gt": return cellValue > val;
        case "lt": return cellValue < val;
        case "contains": return String(cellValue).includes(String(val));
        case "not_contains": return !String(cellValue).includes(String(val));
        default: throw new Error(`Unsupported filter operation: ${op}`);
      }
    });
  }
  return filteredData;
};

const groupbyAggregate = (data: Row[], by: string[], aggs: OpsPlanAggregate[]): Row[] => {
  const grouped: { [key: string]: Row[] } = {};
  data.forEach(row => {
    const key = by.map(col => String(row[col])).join('|');
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(row);
  });

  const result: Row[] = [];
  for (const key in grouped) {
    const group = grouped[key];
    const newRow: Row = {};

    // Add groupby columns to the new row
    by.forEach(col => {
      newRow[col] = group[0][col];
    });

    // Apply aggregations
    aggs.forEach(agg => {
      const { fn, col } = agg;

      switch (fn) {
        case "count":
          newRow[col] = group.length; // Count of rows in the group
          break;
        case "sum":
          newRow[col] = group.reduce((acc, curr) => acc + (parseFloat(curr[col]) || 0), 0);
          break;
        case "mean":
          const sum = group.reduce((acc, curr) => acc + (parseFloat(curr[col]) || 0), 0);
          newRow[col] = sum / group.length;
          break;
        case "avg": // Alias for mean
          const sumAvg = group.reduce((acc, curr) => acc + (parseFloat(curr[col]) || 0), 0);
          newRow[col] = sumAvg / group.length;
          break;
        case "median":
          const sorted = group.map(r => parseFloat(r[col]) || 0).sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          newRow[col] = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
          break;
        case "min":
          newRow[col] = Math.min(...group.map(r => parseFloat(r[col]) || Infinity));
          break;
        case "max":
          newRow[col] = Math.max(...group.map(r => parseFloat(r[col]) || -Infinity));
          break;
        case "nunique": // Number of unique values for the column in the group
          const uniqueValues = new Set(group.map(r => r[col]));
          newRow[col] = uniqueValues.size;
          break;
        case "size": // Total number of items in each group
          newRow[col] = group.length;
          break;
        default: throw new Error(`Unsupported aggregation function: ${fn}`);
      }
    });
    result.push(newRow);
  }
  return result;
};

export const runChartOps = (data: Row[], plan: OpsPlan): Row[] => {
  let processedData = [...data];

  if (!plan.ops || plan.ops.length === 0) {
    const xKey = plan.x;
    const yKeys = plan.y.map(y => y.field);
    return processedData.map(row => {
      const newRow: Row = {};
      if (row[xKey] !== undefined) newRow[xKey] = row[xKey];
      yKeys.forEach(key => {
        if (row[key] !== undefined) newRow[key] = row[key];
      });
      return newRow;
    }).filter(row => {
      // Ensure all keys are present and not null/undefined
      return Object.values(row).every(val => val !== null && val !== undefined);
    });
  }

  let groupByCols: string[] | null = null;
  let aggregates: OpsPlanAggregate[] | null = null;

  for (const step of plan.ops) {
    if (step.op === "filter" && step.where) {
      processedData = applyFilter(processedData, step.where as FilterCondition[]);
    }
    if (step.op === "groupby" && step.by) {
      groupByCols = step.by;
    }
    if (step.op === "aggregate" && step.aggs) {
      aggregates = step.aggs;
    }
  }

  if (groupByCols && aggregates) {
    processedData = groupbyAggregate(processedData, groupByCols, aggregates);
  }

  const xKey = plan.x;
  const yKeys = plan.y.map(y => y.field);

  return processedData.map(row => {
    const newRow: Row = {};
    if (row[xKey] !== undefined) newRow[xKey] = row[xKey];
    yKeys.forEach(key => {
      if (row[key] !== undefined) newRow[key] = row[key];
    });
    return newRow;
  }).filter(row => {
    // Ensure all keys are present and not null/undefined
    return Object.values(row).every(val => val !== null && val !== undefined);
  });
};
