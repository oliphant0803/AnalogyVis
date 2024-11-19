import * as d3 from 'd3';
import dataJson from './phase2.json';

// Define the interface for your data
interface NodeData {
  name: string;
  value?: number;
  children?: NodeData[];
}

// Cast the imported data to the NodeData interface
const data: NodeData = dataJson as NodeData;

// Set dimensions and radius
const width = 1160;
const height = 700;
const radius = Math.min(width, height) / 2 - 10;

const format = d3.format(",d");

// Append an SVG element to the #sunburst div
const svg = d3.select("#sunburst")
  .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("font", "10px sans-serif")
  .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

// Function to filter redundant layers
function removeRedundantChildren(node: NodeData) {
  if (node.children) {
    node.children = node.children.filter(child => child.name !== node.name);
    node.children.forEach(removeRedundantChildren);
  }
}

removeRedundantChildren(data); // Remove redundant layers

// Create the root hierarchy and apply the partition layout
const root = d3.partition<NodeData>()
  .size([2 * Math.PI, radius])(
    d3.hierarchy<NodeData>(data)
      .sum(d => d.value || 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0))
  );

// Define a color scale for top-level categories
const colorScale = d3.scaleOrdinal<string>()
  .domain(data.children ? data.children.map(d => d.name) : [])
  .range(d3.schemeCategory10); // Use a predefined color scheme

function getColor(d: d3.HierarchyRectangularNode<NodeData>): string {
  if (d.depth === 0) {
    return '#ccc';
  }
  if (d.depth === 1) {
    return colorScale(d.data.name);
  }

  // Derive color from parent for deeper nodes
  const parentColor = getColor(d.parent!);
  const hsl = d3.hsl(parentColor);
  hsl.s *= 0.8;
  hsl.l = Math.min(1, hsl.l + 0.1);
  return hsl.formatHex();
}

// Create the arc generator
const arc = d3.arc<d3.HierarchyRectangularNode<NodeData>>()
  .startAngle(d => d.x0)
  .endAngle(d => d.x1)
  .padAngle(0.005)
  .padRadius(radius / 3)
  .innerRadius(d => d.y0)
  .outerRadius(d => d.y1 - 1);

// Draw the arcs
svg.selectAll('path')
  .data(root.descendants())
  .enter().append('path')
    .attr('display', d => d.depth ? null : "none") // Hide the root ring
    .attr('d', arc)
    .style('stroke', '#fff')
    .style('fill', d => getColor(d))
  .append('title')
    .text(d => `${d.ancestors().map(d => d.data.name).reverse().join(" / ")}\n${format(d.value || 0)}`);

// Define a threshold to determine small arcs
const labelThreshold = 0.1;

// Separate nodes into those suitable for inside labels and those needing outside labels
const labelNodes = root.descendants().filter(d => d.depth && (d.x1 - d.x0) > labelThreshold);
const smallLabelNodes = root.descendants().filter(d => d.depth && (d.x1 - d.x0) <= labelThreshold);

// Add inside labels
svg.selectAll('text')
  .data(labelNodes)
  .enter().append('text')
    .attr('transform', function(d) {
        const angle = (d.x0 + d.x1) / 2;
        const radius = (d.y0 + d.y1) / 2;

        const x = Math.cos(angle - Math.PI / 2) * radius;
        const y = Math.sin(angle - Math.PI / 2) * radius;

        return `translate(${x},${y})`;
    })
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .text(d => d.data.name)
    .style('font-size', d => {
        const textLength = d.data.name.length;
        const arcLength = (d.x1 - d.x0) * radius;

        const size = Math.min(14, (arcLength / textLength));
        return size + 'px';
    })
    .style('fill', '#000');

// Add outside labels and leader lines for small arcs
const outerLabelsGroup = svg.append('g').attr('class', 'outer-labels');

// Add the lines (leader lines)
outerLabelsGroup.selectAll('polyline')
  .data(smallLabelNodes)
  .enter().append('polyline')
    .attr('points', function(d) {
      const angle = (d.x0 + d.x1) / 2;
      const outerRadius = d.y1 - 2;

      const x = Math.cos(angle - Math.PI / 2) * outerRadius;
      const y = Math.sin(angle - Math.PI / 2) * outerRadius;

      const labelRadius = radius + 2;
      const lx = Math.cos(angle - Math.PI / 2) * labelRadius;
      const ly = Math.sin(angle - Math.PI / 2) * labelRadius;

      return `${x},${y} ${lx},${ly}`;
    })
    .style('fill', 'none')
    .style('stroke', '#000')
    .style('stroke-width', 1);

// Add the labels
outerLabelsGroup.selectAll('text')
  .data(smallLabelNodes)
  .enter().append('text')
    .attr('transform', function(d) {
      const angle = (d.x0 + d.x1) / 2;
      const labelRadius = radius + 5;

      const x = Math.cos(angle - Math.PI / 2) * labelRadius;
      const y = Math.sin(angle - Math.PI / 2) * labelRadius;

      return `translate(${x},${y})`;
    })
    .attr('text-anchor', function(d) {
      const angle = (d.x0 + d.x1) / 2 * 180 / Math.PI;
      return angle > 180 ? 'end' : 'start';
    })
    .attr('alignment-baseline', 'middle')
    .text(d => d.data.name)
    .style('font-size', '10px')
    .style('fill', '#000');