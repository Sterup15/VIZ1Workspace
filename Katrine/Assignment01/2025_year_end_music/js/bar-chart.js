function createBarChart(data) {
  const width = 500;
  const height = 120;
  const barHeight = 20;
  const barSpacing = 5;
  const labelWidth = 100;
  const labelOffset = 15;
  const lineX = 200;
  const contentX = lineX - labelWidth + labelOffset;

  const topGenresSection = d3.select("#top-genres");

  topGenresSection.append("h3")
    .text("Top US genres, by US on-demand audio streams")

  const svg = topGenresSection.append("svg")
    .attr("viewBox", "0 0 " + width + " " + height);

  // Defining scales
  const genreBandScale = d3.scaleBand()
    .domain(data.map((d) => d.genre))
    .range([0, height])
    .padding(0.2);

  const streamingVolumeScale = d3.scaleLinear()
    .domain([0, d3.max(data, (d) => d.audio_streaming_volume)])
    .range([0, width - contentX - 100]);

  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(data, d => d.audio_streaming_volume)])
    .interpolator(d3.interpolateRgb( "#E3A72B", "#8C3B2E"))

  // Drawing the barchart
  const chartContent = svg.append("g")
    .attr("class", "chart-content");

  const bars = chartContent.selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", contentX + labelOffset)
    .attr("y", (d) => genreBandScale(d.genre))
    .attr("width", (d) => streamingVolumeScale(d.audio_streaming_volume))
    .attr("height", genreBandScale.bandwidth())
    .attr("fill", (d) => colorScale(d.audio_streaming_volume))

  chartContent.selectAll("text.top-genre-label")
    .data(data)
    .join("text")
    .attr("class", "top-genre-label")
    .attr("x", 0)
    .attr("y", (d) => genreBandScale(d.genre))
    .attr("dy", labelOffset)
    .text((d) => d.genre);

    chartContent.append("line")
        .attr("x1", contentX)
        .attr("x2", contentX)
        .attr("y1", 0)
        .attr("y2", width)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1)

    chartContent.selectAll("text.volume-label")
    .data(data)
    .join("text")
    .attr("class", "volume-label")
    .attr("x", width - 50)
    .attr("y", (d) => genreBandScale(d.genre))
    .attr("dy", labelOffset)
    .text((d) => d.audio_streaming_volume + "B");
}
