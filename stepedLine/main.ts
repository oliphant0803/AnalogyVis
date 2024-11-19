import * as d3 from 'd3';
import dataJson from './phase2.json';

// Set the dimensions and margins of the graph
const margin = { top: 50, right: 100, bottom: 50, left: 70 },
  width = 1160 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

// Append the SVG object to the page
const svg = d3.select('#stepLine')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform',
          `translate(${margin.left},${margin.top})`);

// Parse the data
const data = dataJson.map(d => ({
  Time: +d.Time,
  Luigi: +d.Luigi,
  Mario: +d.Mario,
}));

// Add X axis
const x = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.Time)!])
  .range([0, width]);
svg.append('g')
  .attr('transform', `translate(0, ${height})`)
  .call(d3.axisBottom(x));

// Add Y axis
const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => Math.max(d.Luigi, d.Mario))!])
  .range([height, 0]);
svg.append('g')
  .call(d3.axisLeft(y));

// Define the line generator for Luigi
const lineLuigi = d3.line<any>()
  .x(d => x(d.Time))
  .y(d => y(d.Luigi))
  .curve(d3.curveStepAfter);

// Define the line generator for Mario
const lineMario = d3.line<any>()
  .x(d => x(d.Time))
  .y(d => y(d.Mario))
  .curve(d3.curveStepAfter);

// Add Luigi's line
svg.append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', 'green')
  .attr('stroke-width', 2)
  .attr('d', lineLuigi);

// Add Mario's line
svg.append('path')
  .datum(data)
  .attr('fill', 'none')
  .attr('stroke', 'red')
  .attr('stroke-width', 2)
  .attr('d', lineMario);

// Add labels for axes
svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('x', width / 2)
  .attr('y', height + margin.bottom - 10)
  .text('Time (seconds)');

svg.append('text')
  .attr('text-anchor', 'middle')
  .attr('transform', 'rotate(-90)')
  .attr('y', -margin.left + 20)
  .attr('x', -height / 2)
  .text('Position');

// Add legend
const legend = svg.append('g')
  .attr('transform', `translate(${width}, 0)`);

legend.append('rect')
  .attr('x', -80)
  .attr('y', 10)
  .attr('width', 18)
  .attr('height', 18)
  .style('fill', 'green');

legend.append('text')
  .attr('x', -55)
  .attr('y', 24)
  .text('Luigi');

legend.append('rect')
  .attr('x', -80)
  .attr('y', 40)
  .attr('width', 18)
  .attr('height', 18)
  .style('fill', 'red');

legend.append('text')
  .attr('x', -55)
  .attr('y', 54)
  .text('Mario');