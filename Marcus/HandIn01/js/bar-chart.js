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

    const svg = topGenresSection
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    // labelWidth keeps room for the value labels printed after each bar
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.audio_streaming_volume)])
        .range([0, width - lineX - labelWidth]);

    // Drawn before the bars so the bars sit on top of it
    svg.append('line')
        .attr('x1', lineX)
        .attr('x2', lineX)
        .attr('y1', 0)
        .attr('y2', height)
        .attr('stroke', '#333');

    const bars = svg.selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * (barHeight + barSpacing)})`);

    bars.append('rect')
        .attr('x', lineX)
        .attr('y', 0)
        .attr('width', d => xScale(d.audio_streaming_volume))
        .attr('height', barHeight)
        .attr('fill', '#555');

    bars.append('text')
        .attr('class', 'label')
        .attr('x', 0)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .text(d => d.genre);

    bars.append('text')
        .attr('class', 'label')
        .attr('x', d => lineX + xScale(d.audio_streaming_volume) + labelOffset)
        .attr('y', barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .text(d => `${d.audio_streaming_volume}B`);
}
