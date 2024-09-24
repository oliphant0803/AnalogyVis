import * as d3 from 'd3';
import data from './phase1.json';

// Define the dimensions of the treemap
const width = 960;
const height = 600;

// Append the SVG object to the DOM
const svg = d3.select('#treemap')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('font-family', 'sans-serif');

// Define the SalesData interface
interface SalesData {
  name: string;
  value?: number;
  children?: SalesData[];
}

// Extend the HierarchyRectangularNode interface to include custom properties
interface CustomHierarchyRectangularNode extends d3.HierarchyRectangularNode<SalesData> {
  leafUid?: string;
  clipUid?: string;
}


// Create the root hierarchy node and compute the treemap layout
const root = d3.hierarchy<SalesData>(data)
  .sum(d => d.value || 0) // Sum up the values for internal nodes
  .sort((a, b) => (b.value || 0) - (a.value || 0)); // Sort nodes by value

const treemapLayout = d3.treemap<SalesData>()
  .size([width, height])
  .paddingInner(1)
  .paddingOuter(1)
  .paddingTop(d => {
    if (d.depth === 1) return 24; // Space for region labels
    if (d.depth === 2) return 20; // Space for subregion labels
    return 0;
  })
  .round(true)
  .tile(d3.treemapSquarify.ratio(1)); // Use the squarify tiling method

treemapLayout(root);

const rootNode = root as CustomHierarchyRectangularNode;

// Step 1: Define base colors for each region
const regionBaseColors = new Map<string, string>([
    ['Asia', '#08306B'], // Dark blue
    ['North America', '#005A32'], // Dark green
    ['Europe', '#7F2704'], // Dark orange-brown
]);

// Step 2: Manually assign colors to subregions
const subregionColorMap = new Map<string, string>([
    // Asia subregions
    ['China', '#2171B5'],  // Medium blue
    ['India', '#6BAED6'],  // Lighter blue
    ['Japan', '#9ECAE1'],  // Even lighter blue
    // North America subregions
    ['USA', '#238B45'],    // Medium green
    ['Canada', '#74C476'], // Lighter green
    // Europe subregions
    ['Germany', '#A63603'], // Medium orange-brown
    ['France', '#D94801'],  // Lighter orange-brown
]);


// Step 2: Build a mapping of regions to their subregions
const regionSubregionsMap = new Map<string, string[]>();
rootNode.children?.forEach(region => {
    const regionName = region.data.name;
    const subregionNames = region.children?.map(subregion => subregion.data.name) || [];
    regionSubregionsMap.set(regionName, subregionNames);
});




// Flatten the hierarchy to include all nodes
const nodes = rootNode.descendants() as CustomHierarchyRectangularNode[];

// Sort nodes so that higher-level nodes are rendered last (on top)
nodes.sort((a, b) => a.depth - b.depth);

// Draw nodes
const cell = svg.selectAll('g')
  .data(nodes)
  .enter().append('g')
  .attr('transform', d => `translate(${d.x0},${d.y0})`);

// Draw rectangles
cell.append('rect')
  .attr('id', d => {
    d.leafUid = d.leafUid || (d3.create('svg').node()!.id);
    return d.leafUid;
  })
  .attr('width', d => Math.max(0, d.x1 - d.x0))
  .attr('height', d => Math.max(0, d.y1 - d.y0))
  .attr('fill', d => {
    if (d.depth === 1) {
      return 'none'; // Region blocks are transparent; the header has color
    } else if (d.depth === 2) {
      // Use the color from subregionColorMap
      return subregionColorMap.get(d.data.name) || '#ccc';
    } else if (d.depth === 3) {
      // Lighten the parent subregion's color for product categories
      const parentSubregion = d.parent?.data.name || '';
      const parentColor = subregionColorMap.get(parentSubregion);
      return parentColor ? d3.color(parentColor)?.brighter(0.5)?.toString() || '#ccc' : '#ccc';
    }
    return '#ccc';
  })
  .attr('stroke', 'white');

  cell.filter(d => d.depth === 1)
  .append('rect')
  .attr('class', 'region-header')
  .attr('width', d => Math.max(0, d.x1 - d.x0))
  .attr('height', 24) // Same as paddingTop for depth 1
  .attr('fill', d => regionBaseColors.get(d.data.name) || '#ccc');

