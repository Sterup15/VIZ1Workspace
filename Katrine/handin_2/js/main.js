// Load the data here
d3.csv("./data/love_song_categories_for_Billboard_Top_10_hits_1958_2023.csv", d3.autoType)
    .then(rawData => {
      const data = rawData.map(d => {
        let category = d.love_song_category;

        if (category == null) {
          category = "Non-love songs";
        }
        return {
          ...d,
          love_song_category: category,
          top_10_debut_date_as_decimal: Math.floor(d.top_10_debut_date_as_decimal)
        };
      });

      const songCategories = Array.from(
          new Set(data.map(song => song.love_song_category))
      ).sort();

      createViz(data, songCategories);
    });

// Chart dimensions live outside createViz, because tooltip.js (provided helper
// file) reads the global "margin" and "innerHeight" to position itself.
const width = 1160;
const height = 480;
const margin = { top: 30, right: 40, bottom: 50, left: 60 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const transitionDuration = 750;

// Warm palette that matches the rest of the page (#45343D text, #C1B9BA used
// by the slider). Grey is used for "Non-love songs" since that's the neutral,
// non-romantic baseline category.
const categoryColors = {
  "Good Riddance": "#B23A2E",
  "Heartache": "#6B2A3A",
  "It's Complicated": "#8A7B4E",
  "Love Song for the Self": "#2E8B74",
  "Non-love songs": "#C1B9BA",
  "Pursuit": "#D3652B",
  "Serenade": "#E3A72B",
  "Sexual Confidence": "#9C4A42"
};

// Create your visualization
function createViz(data, songCategories) {
  let model = {
    data: data,
    songCategories: songCategories,
    yearlyData: formatDataGroups(data, songCategories),
    selectedCategory: "All",
    selectedYears: null
  };

  const allYears = model.yearlyData.map(d => d.year);
  model.selectedYears = [d3.min(allYears), d3.max(allYears)];

  // DOM
  function initDOM() {
    return {
      categorySelect: d3.select("#selectSongCategory"),
      legend: d3.select(".legend")
    };
  }

  const dom = initDOM();
  const viz = initViz(model);

  function initSlider(model) {
    function onYearsSlider(values) {
      const selectedYears = values.split(",").map(Number);
      update({ selectedYears: selectedYears });
    }

    const yearsRange = model.yearlyData.map(d => d.year);

    return new rSlider({
      target: '#yearsSlider',
      values: yearsRange,
      range: true,
      tooltip: true,
      scale: true,
      labels: false,
      set: model.selectedYears,
      onChange: onYearsSlider
    });
  }

  function initLegend(model) {
    const legendItems = dom.legend
        .append("ul")
        .selectAll("li")
        .data(model.songCategories)
        .join("li")
        .attr("class", "legend-item")
        // Clicking a legend entry is just a shortcut for picking it in the dropdown
        .on("click", (event, category) => {
          const nextCategory = model.selectedCategory === category ? "All" : category;
          dom.categorySelect.property("value", nextCategory);
          update({ selectedCategory: nextCategory });
        });

    legendItems.append("span")
        .attr("class", "legend-color")
        .style("background-color", (d) => viz.colorScale(d));

    legendItems.append("span")
        .attr("class", "legend-label")
        .text((d) => d);
  }

  function initOptions(model) {
    dom.categorySelect
        .selectAll("option")
        .data(["All", ...model.songCategories])
        .join("option")
        .attr("value", (d) => d)
        .text((d) => d);
  }

  function formatDataGroups(data, categories) {
    // Use D3 roll-up (group by + aggregate)
    // data: the song-level rows
    // reduceFn: count how many songs end up in each group
    // keyFn: group by year, then by category within each year
    const countsByYear = d3.rollup(
        data,
        (songs) => songs.length,
        (d) => d.top_10_debut_date_as_decimal,
        (d) => d.love_song_category
    );

    // Build one row per year in the full range, so every year exists even if
    // rollup() has no entry for it (keeps the slider and hover lookups simple).
    const [firstYear, lastYear] = d3.extent(data, (d) => d.top_10_debut_date_as_decimal);
    const years = d3.range(firstYear, lastYear + 1);

    const groupedArray = years.map((year) => {
      const countsByCategory = countsByYear.get(year) || new Map();
      const row = { year: year, total: 0 };

      categories.forEach((category) => {
        const count = countsByCategory.get(category) || 0;
        row[category] = count;
        row.total += count;
      });

      return row;
    });

    return groupedArray;
  }

  // Viz
  function initViz(model) {
    const vizSection = d3.select("#viz");

    const svg = vizSection.append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", width)
        .attr("height", height);

    const chartContent = svg.append("g")
        .attr("class", "chart-content")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Scales - domains get filled in properly in view(), once we know which
    // years/category are selected. Ranges never change, so they live here.
    const xScale = d3.scaleLinear()
        .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
        .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
        .domain(model.songCategories)
        .range(model.songCategories.map((category) => categoryColors[category]));

    // Stack from a 0 baseline (not stackOffsetWiggle) so the y-axis keeps a
    // real meaning - "number of songs" should never go negative
    const stackGenerator = d3.stack()
        .order(d3.stackOrderInsideOut)
        .offset(d3.stackOffsetNone);

    const areaGenerator = d3.area()
        .curve(d3.curveBasis)
        .x((d) => xScale(d.data.year))
        .y0((d) => yScale(d[0]))
        .y1((d) => yScale(d[1]));

    const xAxisG = chartContent.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`);

    const yAxisG = chartContent.append("g")
        .attr("class", "y-axis");

    chartContent.append("text")
        .attr("class", "axis-label")
        .attr("x", innerWidth / 2)
        .attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .text("Year");

    chartContent.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("x", -innerHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .text("Number of songs");

    // The stream graph paths are drawn into their own group, below the axes
    const areasGroup = chartContent.append("g")
        .attr("class", "areas");

    // Invisible rect on top of everything, just to catch mouse events for the tooltip
    const overlay = chartContent.append("rect")
        .attr("class", "overlay")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "transparent");

    // initializeTooltip/-Line come from tooltip.js and use the global margin/innerHeight
    const tooltip = initializeTooltip(svg);
    const guideLine = initializeTooltipLine(tooltip);
    guideLine.style("opacity", 0);

    return {
      svg: svg,
      chartContent: chartContent,
      xScale: xScale,
      yScale: yScale,
      colorScale: colorScale,
      stackGenerator: stackGenerator,
      areaGenerator: areaGenerator,
      xAxisG: xAxisG,
      yAxisG: yAxisG,
      areasGroup: areasGroup,
      overlay: overlay,
      tooltip: tooltip,
      guideLine: guideLine
    };
  }

  // Update
  function update(patch) {
    Object.assign(model, patch);
    view(dom, model, viz);
  }

  // View
  function view(dom, model, viz) {
    const activeCategories = model.selectedCategory === "All"
        ? model.songCategories
        : [model.selectedCategory];

    const [startYear, endYear] = model.selectedYears;
    const visibleData = model.yearlyData.filter((d) => d.year >= startYear && d.year <= endYear);

    viz.xScale.domain([startYear, endYear]);

    viz.stackGenerator.keys(activeCategories);
    const stackedData = viz.stackGenerator(visibleData);

    const yMin = d3.min(stackedData, (series) => d3.min(series, (d) => d[0]));
    const yMax = d3.max(stackedData, (series) => d3.max(series, (d) => d[1]));
    viz.yScale.domain([yMin, yMax]);

    viz.xAxisG.transition().duration(transitionDuration)
        .call(d3.axisBottom(viz.xScale).tickFormat(d3.format("d")));

    viz.yAxisG.transition().duration(transitionDuration)
        .call(d3.axisLeft(viz.yScale));

    // Keyed by category, so D3 keeps track of which path is which and can
    // transition the "d" attribute smoothly instead of just swapping shapes
    const paths = viz.areasGroup.selectAll("path.area")
        .data(stackedData, (series) => series.key);

    paths.exit()
        .transition().duration(transitionDuration)
        .style("opacity", 0)
        .remove();

    paths.enter()
        .append("path")
        .attr("class", "area")
        .attr("fill", (series) => viz.colorScale(series.key))
        .style("opacity", 0)
      .merge(paths)
        .transition().duration(transitionDuration)
        .style("opacity", 1)
        .attr("d", viz.areaGenerator);

    // Fade out the legend entries that are filtered away
    dom.legend.selectAll("li.legend-item")
        .classed("inactive", (category) => !activeCategories.includes(category));

    hideTooltip(viz);
  }

  // Events
  function initEvents(dom, model, viz) {
    dom.categorySelect.on("change", function () {
      update({ selectedCategory: this.value });
    });

    viz.overlay
        .on("mousemove", (event) => onMouseMove(event))
        .on("mouseleave", () => hideTooltip(viz));

    function onMouseMove(event) {
      const [mouseX] = d3.pointer(event, viz.chartContent.node());
      const hoveredYear = Math.round(viz.xScale.invert(mouseX));

      const row = model.yearlyData.find((d) => d.year === hoveredYear);
      if (!row) {
        return;
      }

      const activeCategories = model.selectedCategory === "All"
          ? model.songCategories
          : [model.selectedCategory];

      // When "All" is selected, lead with the total; otherwise the reader just
      // wants the number for the one category they picked
      const datapoints = { Year: hoveredYear };
      if (model.selectedCategory === "All") {
        datapoints["Total songs"] = row.total;
      }
      activeCategories.forEach((category) => {
        datapoints[category] = row[category];
      });

      const xPosition = viz.xScale(hoveredYear);
      const isTextAnchorStart = xPosition < innerWidth / 2;

      viz.guideLine
          .style("opacity", 1)
          .attr("x1", xPosition)
          .attr("x2", xPosition);

      setTooltipText(datapoints, viz.tooltip, xPosition, isTextAnchorStart, (key) => key);
    }
  }

  function hideTooltip(viz) {
    viz.guideLine.style("opacity", 0);
    viz.tooltip.selectAll("text").remove();
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
