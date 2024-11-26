import * as d3 from 'd3';

// Define interfaces matching your JSON structure
interface Column {
  column: number;
  grid: string;
  zoneTemperature: number;
  itemsCategory: string;
  name: string;
}

interface Datum {
  row: number;
  columns: Column[];
}

// Import data
import dataJson from './phase2.json';
const data: Column[] = dataJson.flatMap((d: Datum) => d.columns);

// Set dimensions and margins
const margin = { top: 50, right: 50, bottom: 50, left: 100 };
const width = 1160 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Create SVG canvas
const svg = d3.select('body')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Define data domains
const rows = Array.from(new Set(data.map(d => d.grid))).sort();
const columns = Array.from(new Set(data.map(d => d.column.toString())));

// Create scales
const xScale = d3.scaleBand<string>()
  .domain(columns)
  .range([0, width])
  .padding(0);

const yScale = d3.scaleBand<string>()
  .domain(rows)
  .range([0, height])
  .padding(0);

// Create custom color scale
const colorScale = d3.scaleSequential<number>()
  .domain([-24, 60])
  .interpolator(d3.interpolateRgbBasis(['#33ccff', 'white', 'red']));

// Draw heatmap
svg.selectAll()
  .data(data)
  .enter()
  .append('rect')
  .attr('x', d => xScale(d.column.toString()) as number)
  .attr('y', d => yScale(d.grid) as number)
  .attr('width', xScale.bandwidth())
  .attr('height', yScale.bandwidth())
  .style('fill', d => colorScale(d.zoneTemperature))
  .style('stroke', 'black');

// Add X Axis
const xAxis = d3.axisTop(xScale).tickSize(0).tickPadding(6);

svg.append('g')
  .attr('class', 'x axis')
  .call(xAxis)
  .selectAll('text')
  .style('text-anchor', 'middle');

// Add Y Axis
const yAxis = d3.axisLeft(yScale).tickSize(0).tickPadding(6);

svg.append('g')
  .attr('class', 'y axis')
  .call(yAxis)
  .selectAll('text')
  .style('text-anchor', 'end');

// Create a group for the legend
const legendWidth = 20;
const legendHeight = height;

const legend = svg.append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(-${margin.left / 2}, 0)`);

// Create gradient for legend
const defs = svg.append('defs');

const linearGradient = defs.append('linearGradient')
  .attr('id', 'linear-gradient');

linearGradient
  .attr('x1', '0%')
  .attr('y1', '100%')
  .attr('x2', '0%')
  .attr('y2', '0%');

// Define the gradient stops
linearGradient.selectAll('stop')
  .data([
    { offset: '0%', color: '#33ccff' },
    { offset: '30%', color: 'white' },
    { offset: '100%', color: 'red' }
  ])
  .enter()
  .append('stop')
  .attr('offset', d => d.offset)
  .attr('stop-color', d => d.color);

// Draw legend rectangle filled with gradient
legend.append('rect')
  .attr('width', legendWidth)
  .attr('height', legendHeight)
  .style('fill', 'url(#linear-gradient)');

// Add legend axis
const legendScale = d3.scaleLinear()
  .domain([60, -24])
  .range([0, legendHeight]);

const legendAxis = d3.axisLeft(legendScale)
  .tickValues(d3.range(60, -25, -6))
  .tickFormat(d => `${d}°C`);

legend.append('g')
  .attr('class', 'legend-axis')
  .attr('transform', `translate(${legendWidth-15}, 0)`)
  .call(legendAxis);

// Draw heatmap rectangles
svg.selectAll('.cell')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'cell')
  .attr('x', d => xScale(d.column.toString()) as number)
  .attr('y', d => yScale(d.grid) as number)
  .attr('width', xScale.bandwidth())
  .attr('height', yScale.bandwidth())
  .style('fill', d => colorScale(d.zoneTemperature))
  .style('stroke', 'black');

// Add text labels for itemCategory
svg.selectAll('.label')
  .data(data)
  .enter()
  .append('text')
  .attr('x', d => (xScale(d.column.toString()) as number) + xScale.bandwidth() / 2)
  .attr('y', d => (yScale(d.grid) as number) + yScale.bandwidth() / 2)
  .attr('dy', '.35em') // vertical alignment
  .text(d => d.itemsCategory)
  .attr('text-anchor', 'middle')
  .style('fill', 'black') // Text color, adjust based on readability
  .style('font-size', '15px'); // Font size, adjust for better fit