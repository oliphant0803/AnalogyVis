import * as d3 from 'd3';
import data from './phase2.json';

const margin = { top: 20, right: 30, bottom: 40, left: 50 };
const width = 960 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select('#histogram')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Set the y scale based on the maximum frequency
const y = d3.scaleLinear()
  .domain([0, d3.max(data, (d) => d['Frequency']) as number])
  .range([height, 0]);

// Set the x scale using band scale for categorical data
const x = d3.scaleBand()
  .range([0, width])
  .domain(data.map((d) => d['Grade Range']))
  .padding(0.1);

svg.append('g')
  .selectAll('rect')
  .data(data)
  .enter()
  .append('rect')
  .attr('x', (d) => x(d['Grade Range']) as number)
  .attr('y', (d) => y(d['Frequency']))
  .attr('width', x.bandwidth())
  .attr('height', (d) => height - y(d['Frequency']))
  .attr('fill', '#69b3a2');

// Add y-axis with integer ticks
svg.append('g')
  .call(
    d3.axisLeft(y)
      .ticks(d3.max(data, (d) => d['Frequency'])) // Set the number of ticks to the maximum frequency value
      .tickFormat(d3.format('d')) // Format ticks to be integer
  )
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