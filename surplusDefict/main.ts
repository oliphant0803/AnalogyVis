import * as d3 from 'd3';
import data from './phase2.json';

// Set up the SVG canvas dimensions
const margin = { top: 20, right: 30, bottom: 40, left: 40 },
  width = 1160 - margin.left - margin.right,
  height = 700 - margin.top - margin.bottom;

// Create the SVG canvas
const svg = d3
  .select('#surplusDefict')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Parse the data
data.forEach((d) => {
  d.time = +d.time;
  d.surplusDeficit = +d.surplusDeficit;
});

// Set up the scales
const x = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.time)!])
  .range([0, width]);

const y = d3
  .scaleLinear()
  .domain([
    d3.min(data, (d) => d.surplusDeficit)!,
    d3.max(data, (d) => d.surplusDeficit)!,
  ])
  .nice()
  .range([height, 0]);

// Define the area for surplus (positive values)
const areaSurplus = d3
  .area<{ time: number; surplusDeficit: number }>()
  .defined((d) => d.surplusDeficit >= 0)
  .x((d) => x(d.time))
  .y0(y(0))
  .y1((d) => y(d.surplusDeficit));

// Define the area for deficit (negative values)
const areaDeficit = d3
  .area<{ time: number; surplusDeficit: number }>()
  .defined((d) => d.surplusDeficit < 0)
  .x((d) => x(d.time))
  .y0(y(0))
  .y1((d) => y(d.surplusDeficit));

// Add the surplus area to the SVG
svg
  .append('path')
  .datum(data)
  .attr('fill', 'steelblue')
  .attr('d', areaSurplus);

// Add the deficit area to the SVG
svg
  .append('path')
  .datum(data)
  .attr('fill', 'crimson')
  .attr('d', areaDeficit);

// Add the x-axis
svg
  .append('g')
  .attr('transform', `translate(0,${y(0)})`)
  .call(d3.axisBottom(x));

// Add the y-axis
svg.append('g').call(d3.axisLeft(y));

// Add labels and titles (optional)
svg
  .append('text')
  .attr('x', width / 2)
  .attr('y', height + margin.bottom - 5)
  .attr('text-anchor', 'middle')
  .text('Time (s)');

svg
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', -height / 2)
  .attr('y', -margin.left + 15)
  .attr('text-anchor', 'middle')
  .text('Surplus/Deficit (m)');

svg
  .append('text')
  .attr('x', width / 2)
  .attr('y', -10)
  .attr('text-anchor', 'middle')
  .style('font-size', '16px')
  .text('Surplus/Deficit Over Time');
