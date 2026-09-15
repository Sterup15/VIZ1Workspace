function createBarChart(data) {
    const width = 500;
    const height = 120;
    const barHeight = 20;
    const barSpacing = 5;
    const labelWidth = 100;
    const labelOffset = 15;
    const lineX = 200;

    const topGenresSection = d3.select('#top-genres');
    topGenresSection.append('h3').text('Top US genres, by US on-demand audio streams');

    // Bars grow from the reference line. The rightmost labelWidth pixels are kept
    // free so the value label after the longest bar still fits inside the SVG.
    const streamScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.audio_streaming_volume)])
        .range([0, width - lineX - labelWidth]);

    const svg = topGenresSection.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    // One group per genre, moved into place, so its children only need local coordinates.
    // The rows fill the height exactly: 5 * 20 + 4 * 5 = 120.
    const rows = svg.selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barSpacing)})`);

    rows.append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .text(d => d.genre);

    rows.append('rect')
        .attr('x', lineX)
        .attr('y', 0)
        .attr('width', d => streamScale(d.audio_streaming_volume))
        .attr('height', barHeight)
        .attr('fill', '#555');

    rows.append('text')
        .attr('class', 'label')
        .attr('x', d => lineX + streamScale(d.audio_streaming_volume) + labelOffset)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .text(d => `${d.audio_streaming_volume}B`);

    // Vertical reference line separating the genre labels from the bars.
    svg.append('line')
        .attr('x1', lineX)
        .attr('x2', lineX)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#333');
}
