const metrics = ['total_album_consumption_millions', 'album_sales', 'song_sales_thousands', 'on_demand_audio_streams_billions', 'on_demand_video_streams_millions'];

const width = 1160
const height = 380
const margin = { top: 40, right: 40, bottom: 60, left: 40 }

const maxBubbleRadius = 40;

// Round sales figures for the size legend. album_sales is counted in thousands.
const salesLegendValues = [
    { sales: 100, label: '100K' },
    { sales: 500, label: '500K' },
    { sales: 4000, label: '4M' }
];

function createBubbleChart(data) {
    // d3.csv returns every column as a string
    data.forEach(d => metrics.forEach(metric => d[metric] = Number(d[metric])));

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const chart = d3.select('#bubble-chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // .nice() rounds the domains so the outermost bubbles are not cut off by the axes
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.on_demand_audio_streams_billions)])
        .nice()
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.on_demand_video_streams_millions)])
        .nice()
        .range([innerHeight, 0]);

    // Square root scale so the bubble area represents the sales figure
    const rScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.album_sales)])
        .range([0, maxBubbleRadius]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.title))
        .range(d3.schemeTableau10);

    chart.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    chart.append('text')
        .attr('class', 'label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 45)
        .attr('text-anchor', 'middle')
        .text('On-demand audio streams (billions)');

    // Kept horizontal above the axis instead of rotated, so it stays easy to read
    chart.append('text')
        .attr('class', 'label')
        .attr('y', -15)
        .text('On-demand video streams (millions)');

    chart.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.on_demand_audio_streams_billions))
        .attr('cy', d => yScale(d.on_demand_video_streams_millions))
        .attr('r', d => rScale(d.album_sales))
        .attr('fill', d => colorScale(d.title))
        .attr('fill-opacity', 0.7)
        .attr('stroke', d => colorScale(d.title));

    createColorLegend(data, colorScale);
    createSizeLegend(rScale);
}

function createColorLegend(data, colorScale) {
    const albums = d3.select('#legend .legend-color')
        .append('ul')
        .selectAll('li')
        .data(data)
        .join('li');

    albums.append('span')
        .attr('class', 'legend-circle')
        .style('background-color', d => colorScale(d.title));

    albums.append('span').text(d => `${d.title} - ${d.artist}`);
}

function createSizeLegend(rScale) {
    const rowGap = 8;
    const labelOffset = 10;

    // Rows are stacked by hand because each circle takes up a different amount of height
    let y = 0;
    const rows = salesLegendValues.map(entry => {
        const r = rScale(entry.sales);
        y += r;
        const row = { label: entry.label, r, y };
        y += r + rowGap;
        return row;
    });

    const legend = d3.select('#legend .legend-area')
        .append('svg')
        .attr('width', 2 * maxBubbleRadius + labelOffset + 60)
        .attr('height', y);

    const entries = legend.selectAll('g')
        .data(rows)
        .join('g')
        .attr('transform', d => `translate(${maxBubbleRadius}, ${d.y})`);

    entries.append('circle')
        .attr('r', d => d.r)
        .attr('fill', 'none')
        .attr('stroke', '#555');

    entries.append('text')
        .attr('class', 'label')
        .attr('x', maxBubbleRadius + labelOffset)
        .attr('dominant-baseline', 'middle')
        .text(d => d.label);
}