// Add overlay rectangles for subregion headers
cell.filter(d => d.depth === 2)
  .append('rect')
  .attr('class', 'subregion-header')
  .attr('width', d => Math.max(0, d.x1 - d.x0))
  .attr('height', 20) // Same as paddingTop for depth 2
  .attr('fill', '#f0f0f0'); // Light gray background for subregion headers

// Add clip paths to confine text within rectangles
cell.append('clipPath')
  .attr('id', d => (d.clipUid = `clip-${d.leafUid}`))
  .append('rect')
  .attr('width', d => Math.max(0, d.x1 - d.x0))
  .attr('height', d => Math.max(0, d.y1 - d.y0));

// Add labels
cell.append('text')
  .attr('x', 4)
  .attr('y', d => {
    if (d.depth === 1) return 16; // Region label within the header area
    if (d.depth === 2) return 14; // Subregion label within the header area
    if (d.depth === 3) return 14; // Category label within the block
    return 12;
  })
  .attr('fill', d => {
    if (d.depth === 1) return 'white'; // Region labels in header (white text)
    if (d.depth === 2) return 'black'; // Subregion labels (black text)
    return 'black'; // Category labels
  })
  .attr('font-weight', d => {
    if (d.depth === 1) return 'bold';
    if (d.depth === 2) return 'bold';
    return 'normal';
  })
  .attr('font-size', d => {
    if (d.depth === 1) return '16px';
    if (d.depth === 2) return '14px';
    if (d.depth === 3) return '12px';
    return '12px';
  })
  .text(d => {
    if (d.depth === 1) return d.data.name; // Region name
    if (d.depth === 2) return d.data.name; // Subregion name
    if (d.depth === 3) {
      // Only display label if there's enough space
    //   const rectWidth = d.x1 - d.x0;
    //   const rectHeight = d.y1 - d.y0;
    //   const textLength = (d.data.name.length + 6) * 6; // Rough estimate (product name + ': $NNNk')
    //   if (rectWidth > textLength && rectHeight > 16) {
      return `${d.data.name}:`; // Category name and value
    //   } else {
    //     return '';
    //   }
    }
    return '';
  })
  .attr('clip-path', d => `url(#${d.clipUid})`);

// Add labels
cell.each(function(d) {
    const node = d3.select(this);
  
    if (d.depth === 1) {
      // Region labels
      node.append('text')
        .attr('x', 4)
        .attr('y', 16)
        .attr('fill', 'white')
        .attr('font-weight', 'bold')
        .attr('font-size', '16px')
        .text(d.data.name)
        .attr('clip-path', `url(#${d.clipUid})`);
    } else if (d.depth === 2) {
      // Subregion labels
      node.append('text')
        .attr('x', 4)
        .attr('y', 14)
        .attr('fill', 'black')
        .attr('font-weight', 'bold')
        .attr('font-size', '14px')
        .text(d.data.name)
        .attr('clip-path', `url(#${d.clipUid})`);
    } else if (d.depth === 3) {
      // Product category labels (multiline with different font sizes)
      const rectWidth = d.x1 - d.x0;
      const rectHeight = d.y1 - d.y0;
      const approximateTextHeight = 26; // Estimated height needed for two lines of text
  
      // Only display labels if there's enough space
      if (rectWidth > 50 && rectHeight > approximateTextHeight) {
        const productName = d.data.name;
        const valueText = `$${d.data.value}k`;
        
        node.append('text')
          .attr('x', 4)
          .attr('y', 14) // Starting y position for the first line
          .attr('fill', 'black')
          .attr('font-size', '12px')
          .selectAll('tspan')
          .data([productName, valueText])
          .enter()
          .append('tspan')
          .attr('x', 4)
          .attr('y', (t, i) => 14 + i * 12) // Position each line
          .attr('font-size', (t, i) => i === 0 ? '12px' : '10px') // Smaller font for value line
          .text(t => t)
          .attr('clip-path', `url(#${d.clipUid})`);
      }
    }
  });
  