function setTooltipText(datapoints, tooltip) {
  tooltip.selectAll("text")
    .data(Object.entries(datapoints), d => d[0])
    .join("text")
    .attr("x", 12)
    .attr("y", (d, i) => 24 + i * 22)
    .attr("class", (d, i) => i < 2 ? "tooltip-heading" : null)
    .text(([key, value]) => `${key}: ${value}`);
}

function initializeTooltip(svgContainer, margin) {
  return svgContainer.append("g")
    .attr("class", "chart-tooltip")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .attr("pointer-events", "none")
    .attr("display", "none");
}

function initializeTooltipLine(tooltip, innerHeight) {
  return tooltip.append("line")
    .attr("class", "tooltip-guide")
    .attr("y1", 0)
    .attr("y2", innerHeight)
    .attr("stroke", "#45343D")
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "5,5");
}
