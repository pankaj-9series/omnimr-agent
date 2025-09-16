import { ParsedCSVData, ChartConfig } from '../types';

/**
 * A robust, self-contained function to process data for bar charts.
 * It analyzes the full dataset to determine the best aggregation strategy.
 *
 * @param csvData The full parsed CSV data.
 * @param config The chart configuration including axes and chart type.
 * @returns An array of processed data points, sorted and sliced for the top 5 results.
 */
const processBarChartData = (csvData: ParsedCSVData, config: ChartConfig): any[] => {
    const { headers, rows } = csvData;
    const xAxisIndex = headers.indexOf(config.xAxisKey!);
    const yAxisKey = config.yAxisKeys && Array.isArray(config.yAxisKeys) ? config.yAxisKeys[0] : undefined;
    const yAxisIndex = yAxisKey ? headers.indexOf(yAxisKey) : -1;

    if (xAxisIndex === -1 || yAxisIndex === -1) {
        console.error("Invalid headers provided for bar chart:", config);
        return [];
    }

    // 1. Aggregate data and collect stats in one pass
    const groupedData: { [key: string]: { sum: number; validNumericCount: number; totalCount: number } } = {};

    rows.forEach(row => {
        const categoryCell = row[xAxisIndex];
        // Skip rows that don't have a category label.
        if (categoryCell === null || categoryCell === undefined || String(categoryCell).trim() === '') {
            return;
        }
        const category = String(categoryCell);

        if (!groupedData[category]) {
            groupedData[category] = { sum: 0, validNumericCount: 0, totalCount: 0 };
        }

        const valueCell = row[yAxisIndex];
        const value = parseFloat(String(valueCell));

        // Check if the value is a valid, finite number.
        if (!isNaN(value) && isFinite(value)) {
            groupedData[category].sum += value;
            groupedData[category].validNumericCount += 1;
        }
        groupedData[category].totalCount += 1;
    });

    // 2. Determine the most appropriate aggregation method based on the collected stats.
    const totalNumericValues = Object.values(groupedData).reduce((acc, { validNumericCount }) => acc + validNumericCount, 0);
    const totalRowsInvolved = Object.values(groupedData).reduce((acc, { totalCount }) => acc + totalCount, 0);

    // Heuristic: If less than half the data for the Y-axis is numeric, treat it as categorical and perform a count.
    const isYAxisNumeric = totalRowsInvolved > 0 && (totalNumericValues / totalRowsInvolved) > 0.5;
    
    let aggregationMethod: 'SUM' | 'AVERAGE' | 'COUNT';
    
    if (!isYAxisNumeric) {
        aggregationMethod = 'COUNT';
    } else {
        const yAxisName = yAxisKey!.toLowerCase();
        const requiresAverage = yAxisName.includes('intent') || yAxisName.includes('rating') || yAxisName.includes('score') || yAxisName.includes('appeal') || yAxisName.includes('importance');
        aggregationMethod = requiresAverage ? 'AVERAGE' : 'SUM';
    }

    const processed = Object.entries(groupedData).map(([key, values]) => {
        let finalValue = 0;
        switch (aggregationMethod) {
            case 'SUM':
                finalValue = values.sum;
                break;
            case 'AVERAGE':
                finalValue = values.validNumericCount > 0 ? values.sum / values.validNumericCount : 0;
                break;
            case 'COUNT':
                finalValue = values.totalCount;
                break;
        }
        return {
            [config.xAxisKey!]: key,
            [yAxisKey!]: finalValue,
        };
    });
    
    return processed
        .sort((a, b) => (b[yAxisKey!] as number) - (a[yAxisKey!] as number))
        .slice(0, 10);
};


/**
 * Samples a column to determine if it should be treated as numeric. Used for line charts.
 */
const isColumnNumeric = (rows: (string | number)[][], colIndex: number, sampleSize = 50): boolean => {
    if (colIndex < 0) return false;
    let numericCount = 0;
    let nonEmptyCount = 0;
    
    for (let i = 0; i < Math.min(rows.length, sampleSize); i++) {
        const cell = rows[i][colIndex];
        if (cell !== null && cell !== undefined && String(cell).trim() !== '') {
            nonEmptyCount++;
            const parsed = parseFloat(String(cell));
            if (!isNaN(parsed) && isFinite(parsed)) {
                numericCount++;
            }
        }
    }

    if (nonEmptyCount === 0) return false;
    return (numericCount / nonEmptyCount) > 0.8;
};


const processLineChartData = (csvData: ParsedCSVData, config: ChartConfig): any[] => {
    const { headers, rows } = csvData;
    const xAxisIndex = headers.indexOf(config.xAxisKey!);
    if (xAxisIndex === -1) {
        console.error("Invalid X-axis header in line chart config:", config.xAxisKey);
        return [];
    }

    const seriesIndices: { header: string; index: number }[] = (config.yAxisKeys || [])
        .map(key => ({ header: key, index: headers.indexOf(key) }))
        .filter(({ header, index }) => {
            if (index === -1) {
                console.warn(`Y-Axis key '${header}' not found in headers for line chart.`);
                return false;
            }
            return isColumnNumeric(rows, index);
        });

    if (seriesIndices.length === 0) {
        console.error("No numeric data series found for the line chart with provided yAxisKeys.");
        return [];
    }

    return rows.map(row => {
        const dataPoint: { [key: string]: any } = {
            [config.xAxisKey!]: row[xAxisIndex]
        };
        seriesIndices.forEach(({ header, index }) => {
            const val = parseFloat(String(row[index]));
            dataPoint[header] = isNaN(val) ? null : val;
        });
        return dataPoint;
    });
};

const processScatterChartData = (csvData: ParsedCSVData, config: ChartConfig): any[] => {
    const { headers, rows } = csvData;
    const xAxisIndex = headers.indexOf(config.xAxisKey!);
    const yAxisIndex = headers.indexOf(config.yAxisKey!);

    if (xAxisIndex === -1 || yAxisIndex === -1) {
        console.error("Invalid headers for scatter plot:", config);
        return [];
    }

    return rows.map(row => ({
        [config.xAxisKey!]: parseFloat(String(row[xAxisIndex])),
        [config.yAxisKey!]: parseFloat(String(row[yAxisIndex])),
    })).filter(d => !isNaN(d[config.xAxisKey!]) && !isNaN(d[config.yAxisKey!]));
};


/**
 * Main dispatcher function to process chart data based on the chart type.
 */
export const processChartData = (csvData: ParsedCSVData, config: ChartConfig, chartType: string): any[] => {
    if (!csvData || !config || !config.xAxisKey) {
        return [];
    }
    
    switch (chartType) {
        case 'LINE_CHART':
        case 'COMPOSED_CHART': // Composed chart can use the same data structure as line chart
            if (!config.yAxisKeys || (Array.isArray(config.yAxisKeys) && config.yAxisKeys.length === 0)) return [];
            return processLineChartData(csvData, config);

        case 'SCATTER_CHART':
            if (!config.yAxisKey) return [];
            return processScatterChartData(csvData, config);

        case 'BAR_CHART':
        default:
            if (!config.yAxisKeys || (Array.isArray(config.yAxisKeys) && config.yAxisKeys.length === 0)) return [];
            return processBarChartData(csvData, config);
    }
};
