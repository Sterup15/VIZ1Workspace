const songCategories = [
  "Non-love Songs",
  "Serenade",
  "Pursuit",
  "It's Complicated",
  "Heartache",
  "Good Riddance",
  "Sexual Confidence",
  "Love Song for the Self"
];

function formatDataGroups(data, categories) {
  const counts = d3.rollup(data, rows => rows.length, d => d.year, d => d.category);
  const [firstYear, lastYear] = d3.extent(data, d => d.year);

  return d3.range(firstYear, lastYear + 1).map(year => {
    const row = { year };
    categories.forEach(category => {
      row[category] = counts.get(year)?.get(category) ?? 0;
    });
    row.total = d3.sum(categories, category => row[category]);
    return row;
  });
}

function normalizeSongs(rows, categories) {
  if (!rows.length) {
    throw new Error("The song dataset is empty.");
  }
  return rows.map((row, index) => {
    const decimalYear = Number(row.top_10_debut_date_as_decimal);
    if (!row.top_10_debut_date_as_decimal?.trim() || !Number.isFinite(decimalYear)) {
      throw new Error(`Invalid debut year in CSV row ${index + 2}.`);
    }
    const category = row.love_song_category?.trim() || "Non-love Songs";
    if (!categories.includes(category)) {
      throw new Error(`Unknown song category in CSV row ${index + 2}: ${category}`);
    }
    return { ...row, year: Math.floor(decimalYear), category };
  });
}

