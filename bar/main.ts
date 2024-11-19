import * as d3 from 'd3';
import data from './phase2.json';

const margin = { top: 20, right: 30, bottom: 40, left: 90 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select('#bar')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Set the y scale based on the maximum height in the data
const y = d3.scaleLinear()
  .domain([0, d3.max(data, (d) => d['Height (meters)']) as number])
  .range([height, 0]);

// Set the x scale using band scale for categorical data
const x = d3.scaleBand()
  .range([0, width])
  .domain(data.map((d) => d['Building Name']))
  .padding(0.1);

svg.append('g')
  .selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d) => x(d['Building Name']) as number)
  .attr('y', (d) => y(d['Height (meters)']))
  .attr('width', x.bandwidth())
  .attr('height', (d) => height - y(d['Height (meters)']))
  .attr('fill', '#69b3a2');

// Add y-axis with linear scale
svg.append('g')
  .call(d3.axisLeft(y))
  .selectAll('text')
  .style('font-size', '14px');

// Add x-axis with band scale
svg.append('g')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(x))
  .selectAll('text')
  .style('font-size', '14px')
  .attr('y', 10)
  .attr('x', -5)
  .attr('dy', '.35em')
  .attr('transform', 'rotate(0)')
  .attr('transform', 'translate(50,0)')
  .style('text-anchor', 'end');
