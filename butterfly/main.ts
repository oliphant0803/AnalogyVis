import * as d3 from 'd3';
import dataJson from './phase2.json';

// Set up the SVG canvas dimensions
const margin = { top: 30, right: 40, bottom: 40, left: 40 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select('#butterfly')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Process the data
const data = dataJson.map(d => ({
  nailID: d.nailID,
  totalLength: +d.totalLength,
  depthBelowSurface: +d.depthBelowSurface,
  lengthAboveSurface: +d.lengthAboveSurface
}));

// Define scales

// xScale: from -15 to 15, with 0 in the center
const maxDepth = d3.max(data, d => d.depthBelowSurface);
const maxLength = d3.max(data, d => d.lengthAboveSurface);
const maxValue = Math.max(maxDepth!, maxLength!, 15); // Ensure axis extends to at least 15

const xScale = d3.scaleLinear()
  .domain([-maxValue, maxValue])
  .range([0, width]);

// yScale: Each nailID along the vertical axis
const yScale = d3.scaleBand()
  .domain(data.map(d => d.nailID.toString()))
  .range([0, height])
  .padding(0.1);

// Define left and right colors
const depthColor = 'steelblue'; // Left side (negative values)
const lengthColor = 'orange';    // Right side (positive values)

// Add x-axis
const xAxis = d3.axisBottom(xScale)
  .ticks(10);

svg.append('g')
  .attr('transform', `translate(0,${height})`)
  .call(xAxis);

// Add y-axis
const yAxis = d3.axisLeft(yScale);

svg.append('g')
  .call(yAxis);

// Draw the bars for depthBelowSurface (left side)
svg.selectAll('.bar-depth')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar-depth')
  .attr('x', d => xScale(-d.depthBelowSurface))
  .attr('y', d => yScale(d.nailID.toString())!)
  .attr('width', d => xScale(0) - xScale(-d.depthBelowSurface))
  .attr('height', yScale.bandwidth())
  .attr('fill', depthColor);

// Draw the bars for lengthAboveSurface (right side)
svg.selectAll('.bar-length')
  .data(data)
  .enter()
  .append('rect')
  .attr('class', 'bar-length')
  .attr('x', xScale(0))
  .attr('y', d => yScale(d.nailID.toString())!)
  .attr('width', d => xScale(d.lengthAboveSurface) - xScale(0))
  .attr('height', yScale.bandwidth())
  .attr('fill', lengthColor);

// Add a vertical line at x = 0 (the central axis)
svg.append('line')
  .attr('x1', xScale(0))
  .attr('y1', 0)
  .attr('x2', xScale(0))
  .attr('y2', height)
  .attr('stroke', 'black')
  .attr('stroke-width', 1);

// Optional: Add titles for each side
svg.append('text')
  .attr('x', xScale(-maxValue / 2))
  .attr('y', -10)
  .attr('text-anchor', 'middle')
  .attr('fill', depthColor)
  .text('Depth into Wall (cm)');

svg.append('text')
  .attr('x', xScale(maxValue / 2))
  .attr('y', -10)
  .attr('text-anchor', 'middle')
  .attr('fill', lengthColor)
  .text('Exposed Length (cm)');
