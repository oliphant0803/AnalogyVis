import * as d3 from 'd3';
import dataJson from './phase2.json';

interface DataItem {
  Year: number;
  Site: string;
  [key: string]: any;
}

// Define the dimensions of the SVG container, adjusting the margins to make space for the legend
const margin = { top: 20, right: 150, bottom: 50, left: 60 };
const width = 1360 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Append the SVG object to the div with id="stackedArea"
const svg = d3
  .select('#stackedArea')
  .append('svg')
  .attr('width', width + margin.left + margin.right + 100) // Extra space for legend
  .attr('height', height + margin.top + margin.bottom + 50) // Extra space for labels
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Process the data
const data: DataItem[] = dataJson.map((d: any) => ({
  Year: d.Year,
  Site: d.Site,
  'Organic Layer': d['Organic Layer'],
  Topsoil: d.Topsoil,
  Eluviation: d.Eluviation,
  Subsoil: d.Subsoil,
  'Parent Material': d['Parent Material'],
  Bedrock: d.Bedrock,
}));

// List of keys (the soil layers) in the desired order
const keys = [
  'Bedrock',
  'Parent Material',
  'Subsoil',
  'Eluviation',
  'Topsoil',
  'Organic Layer',
];

// Set the color scale
const color = d3
  .scaleOrdinal<string>()
  .domain(keys)
  .range(['#675d53', '#835d3c', '#a86431', '#c48c41', '#974412', '#679f00']);
  // .range(['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02']);

// Create the stack generator and reverse the order to start from "Organic Layer"
const stack = d3
  .stack<DataItem>()
  .keys(keys.reverse())
  .order(d3.stackOrderReverse);

// Stack the data
const stackedData = stack(data);

// Create the X scale
const x = d3
  .scaleLinear()
  .domain([
    d3.min(data, (d) => d.Year) as number,
    d3.max(data, (d) => d.Year) as number,
  ])
  .range([0, width]);

// Create the Y scale
const y = d3
  .scaleLinear()
  .domain([
    0,
    d3.max(stackedData[0], (d) => d[1]) as number,
  ])
  .nice()
  .range([height, 0]);

// Define the area generator
const area = d3
  .area<any>()
  .x((d) => x(d.data.Year))
  .y0((d) => y(d[0]))
  .y1((d) => y(d[1]));

// Add the area layers
svg
  .selectAll('.layer')
  .data(stackedData)
  .enter()
  .append('path')
  .attr('class', 'layer')
  .attr('d', area)
  .style('fill', (d) => color(d.key));

// Get the years from the data
const years = data.map((d) => d.Year);

// Calculate min and max years
const minYear = d3.min(years) as number;
const maxYear = d3.max(years) as number;

// Generate an array of years every 10 years for gridlines
const allYears = d3.range(minYear, maxYear + 1, 10);

// Create the X axis
const xAxis = d3
  .axisBottom(x)
  .tickValues(years)
  .tickFormat(d3.format('d'));

// Add the X axis
svg
  .append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0, ${height})`)
  .call(xAxis)
  .selectAll('text')  // Select all x-axis labels
  .style('font-size', '25px'); // Set font size

// Add X gridlines
svg
  .append('g')
  .attr('class', 'x grid')
  .attr('transform', `translate(0, ${height})`)
  .call(
    d3.axisBottom(x)
      .tickValues(allYears)
      .tickSize(-height)
      .tickFormat(() => '')
  )
  .selectAll('line')
  .style('stroke', '#e0e0e0')
  .style('stroke-opacity', 0.5); 

// Create the Y axis
const yAxis = d3.axisLeft(y);

// Add the Y axis
svg.append('g').attr('class', 'y axis').call(yAxis).selectAll('text')  // Select all x-axis labels
.style('font-size', '25px'); // Set font size

// Add Y gridlines
// svg
//   .append('g')
//   .attr('class', 'y grid')
//   .call(
//     d3.axisLeft(y)
//       .tickSize(-width)
//       .tickFormat(() => '')
//   )
//   .selectAll('line')
//   .style('stroke', '#e0e0e0');

// Add axis labels
svg
  .append('text')
  .attr(
    'transform',
    `translate(${width / 2}, ${height + margin.bottom - 10})`
  )
  .style('text-anchor', 'middle')
  .text('Year');

svg
  .append('text')
  .attr('transform', 'rotate(-90)')
  .attr('y', 0 - margin.left)
  .attr('x', 0 - height / 2)
  .attr('dy', '1em')
  .style('text-anchor', 'middle')
  .text('Thickness (cm)');

// Position the legend to the right of the chart
const legend = svg
  .append('g')
  .attr('class', 'legend')
  .attr('transform', `translate(${width + 30}, 20)`);

// Reverse the keys for the legend to match the stacking order
const legendItems = legend
  .selectAll('.legend-item')
  .data(keys.slice())
  .enter()
  .append('g')
  .attr('class', 'legend-item')
  .attr('transform', (d, i) => `translate(0, ${i * 25})`);

legendItems
  .append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', 18)
  .attr('height', 18)
  .style('fill', (d) => color(d));

legendItems
  .append('text')
  .attr('x', 24)
  .attr('y', 9)
  .attr('dy', '.35em')
  .text((d) => d);
