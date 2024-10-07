import * as d3 from 'd3';
import { interpolateViridis } from 'd3-scale-chromatic';

interface Datum {
  student: string;
  day: string;
  value: number;
}

import dataJson from './phase1.json';
const data: Datum[] = dataJson as Datum[];

// Set dimensions and margins
const margin = { top: 50, right: 70, bottom: 50, left: 100 };
const width = 1160 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Create SVG canvas
const svg = d3.select('#heatmap')
  .append('svg')
  .attr('width', width + margin.left + margin.right + 100) // Additional space for legend
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Define data domains
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const students = ["Student A", "Student B", "Student C", "Student D", "Student E", "Student F", "Student G", "Student H"];

// Create scales with no padding
const xScale = d3.scaleBand<string>()
  .domain(days)
  .range([0, width])
  .padding(0); // Remove padding

const yScale = d3.scaleBand<string>()
  .domain(students)
  .range([0, height])
  .padding(0); // Remove padding

// Create continuous color scale
const colorScale = d3.scaleSequential<number>()
  .interpolator(interpolateViridis)
  .domain([50, 100]); // Adjust domain according to your data range

// Draw heatmap
svg.selectAll()
  .data(data)
  .enter()
  .append('rect')
  .attr('x', d => xScale(d.day) as number)
  .attr('y', d => yScale(d.student) as number)
  .attr('width', xScale.bandwidth())
  .attr('height', yScale.bandwidth())
  .style('fill', d => colorScale(d.value))
  .style('stroke', 'black');

// Add X Axis
const xAxis = d3.axisTop(xScale)
  .tickSize(0)
  .tickPadding(6);

svg.append('g')
  .attr('class', 'x axis')
  .call(xAxis)
  .selectAll('text')
  .style('text-anchor', 'middle');

// Add Y Axis
const yAxis = d3.axisLeft(yScale)
  .tickSize(0)
  .tickPadding(6);

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
  .attr('transform', `translate(${width + 40}, 0)`);

// Create gradient for legend
const defs = svg.append('defs');

const linearGradient = defs.append('linearGradient')
  .attr('id', 'linear-gradient');

linearGradient
  .attr('x1', '0%')
  .attr('y1', '100%') // From bottom to top
  .attr('x2', '0%')
  .attr('y2', '0%');

// Define the gradient stops
linearGradient.selectAll('stop')
  .data(d3.range(0, 1.01, 0.01))
  .enter()
  .append('stop')
  .attr('offset', d => `${d * 100}%`)
  .attr('stop-color', d => colorScale(50 + d * 50)); // Adjust according to domain

// Draw legend rectangle filled with gradient
legend.append('rect')
  .attr('width', legendWidth)
  .attr('height', legendHeight)
  .style('fill', 'url(#linear-gradient)');

// Add legend axis
const legendScale = d3.scaleLinear()
  .domain([50, 100])
  .range([legendHeight, 0]);

const legendAxis = d3.axisRight(legendScale)
  .ticks(5)
  .tickFormat(d => `${d}%`);

legend.append('g')
  .attr('class', 'legend-axis')
  .attr('transform', `translate(${legendWidth}, 0)`)
  .call(legendAxis);
