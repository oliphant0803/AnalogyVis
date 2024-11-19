import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal } from 'd3-sankey';

import data from './phase2.json';

interface Node {
  name: string;
  // Properties added by the sankey layout
  index?: number;
  depth?: number;
  height?: number;
  value?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  sourceLinks?: Link[];
  targetLinks?: Link[];
}

interface Link {
  source: string | Node;
  target: string | Node;
  value: number;
  // Properties added by the sankey layout
  index?: number;
  width?: number;
  y0?: number;
  y1?: number;
}

const width = 960;
const height = 600;

const svg = d3
  .select('#sankey')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const color = d3.scaleOrdinal(d3.schemeCategory10);

const sankeyGenerator = sankey<Node, Link>()
  .nodeId((d) => d.name)
  .nodeWidth(15)
  .nodePadding(15) // Adjusted nodePadding for better spacing
  .extent([
    [1, 1],
    [width - 1, height - 6],
  ]);

const graph = sankeyGenerator({
  nodes: data.nodes.map((d) => ({ ...d })),
  links: data.links.map((d) => ({ ...d })),
});

// Define the format function
const formatNumber = d3.format(',');
const format = (d: number) => '$' + formatNumber(d) + 'M';

// Draw links
svg
  .append('g')
  .attr('class', 'links')
  .selectAll<SVGPathElement, Link>('path')
  .data(graph.links)
  .enter()
  .append('path')
  .attr('d', sankeyLinkHorizontal())
  .attr('stroke-width', (d) => Math.max(1, d.width || 1))
  .attr('stroke', (d) =>
    color(typeof d.source === 'object' ? d.source.name : String(d.source))
  )
  .attr('stroke-opacity', 0.5)
  .attr('fill', 'none');

// Draw nodes
svg
  .append('g')
  .attr('class', 'nodes')
  .selectAll<SVGRectElement, Node>('rect')
  .data(graph.nodes)
  .enter()
  .append('rect')
  .attr('x', (d) => d.x0 || 0)
  .attr('y', (d) => d.y0 || 0)
  .attr('height', (d) => (d.y1 || 0) - (d.y0 || 0))
  .attr('width', (d) => (d.x1 || 0) - (d.x0 || 0))
  .attr('fill', (d) => color(d.name))
  .attr('stroke', '#000');

// Add node labels with values below the names
const nodeLabels = svg
  .append('g')
  .attr('class', 'node-labels')
  .selectAll<SVGTextElement, Node>('text')
  .data(graph.nodes)
  .enter()
  .append('text')
  .attr('x', (d) => (d.x0 || 0) - 10)
  .attr('text-anchor', 'end')
  .style('font-size', '12px');

// Adjust label position and alignment for nodes on the left side
nodeLabels
  .filter((d) => (d.x0 || 0) < width / 2)
  .attr('x', (d) => (d.x1 || 0) + 10)
  .attr('text-anchor', 'start');

// Compute the y position to center the label vertically
nodeLabels.attr('y', (d) => {
  const nodeHeight = (d.y1 || 0) - (d.y0 || 0);
  return (d.y0 || 0) + nodeHeight / 2 - 10; // Adjust the offset as needed
});

// Append node name (first line)
nodeLabels
  .append('tspan')
  .attr('class', 'node-name')
  // .attr('x', function () {
  //   return (d3.select(this.parentNode).attr('x') as unknown) as number;
  // })
  .attr('dy', '0em') // Position at the parent 'text' element's y-position
  .text((d) => d.name);

// Append node value (second line)
nodeLabels
  .append('tspan')
  .attr('class', 'node-value')
  // .attr('x', function () {
  //   return (d3.select(this.parentNode).attr('x') as unknown) as number;
  // })
  .attr('dy', '1.2em') // Move down to the next line
  .style('font-size', '10px') // Smaller font size
  .text((d) => format(d.value || 0));