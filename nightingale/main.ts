import * as d3 from 'd3';
import data from './phase1.json';

interface DataItem {
  Month: string;
  'Zymotic Diseases': number;
  'Wounds & Injuries': number;
  'Other Causes': number;
}

const dataset: DataItem[] = data as DataItem[];

const width = 1160;
const height = 700;
const innerRadius = 0;
const outerRadius = Math.min(width, height) / 2 - 100;

const svg = d3.select('#nightingale')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const g = svg.append('g')
  .attr('transform', `translate(${width / 2}, ${height / 2})`);

const causes = ['Other Causes', 'Wounds & Injuries', 'Zymotic Diseases'];

const stack = d3.stack<DataItem>().keys(causes);

const stackedData = stack(dataset);

const angleScale = d3.scaleBand()
  .domain(dataset.map(d => d.Month))
  .range([0, 2 * Math.PI])
  .align(0);

const maxValue = d3.max(stackedData[stackedData.length - 1], d => d[1]) || 0;

const radiusScale = d3.scaleLinear()
  .domain([0, maxValue])
  .range([innerRadius, outerRadius]);

const color = d3.scaleOrdinal<string>()
  .domain(causes)
  .range(['#FFB6C1', '#A9A9A9', '#B0E0E6']);

const arcGenerator = d3.arc<d3.SeriesPoint<DataItem>>()
  .innerRadius(d => radiusScale(d[0]))
  .outerRadius(d => radiusScale(d[1]))
  .startAngle(d => angleScale(d.data.Month) as number)
  .endAngle(d => (angleScale(d.data.Month) as number) + angleScale.bandwidth())
  .padAngle(0.01)
  .padRadius(innerRadius);

const causeGroups = g.selectAll('.cause-group')
  .data(stackedData)
  .enter()
  .append('g')
  .attr('class', d => `cause-group cause-${d.key.replace(/\s/g, '-')}`)
  .attr('fill', d => color(d.key));

causeGroups.selectAll('path')
  .data(d => d.map(point => ({ ...point, cause: d.key })))
  .enter()
  .append('path')
  .attr('d', d => arcGenerator(d) as string)
  .attr('stroke', '#333')
  .attr('stroke-width', 1);

causeGroups.selectAll('text')
  .data(d => d.map(point => ({ ...point, cause: d.key })))
  .enter()
  .append('text')
  .attr('transform', d => {
    const [x, y] = arcGenerator.centroid(d);
    const offset = radiusScale(d[1]) + 5;
    const angle = ((angleScale(d.data.Month) as number) + angleScale.bandwidth() / 2);
    const xOffset = Math.cos(angle) * offset;
    const yOffset = Math.sin(angle) * offset;
    return `translate(${xOffset}, ${yOffset})`;
  })
//   .attr('text-anchor', 'middle')
//   .style('font-size', d => radiusScale(d[1]) > 100 ? '10px' : '8px') // Larger font size for outer arcs
//   .style('fill', 'black')
//   .style('pointer-events', 'none')
//   .style('background', 'white')
//   .text(d => d.data[d.cause as keyof DataItem]);

// Add background rects for labels
causeGroups.selectAll('text')
  .data(d => d.map(point => ({ ...point, cause: d.key })))
  .enter()
  .insert('rect', 'text')
  .attr('width', function () {
    const elem = this.nextElementSibling as SVGTextElement;
    return elem.getBBox().width + 6; // Adding some padding
  })
  .attr('height', function () {
    const elem = this.nextElementSibling as SVGTextElement;
    return elem.getBBox().height + 2; // Adding some padding
  })
  .attr('x', function () {
    const elem = this.nextElementSibling as SVGTextElement;
    return elem.getBBox().x - 3; // Adjusting position to center align
  })
  .attr('y', function () {
    const elem = this.nextElementSibling as SVGTextElement;
    return elem.getBBox().y - 1; // Adjusting position to center align
  })
  .attr('fill', 'white')
  .attr('stroke', '#000')
  .attr('rx', 2).attr('ry', 2); // Rounded corners for the rectangles

const labelRadius = outerRadius + 30;

g.append('g')
  .selectAll('text')
  .data(dataset)
  .enter()
  .append('text')
  .attr('text-anchor', 'middle')
  .attr('transform', d => {
    const angle = (angleScale(d.Month) as number) + angleScale.bandwidth() / 2 - Math.PI / 2;
    const x = Math.cos(angle) * labelRadius;
    const y = Math.sin(angle) * labelRadius;
    return `translate(${x},${y})`;
  })
  .text(d => d.Month)
  .style('font-size', '12px')
  .attr('alignment-baseline', 'middle');

const legend = svg.append('g')
  .attr('transform', `translate(${width - 120}, ${height - 150})`);

causes.forEach((cause, i) => {
  const legendRow = legend.append('g')
    .attr('transform', `translate(0, ${i * 20})`);

  legendRow.append('rect')
    .attr('width', 12)
    .attr('height', 12)
    .attr('fill', color(cause));

  legendRow.append('text')
    .attr('x', -10)
    .attr('y', 10)
    .attr('text-anchor', 'end')
    .text(cause);
});
