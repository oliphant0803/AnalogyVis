import * as d3 from 'd3';
import dataJson from './phase2.json';

// Set up the SVG canvas dimensions
const width = 1160;
const height = 700;
const margin = { top: 40, right: 40, bottom: 50, left: 60 };

// Create the SVG container
const svg = d3.select('#scatter')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

// Prepare the data
const data = dataJson;

// Define scales
const x = d3.scaleLinear()
  .domain(d3.extent(data, d => d.ra) as [number, number])
  .range([margin.left, width - margin.right]);

const y = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.dec) as number])
  .range([height - margin.bottom, margin.top]);

// Define a scale for circle sizes based on brightness
const size = d3.scaleLinear()
  .domain(d3.extent(data, d => d.brightness) as [number, number]).nice()
  .range([5, 30]); // Larger variation: smallest to largest size of dots

// Create axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y).ticks(15); // Set the number of ticks; adjust based on your desired range and step

// Add X axis
svg.append('g')
  .attr('transform', `translate(0, ${height - margin.bottom})`)
  .call(xAxis)
  .append('text')
  .attr('x', width - margin.right)
  .attr('y', 35)
  .attr('fill', '#000')
  .attr('text-anchor', 'end')
  .attr('font-weight', 'bold')
  .text('Right Ascension (°)');

// Add Y axis
svg.append('g')
  .attr('transform', `translate(${margin.left}, 0)`)
  .call(yAxis)
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('x', -margin.top)
  .attr('y', -45)
  .attr('dy', '.71em')
  .attr('fill', '#000')
  .attr('text-anchor', 'end')
  .attr('font-weight', 'bold')
  .text('Declination (°)');

// Draw scatter plot
svg.append('g')
  .selectAll('circle')
  .data(data)
  .enter()
  .append('circle')
    .attr('cx', d => x(d.ra))
    .attr('cy', d => y(d.dec))
    .attr('r', d => size(d.brightness))
    .style('fill', '#69b3a2')
    .style('opacity', 0.7)
    .attr('stroke', 'black');

// Optionally, add tooltip on hover
const tooltip = d3.select('#scatter')
  .append('div')
  .style('opacity', 0)
  .attr('class', 'tooltip')
  .style('background-color', 'white')
  .style('border', 'solid')
  .style('border-width', '1px')
  .style('border-radius', '5px')
  .style('padding', '10px')
  .style('position', 'absolute');

const mouseover = function(this: any, event: any, d: any) {
  tooltip
    .style('opacity', 1);
  d3.select(this)
    .style('stroke', 'red')
    .style('opacity', 1);
};

const mousemove = function(event: any, d: any) {
  tooltip
    .html(`RA: ${d.ra}<br>Dec: ${d.dec}<br>Brightness: ${d.brightness}${d.note ? '<br>Note: ' + d.note : ''}`)
    .style('left', (event.pageX + 15) + 'px')
    .style('top', (event.pageY - 28) + 'px');
};

const mouseleave = function(this: any, event: any, d: any) {
  tooltip
    .style('opacity', 0);
  d3.select(this)
    .style('stroke', 'black')
    .style('opacity', 0.7);
};

svg.selectAll('circle')
  .on('mouseover', mouseover)
  .on('mousemove', mousemove)
  .on('mouseleave', mouseleave);
