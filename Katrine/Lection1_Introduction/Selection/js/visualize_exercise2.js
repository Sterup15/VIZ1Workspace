export function visualizeBarChartExercise2(data) {
  const dates = Array.from(new Set(data.map((d) => d.date)));
  const types = Array.from(new Set(data.map((d) => d.type)));

  // constants for formatting
  const leftMargin = 100;
  const legendHeight = 50; 
  const chartOffsetY = legendHeight; 
  const chartHeight = dates.length * 80; 
  const height = chartHeight + chartOffsetY; 


  d3.select("#chart_ex2").selectAll("*").remove();
  const svg = d3.select("#chart_ex2").append("svg").attr("viewBox", "0 0 600 " + height);

  // Defining the scales
  const colorScale = d3.scaleOrdinal().domain(types).range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

  const dateBandScale = d3.scaleBand()
    .domain(dates)
    .range([0, chartHeight])
    .paddingInner(0);

  const typeBandScale = d3.scaleBand()
    .domain(types)
    .range([0, dateBandScale.bandwidth()])
    .padding(0.2);

  const valueLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.value)]) // My domain goes from 0 to 100
    .range([0, 450]); // It should be shown from 0 to 450px wide


  // Drawing the barchart
  const chartContent = svg.append("g")
    .attr("class", "chart-content")
    .attr("transform", `translate(0, ${chartOffsetY})`);

  // Formatting legend 
  // Data is bound to the three types
  // One repeated elemet is a <g>-element with a colored box and a label 
  // The container the legend <g> is attached to is the barChart SVG and positioned with transform 
  // Use join for the repetition, and append for the stuff inside. 
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(0, 0)`)
    .attr("height", 50)
  
  const legendItems = legend.selectAll("g.legend-item")
    .data(types)
    .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(${i*110}, 0)`);
  
  legendItems.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", (d) => colorScale(d))

  legendItems.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text((d) => d);


  // Formatting chart 
  chartContent.append("rect")
  .attr("x", 0)
  .attr("width", leftMargin)
  .attr("height", chartHeight)
  .attr("fill", "#e6e6e6");

chartContent.append("rect")
  .attr("x", leftMargin + 450)
  .attr("width", 50)
  .attr("height", chartHeight)
  .attr("fill", "#e6e6e6");

  const dateGroups = chartContent
    .selectAll("g.date-group")
    .data(d3.group(data, (d) => d.date))
    .join("g")
    .attr("class", "date-group")
    .attr("transform", (d) => `translate(0, ${dateBandScale(d[0])})`);

  dateGroups
    .selectAll("rect")
    .data((d) => d[1])
    .join("rect")
    .attr("x", leftMargin)
    .attr("y", (d) => typeBandScale(d.type))
    .attr("width", (d) => valueLinearScale(d.value))
    .attr("height", typeBandScale.bandwidth())
    .attr("fill", (d) => colorScale(d.type));

  dateGroups.append("line")
    .attr("x1", 0)
    .attr("x2", leftMargin + 450 + 50)
    .attr("y1", 0)
    .attr("y2", 0)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1);  

  chartContent.selectAll("text.date-label")
  .data(dates)
  .join("text")
    .attr("class", "date-label")
    .attr("x", 5)
    .attr("y", (d) => dateBandScale(d) + dateBandScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .text((d) => d.toLocaleDateString("da-DK"));

  }
