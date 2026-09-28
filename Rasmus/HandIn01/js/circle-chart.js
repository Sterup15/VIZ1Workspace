function createCircleChart(data) {
    const streamsByReleaseDecadeSection = d3.select('#release-by-decade');
    streamsByReleaseDecadeSection.append('h3').text('US on-demand audio streams, by release decade');

    const width = 550;
    const height = 130;
    const maxCircleRadius = 40;
    const circleY = 20;
    const headerOffset = 5;
    const footerOffset = 30;

    // The vertical space adds up exactly: circleY (20) + the largest circle's
    // diameter (80) + footerOffset (30) = height (130).
    const baselineY = circleY + maxCircleRadius;                // 60, the line the circles sit on
    const percentLabelY = circleY - headerOffset;               // 15, just above the largest circle
    const decadeLabelY = height - footerOffset + headerOffset;  // 105, just below it

    // padding(0.5) leaves half a step free at each end, so the outer circles and
    // their labels stay inside the SVG.
    const decadeScale = d3.scalePoint()
        .domain(data.map(d => d.year))
        .range([0, width])
        .padding(0.5);

    // scaleSqrt, not scaleLinear: a circle's area grows with the square of its
    // radius, so the radius must grow with the square root of the value for the
    // area to be proportional to the percentage.
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.audio_stream_pct)])
        .range([0, maxCircleRadius]);

    const svg = streamsByReleaseDecadeSection.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Drawn before the groups so that the circles end up on top of the line.
    svg.append('line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', baselineY)
        .attr('y2', baselineY)
        .attr('stroke', '#333');

    // One group per decade. The group only places it horizontally, so its children
    // can use the y values worked out above.
    const decades = svg.selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', d => `translate(${decadeScale(d.year)}, 0)`);

    decades.append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', percentLabelY)
        .attr('text-anchor', 'middle')
        .text(d => `${d.audio_stream_pct}%`);

    decades.append('circle')
        .attr('cx', 0)
        .attr('cy', baselineY)
        .attr('r', d => radiusScale(d.audio_stream_pct))
        .attr('fill', '#555');

    decades.append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', decadeLabelY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'hanging')
        .text(d => d.year);
}