import * as d3 from 'd3';
import data from './phase2.json';

// Interface for the data points
interface DataPoint {
  Event: string;
  Effect: number;
  CumulativeRevenue: number;
  startValue?: number;
  endValue?: number;
}

const dataset: DataPoint[] = data;

// Set up the SVG canvas dimensions
const margin = { top: 20, right: 20, bottom: 100, left: 60 };
const width = 1060 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

const svg = d3.select('#waterfall')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// Compute the startValue and endValue for each bar
dataset.forEach((d, i) => {
  if (i === 0) {
    d.startValue = 0;
    d.endValue = d.CumulativeRevenue;
  } else {
    d.startValue = dataset[i - 1].CumulativeRevenue;
    d.endValue = d.CumulativeRevenue;
  }
  d.Effect = +d.Effect;
  d.CumulativeRevenue = +d.CumulativeRevenue;
});

// Set up scales
const xScale = d3.scaleBand()
  .domain(dataset.map(d => d.Event))
  .range([0, width])
  .padding(0.2);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(dataset, d => d.endValue)!])
  .nice()
  .range([height, 0]);

// Draw the bars
svg.selectAll('.bar')
  .data(dataset)
  .enter()
  .append('rect')
  .attr('class', (d, i) => {
    if (i === 0 || i === dataset.length - 1) {
      return 'bar start-end';
    } 
    return d.Effect >= 0 ? 'bar increase' : 'bar decrease';
  })
  .attr('x', d => xScale(d.Event)!)
  .attr('y', d => yScale(Math.max(d.startValue!, d.endValue!)))
  .attr('height', d => Math.abs(yScale(d.startValue!) - yScale(d.endValue!)))
  .attr('width', xScale.bandwidth());

// Add the X Axis
svg.append('g')
  .attr('class', 'x axis')
  .attr('transform', `translate(0,${height})`)
  .call(d3.axisBottom(xScale))
  .selectAll('text')  // Select all x-axis labels
  .style('font-size', '14px'); // Set font size

// Add the Y Axis
svg.append('g')
  .attr('class', 'y axis')
  .call(d3.axisLeft(yScale))
  .selectAll('text')  // Select all y-axis labels
  .style('font-size', '20px'); // Set font size


// Add labels on top of bars (Effects)
svg.selectAll('.label')
  .data(dataset)
  .enter()
  .append('text')
  .attr('class', 'label')
  .attr('x', d => xScale(d.Event)! + xScale.bandwidth() / 2)
  .attr('y', d => yScale(Math.max(d.startValue!, d.endValue!)) - 5)
  .attr('text-anchor', 'middle')
  .text(d => (d.Effect >= 0 ? '+' : '') + d3.format(",")(d.Effect))
  .style('font-size', '20px');

// Add labels for cumulative totals
// svg.selectAll('.total')
//   .data(dataset)
//   .enter()
//   .append('text')
//   .attr('class', 'total')
//   .attr('x', d => xScale(d.Event)! + xScale.bandwidth() / 2)
//   .attr('y', d => yScale(d.endValue!) - 15)
//   .attr('text-anchor', 'middle')
//   .text(d => d3.format(",")(d.endValue!));