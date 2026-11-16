// Chart size. margin and innerHeight are also used by tooltip.js.
const margin = { top: 20, right: 30, bottom: 60, left: 60 };
const width = 900;
const height = 500;
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const ALL_CATEGORIES = 'All';
const NON_LOVE_SONGS = 'Non-love Songs';
const duration = 500;

// Category order from the wireframe: the legend reads left to right in this order,
// and the stack is drawn with the first category on top.
const songCategories = [
  NON_LOVE_SONGS,
  'Serenade',
  'Pursuit',
  "It's Complicated",
  'Heartache',
  'Good Riddance',
  'Sexual Confidence',
  'Love Song for the Self'
];

// Hue is an identity channel, so it fits the categorical attribute. The colours are
// the Okabe-Ito palette, which is designed to be colour-blind safe, lightened 30%
// towards white because large areas should use pastel colours. 30% is the lightest
// tint where every pair could still be told apart in a colour-blindness simulation.
// Non-love songs get a neutral grey so the love songs stand out (figure-ground).
const categoryColors = {
  [NON_LOVE_SONGS]: '#d9d9d9',
  'Serenade': '#4dbb9d',
  'Pursuit': '#89cbf0',
  "It's Complicated": '#dba1c1',
  'Heartache': '#4d9cc9',
  'Good Riddance': '#f5ec7b',
  'Sexual Confidence': '#e28e4d',
  'Love Song for the Self': '#eebc4d'
};

// Load the data here
d3.csv('./data/love_song_categories_for_Billboard_Top_10_hits_1958_2023.csv', d => ({
  year: parseInt(d.top_10_debut_date_as_decimal),
  // Songs with an empty category are not love songs, so they get their own category.
  category: d.love_song_category === '' ? NON_LOVE_SONGS : d.love_song_category
})).then(data => {
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

    // The order the groups are appended in is the drawing order: grid lines at the
    // back, then the areas, then the axes on top.
    const grid = chart.append('g').attr('class', 'grid');
    const areas = chart.append('g');
    const xAxis = chart.append('g').attr('transform', `translate(0, ${innerHeight})`);
    const yAxis = chart.append('g');

    chart.append('text')
      .attr('class', 'axis-label')
      .attr('x', innerWidth)
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'end')
      .text('Year');

    chart.append('text')
      .attr('class', 'axis-label')
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
    // White box behind the tooltip text: dark text on the coloured areas can drop to
    // about 3.5:1 contrast, on white it is about 11.6:1.
    const tooltipBox = tooltip.append('rect').attr('class', 'tooltip-box');
    const tooltipText = tooltip.append('g')
      .attr('class', 'tooltip-text')
      .attr('transform', 'translate(0, 25)');

    return { svg, chart, grid, areas, xAxis, yAxis, overlay, tooltip, tooltipLine, tooltipBox, tooltipText };
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

    // The y-axis keeps the same domain whatever is selected, as in the wireframe, so
    // the height of a category can be compared when switching between categories.
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(model.yearlyData, d => d.total)])
      .range([innerHeight, 0])
      .nice();

    const colorScale = d3.scaleOrdinal()
      .domain(songCategories)
      .range(songCategories.map(category => categoryColors[category]));

    // curveMonotoneX is smooth but still goes through every data point, so the
    // shape matches the numbers in the tooltip.
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

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
    // d3.stack() puts the first key at the bottom. Reversing puts the love songs on the
    // common baseline and the non-love songs on top, like the wireframe.
    const stacks = d3.stack().keys([...keys].reverse())(visibleYears);

    viz.xScale.domain([startYear, endYear]);

    // Enter/update/exit: new categories fade in and removed ones fade out. The key
    // function (d.key) makes D3 match each path to its category instead of its index.
    dom.areas.selectAll('path')
      .data(stacks, d => d.key)
      .join(
        enter => enter.append('path')
          .attr('fill', d => viz.colorScale(d.key))
          .attr('d', viz.area)
          .style('opacity', 0),
        update => update,
        exit => exit.transition()
          .duration(duration)
          .style('opacity', 0)
          .remove()
      )
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .attr('d', viz.area);

    dom.xAxis.transition()
      .duration(duration)
      .call(d3.axisBottom(viz.xScale).tickFormat(d3.format('d')));

    // The y-axis never changes, so it does not need a transition.
    dom.yAxis.call(d3.axisLeft(viz.yScale));
    // Grid lines are y-axis ticks stretched across the chart, without labels.
    dom.grid.call(d3.axisLeft(viz.yScale).tickSize(-innerWidth).tickFormat(''));

    // The legend shows what is selected: the other categories turn grey.
    const legendItems = d3.selectAll('.legend li');
    legendItems.select('.legend-color')
      .style('background-color', d => keys.includes(d) ? viz.colorScale(d) : '#eeeeee');
    legendItems.classed('selected', d => d === model.selectedCategory);
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
      values['Total songs'] = row.total;
      songCategories.forEach(category => values[category] = row[category]);
    } else {
      values[model.selectedCategory] = row[model.selectedCategory];
    }

    const x = viz.xScale(year);

    dom.tooltip.style('opacity', 1);
    dom.tooltipLine.attr('transform', `translate(${x}, 0)`);
    // Flip the text to the left half so it stays inside the chart near the right edge.
    setTooltipText(values, dom.tooltipText, x, x < innerWidth / 2, key => key);

    // Size the white box to fit the text that was just written.
    const box = dom.tooltipText.node().getBBox();
    const padding = 8;
    dom.tooltipBox
      .attr('x', box.x - padding)
      .attr('y', box.y + 25 - padding)
      .attr('width', box.width + 2 * padding)
      .attr('height', box.height + 2 * padding);
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
