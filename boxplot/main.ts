import * as d3 from 'd3';
import dataJson from './phase1.json';


interface Data {
    [key: string]: number[];
}

const data: Data = dataJson as Data;

interface BoxPlotData {
  category: string;
  quartile: number[];
  whiskers: number[];
  outliers: number[];
}

const categories = Object.keys(data);

// Convert all data to numbers and sort
const numericData: { [key: string]: number[] } = {};
categories.forEach(category => {
  numericData[category] = data[category].map(Number).sort(d3.ascending);
});

// Dimensions and margins
const margin = { top: 30, right: 50, bottom: 70, left: 50 };
const width = 1160 - margin.left - margin.right;
const height = 700 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#boxplot")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Find overall min and max values
const minExpense = d3.min(Object.values(numericData).flat()) ?? 0;
const maxExpense = d3.max(Object.values(numericData).flat()) ?? 0;

// X scale and axis
const xScale = d3.scaleBand()
  .domain(categories)
  .range([0, width])
  .paddingInner(0.1)
  .paddingOuter(0.5);


svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale))
  .selectAll("text")
  .style("font-size", "14px"); // Increase font size

// Y scale and axis
const yScale = d3.scaleLinear()
  .domain([minExpense - 10, maxExpense + 10]) // Add some padding
  .range([height, 0]);

svg.append("g")
  .call(d3.axisLeft(yScale))
  .selectAll("text")
  .style("font-size", "14px"); // Increase font size

// Prepare the box plot data
const boxPlotData: BoxPlotData[] = categories.map(category => {
  const values = numericData[category];

  const q1 = d3.quantile(values, 0.25)!;
  const median = d3.quantile(values, 0.5)!;
  const q3 = d3.quantile(values, 0.75)!;
  const iqr = q3 - q1;

  // Whiskers (1.5 * IQR)
  const lowerWhisker = Math.max(d3.min(values)!, q1 - 1.5 * iqr);
  const upperWhisker = Math.min(d3.max(values)!, q3 + 1.5 * iqr);

  // Outliers
  const outliers = values.filter(v => v < lowerWhisker || v > upperWhisker);

  return {
    category,
    quartile: [q1, median, q3],
    whiskers: [lowerWhisker, upperWhisker],
    outliers
  };
});

// Define a color scale for categories
const colorScale = d3.scaleOrdinal()
  .domain(categories)
  .range(d3.schemeCategory10);

// Draw the box plots
const boxWidth = xScale.bandwidth() * 0.7; // Adjust as needed

svg.selectAll(".boxplot")
  .data(boxPlotData)
  .enter()
  .append("g")
  .attr("class", "boxplot")
  .attr("transform", d => `translate(${xScale(d.category)! + xScale.bandwidth() / 2},0)`)
  .each(function(d) {
    // Draw box
    d3.select(this)
      .append("rect")
      .attr("x", -boxWidth / 2)
      .attr("y", yScale(d.quartile[2])) // Q3
      .attr("width", boxWidth)
      .attr("height", yScale(d.quartile[0]) - yScale(d.quartile[2])) // Q1 - Q3
      .attr("fill", colorScale(d.category) as string) // Assign color based on category
      .attr("stroke", "black");

    // Draw median line
    d3.select(this)
      .append("line")
      .attr("x1", -boxWidth / 2)
      .attr("x2", boxWidth / 2)
      .attr("y1", yScale(d.quartile[1])) // Median
      .attr("y2", yScale(d.quartile[1]))
      .attr("stroke", "black");

    // Draw whiskers
    // Vertical line
    d3.select(this)
      .append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", yScale(d.whiskers[0])) // Lower whisker
      .attr("y2", yScale(d.whiskers[1])) // Upper whisker
      .attr("stroke", "black");

    // Whisker caps
    // Lower whisker cap
    d3.select(this)
      .append("line")
      .attr("x1", -boxWidth / 4)
      .attr("x2", boxWidth / 4)
      .attr("y1", yScale(d.whiskers[0]))
      .attr("y2", yScale(d.whiskers[0]))
      .attr("stroke", "black");

    // Upper whisker cap
    d3.select(this)
      .append("line")
      .attr("x1", -boxWidth / 4)
      .attr("x2", boxWidth / 4)
      .attr("y1", yScale(d.whiskers[1]))
      .attr("y2", yScale(d.whiskers[1]))
      .attr("stroke", "black");

    // Draw outliers
    d3.select(this).selectAll(".outlier")
      .data(d.outliers)
      .enter()
      .append("circle")
      .attr("class", "outlier")
      .attr("cx", 0)
      .attr("cy", (v: number) => yScale(v))
      .attr("r", 3)
      .attr("fill", "red");
  });
