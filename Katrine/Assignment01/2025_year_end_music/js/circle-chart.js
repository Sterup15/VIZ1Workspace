function createCircleChart(data) {
    const width = 550;
    const height = 130;
    const maxCircleRadius = 40;
    const circleY = 20;
    const headerOffset = 5;
    const footerOffset = 30;

    const streamsByReleaseDecadeSection = d3.select('#release-by-decade');
    streamsByReleaseDecadeSection.append('h3').text('US on-demand audio streams, by release decade');

    const svg = streamsByReleaseDecadeSection.append("svg").attr("viewBox", "0 0 " + width + " " + height); 

    // Defining scales 
    // We use scaleSqrt, because we need the area of the circle to be proportional with the data value, not the radius
    const audioStreamPctScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.audio_stream_pct)])
        .range([0, maxCircleRadius])

    const genrePositionScale = d3.scalePoint()
        .domain(data.map((d) => d.year))
        .range([maxCircleRadius, width - maxCircleRadius])
        .padding(0.2); 

    const colorScale = d3.scaleOrdinal()
    .domain(data.map((d) => d.year))
    .range(["#E3A72B", "#C98A2B", "#D3652B", "#B23A2E", "#8C3B2E", "#6B2A3A", "#4A1E33"])

    // Drawing circle chart 
    const circleChartContent = svg.append("g").attr("class", "circle-chart-content"); 

    circleChartContent.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", circleY + maxCircleRadius + headerOffset)
        .attr("y2", circleY + maxCircleRadius + headerOffset)
        .attr("stroke", "#E5D9C3")
        .attr("stroke-width", 1)

    const genreGroups = circleChartContent
        .selectAll("g.decade-group")
        .data(data)
        .join("g")
        .attr("class", "decade-group")
        .attr("transform", d => `translate(${genrePositionScale(d.year)}, ${circleY})`)


    genreGroups.append("circle")
        .attr("cx", 0)
        .attr("cy", maxCircleRadius + headerOffset)
        .attr("r", (d) => audioStreamPctScale(d.audio_stream_pct))
        .attr("fill", (d) => colorScale(d.year))

    genreGroups.append("text")
        .attr("class", "audio_str_pct")
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .text((d) => d.audio_stream_pct+ "%");

    genreGroups.append("text")
        .attr("class", "decade-label")
        .attr("x", 0)
        .attr("y", height - footerOffset + headerOffset)
        .attr("text-anchor", "middle")
        .text((d) => d.year);


}