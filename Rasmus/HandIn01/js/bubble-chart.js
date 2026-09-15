const metrics = ['total_album_consumption_millions', 'album_sales', 'song_sales_thousands', 'on_demand_audio_streams_billions', 'on_demand_video_streams_millions'];

const width = 1160
const height = 380
const margin = { top: 40, right: 0, bottom: 60, left: 40 }

// Round numbers for the size legend. album_sales is counted in thousands.
const salesLegend = [
    { sales: 4000, label: '4M' },
    { sales: 500, label: '500K' },
    { sales: 100, label: '100K' }
];

function createBubbleChart(data) {
    // d3.csv hands every column over as a string, so convert the numeric ones
    // before they reach a scale.
    data.forEach(album => {
        metrics.forEach(metric => {
            album[metric] = Number(album[metric]);
        });
    });

    const innerWidth = width - margin.left - margin.right;    // 1120
    const innerHeight = height - margin.top - margin.bottom;  // 280
    const maxBubbleRadius = 30;

    // nice() rounds the domain up to 6.5 and 250. Without it the widest values
    // would sit exactly on the edge of the chart and their bubbles would be cut off.
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.on_demand_audio_streams_billions)])
        .range([0, innerWidth])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.on_demand_video_streams_millions)])
        .range([innerHeight, 0])
        .nice();

    // Square root again, for the same reason as the circle chart: it is the
    // bubble's area that should be proportional to the sales figure.
    const radiusScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.album_sales)])
        .range([0, maxBubbleRadius]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.title))
        .range(d3.schemeTableau10);

    const svg = d3.select('#bubble-chart').append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Everything is drawn inside this group, so (0, 0) is the corner of the plot
    // area rather than the corner of the SVG.
    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    chart.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));

    chart.append('g')
        .call(d3.axisLeft(yScale));

    chart.append('text')
        .attr('class', 'label')
        .attr('x', innerWidth)
        .attr('y', innerHeight + 40)
        .attr('text-anchor', 'end')
        .text('On-demand audio streams (billions)');

    // Kept horizontal above the axis instead of rotated beside it: margin.left is
    // only 40, which the tick labels already use up.
    chart.append('text')
        .attr('class', 'label')
        .attr('x', -margin.left)
        .attr('y', -20)
        .text('On-demand video streams (millions)');

    // Appended after the axes, so the bubbles are drawn on top of the grid.
    chart.selectAll('circle')
        .data(data)
        .join('circle')
        .attr('cx', d => xScale(d.on_demand_audio_streams_billions))
        .attr('cy', d => yScale(d.on_demand_video_streams_millions))
        .attr('r', d => radiusScale(d.album_sales))
        .attr('fill', d => colorScale(d.title));

    createColorLegend(data, colorScale);
    createSizeLegend(radiusScale);
}

// One list item per album: a coloured dot styled by main.css, then the title.
function createColorLegend(data, colorScale) {
    const items = d3.select('.legend-color')
        .append('ul')
        .selectAll('li')
        .data(data)
        .join('li');

    items.append('span')
        .attr('class', 'legend-circle')
        .style('background-color', d => colorScale(d.title));

    items.append('span')
        .text(d => d.title);
}

// Three circles from the same radius scale, so the reader can match a bubble
// size back to a sales figure.
function createSizeLegend(radiusScale) {
    const rowHeight = 70;
    const legendWidth = 200;

    // A fixed size here, not a viewBox: the legend should not stretch to fill
    // its column the way the charts do.
    const svg = d3.select('.legend-area')
        .append('svg')
        .attr('width', legendWidth)
        .attr('height', salesLegend.length * rowHeight);

    const rows = svg.selectAll('g')
        .data(salesLegend)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * rowHeight + rowHeight / 2})`);

    rows.append('circle')
        .attr('cx', 35)
        .attr('cy', 0)
        .attr('r', d => radiusScale(d.sales))
        .attr('fill', '#555');

    rows.append('text')
        .attr('class', 'label')
        .attr('x', 80)
        .attr('y', 0)
        .attr('dominant-baseline', 'middle')
        .text(d => d.label);
}
