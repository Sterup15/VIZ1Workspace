function createCircleChart(data) {
    const streamsByReleaseDecadeSection = d3.select('#release-by-decade');
    streamsByReleaseDecadeSection.append('h3').text('US on-demand audio streams, by release decade');

    const width = 550;
    const height = 130;
    const maxCircleRadius = 40;
    const circleY = 20;
    const headerOffset = 5;
    const footerOffset = 30;

    // The largest circle spans from circleY down to height - footerOffset
    const baselineY = circleY + maxCircleRadius;
    const percentLabelY = circleY - headerOffset;
    const decadeLabelY = height - footerOffset / 2;

    const svg = streamsByReleaseDecadeSection
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    const xScale = d3.scalePoint()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.5);

    // Square root scale so the circle area, not its radius, represents the percentage
    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.audio_stream_pct)])
        .range([0, maxCircleRadius]);

    svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', baselineY)
        .attr('y2', baselineY)
        .attr('stroke', '#333');

    const decades = svg.selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${xScale(d.year)}, ${baselineY})`);

    decades.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', d => rScale(d.audio_stream_pct))
        .attr('fill', '#555');

    // Label positions are chart coordinates made relative to the baseline the groups sit on
    decades.append('text')
        .attr('class', 'label')
        .attr('y', percentLabelY - baselineY)
        .attr('text-anchor', 'middle')
        .text(d => `${d.audio_stream_pct}%`);

    decades.append('text')
        .attr('class', 'label')
        .attr('y', decadeLabelY - baselineY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .text(d => d.year);
}