import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { GeoPermissibleObjects, GeoProjection } from 'd3';
import { Topology, GeometryCollection } from 'topojson-specification';
import { FeatureCollection } from 'geojson';

// Define the SVG dimensions
const width = 1160;
const height = 700;

// Create the SVG container
const svg = d3.select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Define the map projection
const projection = d3.geoAlbersUsa()
  .translate([width / 2, height / 2])
  .scale(1300);

// Define the path generator
const path = d3.geoPath()
  .projection(projection);

// Load and display the US map
d3.json<Topology>('https://d3js.org/us-10m.v1.json').then((usData) => {
  // Ensure that 'usData' is a Topology with a 'states' object
  const usTopology = usData as Topology<{ states: GeometryCollection }>;

  const statesFeatureCollection = topojson.feature(
    usTopology,
    usTopology.objects.states
  ) as FeatureCollection;

  // Draw the US states
  svg.append("g")
    .selectAll("path")
    .data(statesFeatureCollection.features)
    .enter()
    .append("path")
    .attr("d", path as any) // TypeScript fix
    .attr("fill", "#ccc")
    .attr("stroke", "#333");

  // Generate fake data for contours
  generateContours();
});

function generateContours() {
  // Define the grid dimensions and extent over the US
  const x0 = -125, x1 = -66, y0 = 25, y1 = 50;
  const n = 100; // Number of columns (longitude)
  const m = 50;  // Number of rows (latitude)

  const dx = (x1 - x0) / (n - 1);
  const dy = (y1 - y0) / (m - 1);

  // Create a 2D array of values
  const values = new Array(n * m);

  // Center point for the fake data
  const lonCenter = -95;
  const latCenter = 37;

  // Generate values based on distance from the center point
  for (let j = 0; j < m; ++j) {
    for (let i = 0; i < n; ++i) {
      const lon = x0 + i * dx;
      const lat = y0 + j * dy;
      const distance = Math.sqrt(Math.pow(lon - lonCenter, 2) + Math.pow(lat - latCenter, 2));
      // Fake data: Inverse of the distance squared (plus a small constant to avoid division by zero)
      const value = 1 / (distance * distance + 1);
      values[j * n + i] = value;
    }
  }

  // Generate contours
  const thresholds = d3.range(0.0005, 0.005, 0.0005);
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds)
    (values);

  // Create a custom projection for contours
  const transform = d3.geoTransform({
    point(x, y, z?) {
      const lon = x0 + x * dx;
      const lat = y0 + y * dy;
      const projected = projection([lon, lat]) as [number, number];
      this.stream.point(projected[0], projected[1]);
    }
  });

  const contourPath = d3.geoPath().projection(transform);

  // Draw contours
  svg.append("g")
    .selectAll("path")
    .data(contours)
    .enter()
    .append("path")
    .attr("d", contourPath as any) // TypeScript fix
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1);
}