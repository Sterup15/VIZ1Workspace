// Chart size. innerWidth/innerHeight are also used by tooltip.js.
const margin = { top: 20, right: 30, bottom: 60, left: 60 };
const width = 900;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const ALL_CATEGORIES = 'All';
const duration = 500;

// Load the data here
d3.csv('./data/love_song_categories_for_Billboard_Top_10_hits_1958_2023.csv', d => ({
  year: parseInt(d.top_10_debut_date_as_decimal),
  category: d.love_song_category
})).then(rows => {
  // Rows without a category are not love songs, so they are left out.
  const data = rows.filter(d => d.category !== '');
  const songCategories = Array.from(new Set(data.map(d => d.category))).sort();

  createViz(data, songCategories);
});

// Create your visualization
function createViz(data, songCategories) {
  const years = data.map(d => d.year);

  let model = {
    // Include values in the model if it is part of the state needed to render the view
    data: data,
    yearlyData: formatDataGroups(data),
    selectedCategory: ALL_CATEGORIES,
    selectedYears: [d3.min(years), d3.max(years)]
  }

  // DOM
  function initDOM() {
    const svg = d3.select('#viz').append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`);

    const chart = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const areas = chart.append('g');
    const xAxis = chart.append('g').attr('transform', `translate(0, ${innerHeight})`);
    const yAxis = chart.append('g');

    chart.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('text-anchor', 'middle')
      .text('Year');

    chart.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -45)
      .attr('text-anchor', 'middle')
      .text('Number of songs');

    // Transparent rectangle on top of the chart so mousemove works everywhere,
    // also in the gaps between the areas.
    const overlay = chart.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent');

    const tooltip = initializeTooltip(svg).style('opacity', 0);
    const tooltipLine = initializeTooltipLine(tooltip);

    return { svg, chart, areas, xAxis, yAxis, overlay, tooltip, tooltipLine };
  }

  const dom = initDOM();
  const viz = initViz(model);

  function initSlider(model) {
    function onYearsSlider(values) {
      update({ selectedYears: values.split(",").map(Number) });
    }

    const dataYearsArray = model.data.map(d => d.year);
    // +1 because d3.range() leaves out the end value, and we want the last year too.
    const yearsRange = d3.range(d3.min(dataYearsArray), d3.max(dataYearsArray) + 1);

    return new rSlider({
      target: '#yearsSlider',
      values: yearsRange,
      range: true,
      tooltip: true,
      scale: true,
      labels: false,
      set: [yearsRange[0], yearsRange[yearsRange.length - 1]],
      onChange: onYearsSlider
    });
  }

  function initLegend(model) {
    const items = d3.select('.legend').append('ul')
      .selectAll('li')
      .data(songCategories)
      .join('li');

    items.append('div')
      .attr('class', 'legend-color')
      .style('background-color', d => viz.colorScale(d));

    items.append('div')
      .attr('class', 'legend-label')
      .text(d => d);
  }

  function initOptions(model) {
    d3.select('#selectSongCategory')
      .selectAll('option')
      .data([ALL_CATEGORIES, ...songCategories])
      .join('option')
      .attr('value', d => d)
      .text(d => d);
  }

  function formatDataGroups(data) {
    //Use D3 roll-up (group by + aggregate)
    //Parts:
    //data
    //reduceFn --> how to do within each group
    //keyFn --> how to group by
    const counts = d3.rollup(data, rows => rows.length, d => d.year, d => d.category);

    // One object per year holding a count for every category, so the stack never
    // gets an undefined value in a year where a category is missing.
    const groupedArray = Array.from(counts, ([year, categoryCounts]) => {
      const row = { year: year, total: 0 };
      songCategories.forEach(category => {
        row[category] = categoryCounts.get(category) ?? 0;
        row.total += row[category];
      });
      return row;
    });

    return groupedArray.sort((a, b) => a.year - b.year);
  }

  // Viz
  function initViz(model) {
    const xScale = d3.scaleLinear().range([0, innerWidth]);
    const yScale = d3.scaleLinear().range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(songCategories)
      .range(d3.schemeTableau10);

    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis);

    return { xScale, yScale, colorScale, area };
  }

  // Update
  function update(patch) {
    model = { ...model, ...patch };
    view(dom, model, viz);
  }

  // View
  function view(dom, model, viz) {
    const [startYear, endYear] = model.selectedYears;
    const visibleYears = model.yearlyData.filter(d => d.year >= startYear && d.year <= endYear);

    // "All" stacks every category, otherwise the stack has a single layer.
    const keys = model.selectedCategory === ALL_CATEGORIES ? songCategories : [model.selectedCategory];
    const stacks = d3.stack().keys(keys)(visibleYears);

    viz.xScale.domain([startYear, endYear]);
    viz.yScale.domain([0, d3.max(visibleYears, d => d3.sum(keys, key => d[key]))]).nice();

    // The key function keeps each category on its own path, so a category that
    // disappears is removed instead of being reused for another one.
    dom.areas.selectAll('path')
      .data(stacks, d => d.key)
      .join('path')
      .attr('fill', d => viz.colorScale(d.key))
      .transition()
      .duration(duration)
      .attr('d', viz.area);

    dom.xAxis.transition()
      .duration(duration)
      .call(d3.axisBottom(viz.xScale).tickFormat(d3.format('d')));

    dom.yAxis.transition()
      .duration(duration)
      .call(d3.axisLeft(viz.yScale));
  }

  // Events
  function initEvents(dom, model, viz) {
    d3.select('#selectSongCategory').on('change', event => {
      update({ selectedCategory: event.target.value });
    });

    // showTooltip reads the model from the closure instead of this parameter,
    // because update() replaces the model object and the parameter would stay stale.
    dom.overlay
      .on('mousemove', event => showTooltip(event, dom, viz))
      .on('mouseleave', () => dom.tooltip.style('opacity', 0));
  }

  function showTooltip(event, dom, viz) {
    const [mouseX] = d3.pointer(event);
    const year = Math.round(viz.xScale.invert(mouseX));
    const row = model.yearlyData.find(d => d.year === year);
    if (!row) return;

    // When one category is selected the tooltip only shows that one.
    const values = { Year: year };
    if (model.selectedCategory === ALL_CATEGORIES) {
      values['Total'] = row.total;
      songCategories.forEach(category => values[category] = row[category]);
    } else {
      values[model.selectedCategory] = row[model.selectedCategory];
    }

    const x = viz.xScale(year);

    dom.tooltip.style('opacity', 1);
    dom.tooltipLine.attr('transform', `translate(${x}, 0)`);
    // Flip the text to the left half so it stays inside the chart near the right edge.
    setTooltipText(values, dom.tooltip, x, x < innerWidth / 2, key => key);
  }

  // Init
  function init(model) {
    initSlider(model);
    initEvents(dom, model, viz);
    initLegend(model);
    initOptions(model);
    view(dom, model, viz);
  }

  init(model);
}
