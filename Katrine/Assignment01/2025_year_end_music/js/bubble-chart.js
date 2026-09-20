const width = 1160
const height = 380
const margin = { top: 40, right: 0, bottom: 60, left: 40 }
const maxCircleRadius = 40; 
const yLabelPadding = 20;

function createBubbleScales(data) {
    const innerWidth = width - margin.left - margin.right - yLabelPadding;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.on_demand_audio_streams_billions)])
        .range([0, innerWidth - maxCircleRadius])

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => d.on_demand_video_streams_millions)])
        .range([innerHeight, 0])

    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.album_sales)])
        .range([0, maxCircleRadius])

    const colorScale = d3.scaleOrdinal()
        .domain(data.map((d) => d.title))
        .range(["#E3A72B", "#D3652B", "#B23A2E", "#6B2A3A", "#1F6F6B", "#2E4A62", "#8A7B4E", "#5C3A22", "#C98A2B", "#9C4A42"]);

    return {
        xScale: xScale,
        yScale: yScale,
        radiusScale: radiusScale,
        colorScale: colorScale,
        innerWidth,
        innerHeight,
    };
}

function createChart(data, scales) {
    const bubbleChartSection = d3.select("#bubble-chart"); 
    bubbleChartSection.append("h3").text("Bubble chart"); 

    // I createBubbleChart:
    const svg = bubbleChartSection.append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("width", width)
        .attr("height", height);

    const bubbleChartContent = svg.append("g")
        .attr("class", "bubble-chart-content")
        .attr("transform", `translate(${margin.left + yLabelPadding}, ${margin.top})`)

    // Drawing bubblechart 
    const xAxis = d3.axisBottom(scales.xScale); 
    const yAxis = d3.axisLeft(scales.yScale); 

    bubbleChartContent.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${scales.innerHeight})`)
        .call(xAxis)

    bubbleChartContent.append("text")
        .attr("class", "x-axis-label")
        .attr("x", scales.innerWidth - 35)
        .attr("y", scales.innerHeight + 45)
        .attr("text-anchor", "end")
        .text("On-demand audio streams (billions)");

    bubbleChartContent.append("g")        
        .attr("class", "y-axis")
        .call(yAxis)
    
    bubbleChartContent.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", -40)
        .attr("text-anchor", "end")
        .text("On-demand video streams (millions)");

    const albumGroups = bubbleChartContent.selectAll("g.album-group")
        .data(data)
        .join("g")
        .attr("class", "album-group")
        
    albumGroups.append("circle")
        .attr("cx", (d) => scales.xScale(d.on_demand_audio_streams_billions)) 
        .attr("cy", (d) => scales.yScale(d.on_demand_video_streams_millions))
        .attr("r", (d) => scales.radiusScale(d.album_sales))
        .attr("fill", (d) => scales.colorScale(d.title))
}


function createColorLegend(data, scales) {
    const legendItems = d3.select(".legend-color")
        .append("ul")
        .selectAll("li")
        .data(data)
        .join("li");

    legendItems.append("span")
        .attr("class", "legend-circle")
        .style("background-color", (d) => scales.colorScale(d.title));

    legendItems.append("span")
        .text((d) => d.title);
}

function createSizeLegend(data, scales) {
    const referencePoints = [
        { value: 1500, label: "1.5M" },
        { value: 500, label: "500K" },
        { value: 100, label: "100K" },
    ];

    const legendWidth = width/2;
    const rowHeight = 70;
    const legendHeight = rowHeight * referencePoints.length;
    const circleX = 45;
    const labelX = 140;

    const svg = d3.select(".legend-area")
        .append("svg")
        .attr("viewBox", `0 0 ${legendWidth} ${legendHeight}`)
        .attr("width", legendWidth)
        .attr("height", legendHeight);

    const rows = svg.selectAll("g.legend-row")
        .data(referencePoints)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * rowHeight + rowHeight / 2})`);

    rows.append("circle")
        .attr("cx", circleX)
        .attr("cy", 0)
        .attr("r", (d) => scales.radiusScale(d.value))
        .attr("fill", "#ccc");

    rows.append("line")
        .attr("x1", (d) => circleX + scales.radiusScale(d.value) + 8)
        .attr("x2", labelX - 8)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "#999")
        .attr("stroke-dasharray", "3,3");

    rows.append("text")
        .attr("x", labelX)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .text((d) => d.label);
}

function createBubbleChart(data) {
    const scales = createBubbleScales(data);
    createChart(data, scales);
    createColorLegend(data, scales); 
    createSizeLegend(data, scales); 
}