function createViz(data, categories) {
  const groupedData = formatDataGroups(data, categories);
  const years = d3.extent(groupedData, d => d.year);
  const width = 1160;
  const height = 540;
  const margin = { top: 20, right: 25, bottom: 65, left: 85 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const duration = 400;
  let model = {
    data,
    groupedData,
    categories,
    years,
    yearsByKey: new Map(groupedData.map(d => [d.year, d])),
    selectedCategory: "All",
    selectedYears: [...years],
    hoveredYear: null
  };

  function initDOM() {
    const svg = d3.select("#viz").append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-labelledby", "chart-title chart-description");
    svg.append("title").attr("id", "chart-title").text("Love-song categories over time");
    const description = svg.append("desc").attr("id", "chart-description");
    svg.append("defs").append("clipPath").attr("id", "streamgraph-clip")
      .append("rect").attr("width", innerWidth).attr("height", innerHeight);
    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
    const paths = chart.append("g").attr("clip-path", "url(#streamgraph-clip)");
    const xAxis = chart.append("g").attr("class", "axis x-axis")
      .attr("transform", `translate(0, ${innerHeight})`);
    const yAxis = chart.append("g").attr("class", "axis y-axis");
    chart.append("text").attr("class", "axis-label")
      .attr("x", innerWidth / 2).attr("y", innerHeight + 50)
      .attr("text-anchor", "middle").text("Year");
    chart.append("text").attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2).attr("y", -62)
      .attr("text-anchor", "middle").text("Number of songs");
    const hitArea = chart.append("rect").attr("class", "hover-area")
      .attr("width", innerWidth).attr("height", innerHeight)
      .attr("fill", "transparent");
    const tooltip = initializeTooltip(svg, margin);
    const guide = initializeTooltipLine(tooltip, innerHeight);
    const panel = tooltip.append("g").attr("class", "tooltip-panel");
    panel.append("rect").attr("class", "tooltip-background").attr("rx", 6);
    const text = panel.append("g");
    return {
      svg, chart, paths, xAxis, yAxis, description, hitArea, tooltip, guide, panel, text,
      select: d3.select("#selectSongCategory"),
      legend: d3.select(".legend").append("ul"),
      selection: d3.select("#chart-selection")
    };
  }

  function initViz(model) {
    const stackGenerator = d3.stack().order(d3.stackOrderNone).offset(d3.stackOffsetWiggle);
    const stacksByCategory = new Map();
    ["All", ...model.categories].forEach(category => {
      const keys = category === "All" ? model.categories : [category];
      const series = stackGenerator.keys(keys)(model.groupedData);
      const boundaries = series.flatMap(layer => layer.flatMap(point => [point[0], point[1]]));
      const [min, max] = d3.extent(boundaries);
      // A constant translation centers the envelope without changing any band thickness.
      const center = (min + max) / 2;
      series.forEach(layer => layer.forEach(point => {
        point[0] -= center;
        point[1] -= center;
      }));
      stacksByCategory.set(category, series);
    });
    const extent = d3.max([...stacksByCategory.values()].flatMap(series =>
      series.flatMap(layer => layer.flatMap(point => [Math.abs(point[0]), Math.abs(point[1])]))));
    const yScale = d3.scaleLinear().domain([-extent || -1, extent || 1])
      .nice().range([innerHeight, 0]);
    const xScale = d3.scaleLinear().range([0, innerWidth]);
    const colorScale = d3.scaleOrdinal().domain(model.categories).range([
      "#9b9b9b", "#368768", "#58a6a6", "#94618e",
      "#df777e", "#d8aa42", "#e17b35", "#5386bf"
    ]);
    const areaGenerator = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));
    return {
      stackGenerator, stacksByCategory, xScale, yScale, colorScale, areaGenerator,
      animating: false, renderVersion: 0, singleYear: false
    };
  }

  const dom = initDOM();
  const viz = initViz(model);

  function initSlider(model) {
    return new rSlider({
      target: "#yearsSlider",
      values: d3.range(model.years[0], model.years[1] + 1),
      range: true,
      tooltip: true,
      scale: true,
      labels: false,
      set: [...model.years],
      onChange: values => update({ selectedYears: values.split(",").map(Number) })
    });
  }

  function initLegend(model) {
    const entries = dom.legend.selectAll("li")
      .data(model.categories).join("li");
    entries.append("span").attr("class", "legend-color")
      .style("background-color", d => viz.colorScale(d));
    entries.append("span").attr("class", "legend-label").text(d => d);
  }

  function initOptions(model) {
    dom.select.selectAll("option").data(["All", ...model.categories])
      .join("option").attr("value", d => d).text(d => d);
  }

  function update(patch) {
    const category = patch.selectedCategory ?? model.selectedCategory;
    const range = patch.selectedYears ?? model.selectedYears;
    if (category !== "All" && !model.categories.includes(category)) {
      throw new Error(`Unknown selected category: ${category}`);
    }
    if (range.length !== 2 || !range.every(Number.isInteger) ||
        range[0] < model.years[0] || range[1] > model.years[1] || range[0] > range[1]) {
      throw new Error("The selected year range is invalid.");
    }
    const filtersChanged = category !== model.selectedCategory ||
      range.some((year, i) => year !== model.selectedYears[i]);
    if (!filtersChanged && (!Object.hasOwn(patch, "hoveredYear") ||
        patch.hoveredYear === model.hoveredYear)) {
      return;
    }
    model = { ...model, ...patch, hoveredYear: filtersChanged ? null :
      (patch.hoveredYear === undefined ? model.hoveredYear : patch.hoveredYear) };
    view(dom, model, viz, filtersChanged);
  }

  function view(dom, model, viz, animate = false) {
    if (!animate && viz.renderVersion > 0) {
      drawHover();
      return;
    }
    const version = ++viz.renderVersion;
    const [first, last] = model.selectedYears;
    const singleYear = first === last;
    const geometryChanged = singleYear !== viz.singleYear ||
      (singleYear && viz.singleYearValue !== first);
    viz.singleYear = singleYear;
    viz.singleYearValue = first;
    viz.xScale.domain(singleYear ? [first - 0.5, first + 0.5] : [first, last]);
    let series = viz.stacksByCategory.get(model.selectedCategory);
    if (singleYear) {
      series = series.map(layer => {
        const point = layer.find(d => d.data.year === first);
        const band = [first - 0.5, first + 0.5].map(year => {
          const sample = [point[0], point[1]];
          sample.data = { year };
          return sample;
        });
        band.key = layer.key;
        return band;
      });
    }
    const ticks = singleYear ? [first] : [...new Set([
      first, ...viz.xScale.ticks(10).filter(year => Number.isInteger(year) &&
        viz.xScale(year) >= 65 && innerWidth - viz.xScale(year) >= 65), last
    ])].sort(d3.ascending);
    const xAxis = d3.axisBottom(viz.xScale).tickValues(ticks).tickFormat(d3.format("d"));
    dom.paths.selectAll("path").interrupt("chart");
    dom.xAxis.interrupt("chart");
    const paths = dom.paths.selectAll("path").data(series, d => d.key);
    if (animate) {
      paths.exit().transition("chart").duration(duration).attr("opacity", 0).remove();
    } else {
      paths.exit().remove();
    }
    const entered = paths.enter().append("path").attr("class", "stream")
      .attr("fill", d => viz.colorScale(d.key))
      .attr("d", viz.areaGenerator).attr("opacity", animate ? 0 : 1);
    const merged = entered.merge(paths);
    viz.animating = animate;
    if (animate) {
      if (geometryChanged) {
        // Single-year display has a different path topology; fade instead of morphing it.
        merged.attr("d", viz.areaGenerator).attr("opacity", 0);
      }
      merged.transition("chart").duration(duration)
        .attr("d", viz.areaGenerator).attr("opacity", 1);
      dom.xAxis.transition("chart").duration(duration).call(xAxis)
        .on("end", () => {
          if (version === viz.renderVersion) {
            viz.animating = false;
          }
        });
    } else {
      merged.attr("d", viz.areaGenerator).attr("opacity", 1);
      dom.xAxis.call(xAxis);
    }
    dom.yAxis.call(d3.axisLeft(viz.yScale));
    dom.select.property("value", model.selectedCategory);
    dom.legend.selectAll("li")
      .classed("muted", d => model.selectedCategory !== "All" && d !== model.selectedCategory)
      .classed("selected", d => d === model.selectedCategory);
    const rangeLabel = singleYear ? `${first}` : `${first}-${last}`;
    dom.selection.text(`${model.selectedCategory} | ${rangeLabel}`);
    dom.description.text(`${model.selectedCategory}, ${rangeLabel}. Band thickness represents ` +
      "the number of songs. Vertical positions are centered offsets, not negative song counts.");
    drawHover();
  }

  function drawHover() {
    const year = model.hoveredYear;
    dom.tooltip.attr("display", year === null || viz.animating ? "none" : null);
    if (year === null || viz.animating) {
      return;
    }
    const row = model.yearsByKey.get(year);
    const keys = model.selectedCategory === "All" ? model.categories : [model.selectedCategory];
    const values = { Year: year, "Total songs (all categories)": row.total };
    keys.forEach(category => { values[category] = row[category]; });
    const x = viz.xScale(year);
    dom.guide.attr("x1", x).attr("x2", x);
    setTooltipText(values, dom.text);
    const bounds = dom.text.node().getBBox();
    const panelWidth = bounds.width + 24;
    const panelHeight = Object.keys(values).length * 22 + 16;
    const panelX = x + 14 + panelWidth <= innerWidth ? x + 14 : x - panelWidth - 14;
    const viewport = dom.svg.node().parentNode.getBoundingClientRect();
    const matrix = dom.chart.node().getScreenCTM();
    const visibleLeft = Math.max(0, (viewport.left - matrix.e) / matrix.a);
    const visibleRight = Math.min(innerWidth, (viewport.right - matrix.e) / matrix.a);
    const boundedX = Math.max(visibleLeft, Math.min(panelX, visibleRight - panelWidth));
    dom.panel.attr("transform", `translate(${boundedX}, 12)`);
    dom.panel.select("rect").attr("width", panelWidth).attr("height", panelHeight);
  }

  function initEvents() {
    dom.select.on("change", event => update({ selectedCategory: event.target.value }));
    dom.hitArea.on("mousemove", event => {
      if (viz.animating) {
        return;
      }
      const [x] = d3.pointer(event, dom.chart.node());
      const year = Math.max(model.selectedYears[0], Math.min(model.selectedYears[1],
        Math.round(viz.xScale.invert(x))));
      update({ hoveredYear: year });
    }).on("mouseleave", () => update({ hoveredYear: null }));
  }

  function init(model) {
    initOptions(model);
    initLegend(model);
    view(dom, model, viz);
    initEvents();
    initSlider(model);
  }

  init(model);
}

function showChartError(error) {
  console.error("Unable to display the love-song chart:", error);
  const status = document.getElementById("chart-status");
  status.textContent = `Unable to display the chart: ${error.message}. Serve this folder over HTTP and check that the CSV and scripts are available.`;
  status.setAttribute("role", "alert");
  document.getElementById("selectSongCategory").disabled = true;
  document.getElementById("yearsSlider").disabled = true;
}

async function main() {
  try {
    const rows = await d3.csv("data/love_song_categories_for_Billboard_Top_10_hits_1958_2023.csv");
    createViz(normalizeSongs(rows, songCategories), songCategories);
    document.getElementById("chart-status").textContent = "";
  } catch (error) {
    showChartError(error);
  }
}

main();
