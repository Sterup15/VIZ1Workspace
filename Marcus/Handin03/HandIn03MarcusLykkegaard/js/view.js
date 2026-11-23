import { COLOURS, GARMENTS, LAYOUT, scoreRadius, scoreText, modeText, filteredBands, colourMarks } from "./model.js";

const colourFill = colour => colour === "mixed" ? "url(#mixed-pattern)"
  : colour === "patterned" ? "url(#clothing-pattern)" : COLOURS[colour];

function animate(selection, duration) {
  selection.interrupt("chart");
  return duration ? selection.transition("chart").duration(duration) : selection;
}

function setSwatch(selection, colour) {
  selection.attr("class", `swatch${colour === null ? " swatch-missing" : colour === "patterned" ? " swatch-patterned" : ""}`)
    .style("--swatch", colour !== null && colour !== "patterned" ? COLOURS[colour] : null)
    .attr("aria-hidden", "true");
}

export function createDOM(d3, model, actions) {
  const svg = d3.select("#viz").append("svg")
    .attr("viewBox", `0 100 ${LAYOUT.width} ${LAYOUT.width - 200}`)
    .attr("role", "group").attr("aria-labelledby", "svg-title svg-description");
  svg.append("title").attr("id", "svg-title").text("Recorded clothing colours and matching pairs");
  svg.append("desc").attr("id", "svg-description");
  const pattern = svg.append("defs").append("pattern").attr("id", "clothing-pattern")
    .attr("patternUnits", "userSpaceOnUse").attr("width", 8).attr("height", 8);
  pattern.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#fffefb");
  pattern.append("path").attr("d", "M0,0H4V4H0Z M4,4H8V8H4Z").attr("fill", "#617f73");
  const mixed = svg.select("defs").append("pattern").attr("id", "mixed-pattern")
    .attr("patternUnits", "userSpaceOnUse").attr("width", 8).attr("height", 8).attr("patternTransform", "rotate(45)");
  mixed.append("rect").attr("width", 8).attr("height", 8).attr("fill", "#e7dbea");
  mixed.append("rect").attr("width", 4).attr("height", 8).attr("fill", "#786780");
  const chart = svg.append("g").attr("transform", `translate(${LAYOUT.centre},${LAYOUT.centre})`);
  const guideArc = d3.arc().startAngle(LAYOUT.start).endAngle(LAYOUT.end);
  chart.append("path").attr("class", "score-field")
    .attr("d", guideArc({ innerRadius: LAYOUT.inner, outerRadius: LAYOUT.outer }));
  chart.append("circle").attr("class", "centre-disc").attr("r", LAYOUT.arcInner - 14);
  const ticks = [0, 0.5, 1];
  chart.append("g").selectAll("path").data(ticks).join("path").attr("class", "score-guide")
    .classed("is-outer", value => value === 1).classed("is-inner", value => value === 0)
    .attr("d", value => guideArc({ innerRadius: scoreRadius(value), outerRadius: scoreRadius(value) }));
  chart.append("text").attr("id", "band-caption").attr("class", "centre-title").attr("y", -15);
  chart.append("text").attr("id", "garment-caption").attr("class", "centre-note").attr("y", 22);
  chart.append("text").attr("id", "selection-caption").attr("class", "centre-note selection-caption").attr("y", 57);
  const colourFlow = chart.append("g").attr("aria-hidden", "true").attr("pointer-events", "none");
  const arcs = chart.append("g");
  const labels = chart.append("g").attr("aria-hidden", "true");
  const marks = chart.append("g").attr("class", "band-marks");
  const scaleLabels = chart.append("g").attr("aria-hidden", "true");
  const dom = {
    svg, chart, colourFlow, arcs, labels, marks, scaleLabels, d3,
    garment: d3.select("#garment"), band: d3.select("#band-select"),
    status: d3.select("#chart-status"),
    tooltip: d3.select("#tooltip"), announcement: d3.select("#announcement")
  };
  dom.band.selectAll("option").remove();
  dom.allColours = d3.select("#all-colours").property("disabled", false)
    .on("click", () => actions.update({ colourFocus: "all" }));
  dom.slider = d3.select("#colour-slider")
    .on("input", event => actions.update({ colourPosition: Number(event.target.value) }));
  dom.garment.on("change", event => actions.update({ activeGarment: event.target.value }));
  dom.band.on("change", event => actions.update({ selectedBandId: event.target.value || null }));
  d3.select("#clear-selection").on("click", () => actions.update({ selectedBandId: null }));
  d3.select("#controls").on("submit", event => event.preventDefault());
  d3.select("#control-fields").property("disabled", false);
  return dom;
}

function drawColours(dom, groups, actions, duration) {
  const { d3 } = dom;
  const arc = d3.arc().innerRadius(LAYOUT.arcInner).outerRadius(LAYOUT.arcOuter);
  const anchors = groups.filter(group => group.colour !== "patterned" && group.colour !== "mixed").map(group => ({
    angle: (group.startAngle + group.endAngle) / 2, colour: COLOURS[group.colour]
  }));
  const stops = anchors.length ? [
    { ...anchors.at(-1), angle: anchors.at(-1).angle - 2 * Math.PI },
    ...anchors,
    { ...anchors[0], angle: anchors[0].angle + 2 * Math.PI }
  ] : [];
  const flow = d3.scaleLinear().domain(stops.map(stop => stop.angle))
    .range(stops.map(stop => stop.colour)).interpolate(d3.interpolateRgb.gamma(2.2));
  const steps = 720;
  const flowPaths = dom.colourFlow.selectAll("path").data(anchors.length ? d3.range(steps) : []).join("path")
    .attr("class", "colour-flow")
    .attr("d", index => arc({
      startAngle: index * 2 * Math.PI / steps,
      endAngle: Math.min(2 * Math.PI, (index + 1) * 2 * Math.PI / steps + 0.0005)
    }));
  animate(flowPaths, duration).attr("fill", index => flow((index + 0.5) * 2 * Math.PI / steps));
  const gradientStops = anchors.length ? d3.range(181)
    .map(index => `${flow(index / 180 * 2 * Math.PI)} ${index / 180 * 100}%`) : [];
  d3.select("#colour-gradient").style("background", gradientStops.length
    ? `linear-gradient(to bottom, ${gradientStops.join(", ")})` : null)
    .selectAll(".ramp-pattern").data(groups.filter(group => group.colour === "patterned" || group.colour === "mixed")).join("span")
    .attr("class", group => `ramp-pattern${group.colour === "mixed" ? " ramp-mixed" : ""}`)
    .style("top", group => `${group.startAngle / (2 * Math.PI) * 100}%`)
    .style("height", group => `${(group.endAngle - group.startAngle) / (2 * Math.PI) * 100}%`);
  d3.select("#ramp-start").text(groups[0]?.colour || "No recorded colours");
  d3.select("#ramp-end").text(groups.at(-1)?.colour || "");
  dom.arcs.selectAll("path").data(groups, group => group.colour).join("path")
    .attr("class", "colour-arc").attr("d", arc).attr("fill", group => colourFill(group.colour))
    .attr("fill-opacity", group => group.colour === "patterned" || group.colour === "mixed" ? 1 : 0)
    .attr("data-colour", group => group.colour).attr("role", "button").attr("tabindex", 0)
    .attr("aria-label", group => `Filter ${group.count} bands in the ${group.colour} most-common-colour group`)
    .on("click", (_, group) => actions.filterColour(group.colour))
    .on("keydown", (event, group) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); actions.filterColour(group.colour); }
    });
  const labels = groups.map(group => {
    const anchor = d3.pointRadial((group.startAngle + group.endAngle) / 2, 410);
    return { ...group, anchor, side: anchor[0] < 0 ? -1 : 1, y: anchor[1] };
  });
  for (const side of [-1, 1]) {
    const items = labels.filter(label => label.side === side).sort((a, b) => a.y - b.y);
    items.forEach((label, index) => { label.y = Math.max(label.y, index ? items[index - 1].y + 27 : -450); });
    for (let index = items.length - 1; index >= 0; index--) {
      items[index].y = Math.min(items[index].y, index === items.length - 1 ? 450 : items[index + 1].y - 27);
    }
  }
  dom.labels.selectAll("path").data(labels, label => label.colour).join("path")
    .attr("class", "colour-leader").attr("d", label => `M${label.anchor} L${label.side * 430},${label.y} H${label.side * 440}`);
  dom.labels.selectAll("text").data(labels, label => label.colour).join("text")
    .attr("class", "colour-label").attr("dy", ".35em").attr("x", label => label.side * 447)
    .attr("y", label => label.y).attr("text-anchor", label => label.side < 0 ? "end" : "start")
    .text(label => label.colour);
}

export function render(dom, model, state, actions) {
  const { d3 } = dom;
  const duration = dom.rendered && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 450 : 0;
  dom.rendered = true;
  const bands = filteredBands(model, state);
  const garment = state.activeGarment;
  const plotted = colourMarks(model, state);
  const groups = model.colourLayouts[garment].groups;
  const known = model.bands.reduce((sum, band) => sum + band.summaries[garment].known, 0);
  dom.status.classed("visually-hidden", true).text(`${bands.length} of ${model.bands.length} bands; ${plotted.length} pins plotted. ${GARMENTS[garment].label}: ${known} known colours across ${model.members.length} member records${known < model.members.length ? ` (${model.members.length - known} missing)` : ""}.`);
  d3.select("#filter-status").text(`${state.colourFocus === "all" ? "All colours" : state.colourFocus}: ${bands.length} of ${model.bands.length} bands`);
  d3.select("#band-caption").text(`${bands.length} bands`);
  d3.select("#garment-caption").text(`Recorded ${GARMENTS[garment].label.toLowerCase()}`);
  d3.select("#selection-caption").text(state.selectedBandId || "Select a band to explore");
  dom.svg.select("#svg-description").text(`One pin per band, grouped by most common clothing colour. Ties belong to the mixed sector. Arc width counts bands. Radial position shows the overall matching-pair score for ${GARMENTS[garment].label}, from zero on the inner guide to one hundred percent on the outer guide. ${bands.length} bands in this filter. Select a pin for colours and percentages in the right-hand legend.`);
  dom.garment.property("value", garment);
  dom.band.selectAll("option").data([{ id: "", name: "Choose a band..." }, ...bands], band => band.id)
    .join("option").attr("value", band => band.id).text(band => band.name);
  dom.band.property("value", state.selectedBandId || "");
  if (dom.drawnGarment !== garment) {
    drawColours(dom, groups, actions, duration);
    drawScaleLabels(dom, model.colourLayouts[garment].marks.filter(band => band.summaries[garment].score !== null), garment);
    dom.drawnGarment = garment;
  }
  dom.arcs.selectAll("path").classed("is-filtered", group => state.colourFocus === group.colour)
    .attr("aria-pressed", group => String(state.colourFocus === group.colour));
  dom.allColours.attr("aria-pressed", String(state.colourFocus === "all"));
  dom.slider.property("disabled", !groups.length).property("value", state.colourPosition ?? 0)
    .attr("aria-valuetext", state.colourFocus === "all" ? "All colours; move the pin to filter"
      : `${state.colourFocus}, ${groups.find(group => group.colour === state.colourFocus).count} bands`)
    .on("keydown", event => {
      const current = groups.findIndex(group => group.colour === state.colourFocus);
      let index;
      if (event.key === "Home") index = 0;
      else if (event.key === "End") index = groups.length - 1;
      else if (event.key === "ArrowDown" || event.key === "ArrowRight") index = current + 1;
      else if (event.key === "ArrowUp" || event.key === "ArrowLeft") index = current < 0 ? groups.length - 1 : current - 1;
      else return;
      event.preventDefault();
      actions.update({ colourFocus: groups[Math.max(0, Math.min(groups.length - 1, index))].colour });
    });

  dom.marks.selectAll(".band-exit").interrupt("chart").remove();
  const marks = dom.marks.selectAll(".band-mark").data(plotted, band => band.key).join(enter => {
    const item = enter.append("g").attr("class", "band-mark").attr("role", "button").attr("tabindex", 0).style("opacity", 0);
    item.append("line").attr("class", "band-stem").attr("aria-hidden", "true");
    item.append("circle").attr("class", "band-halo").attr("r", 10);
    item.append("circle").attr("class", "band-point").attr("r", 5);
    item.append("circle").attr("class", "band-hit").attr("r", 12);
    positionMarks(dom, item, () => LAYOUT.inner, 0);
    return item;
  }, update => update, exit => {
    exit.classed("band-mark", false).classed("band-exit", true).attr("tabindex", null)
      .attr("aria-hidden", "true").style("pointer-events", "none");
    animate(exit, duration).style("opacity", 0).remove();
  }).attr("data-band", band => band.id).attr("data-colour", band => band.colour)
    .classed("is-selected", band => band.id === state.selectedBandId)
    .attr("aria-pressed", band => String(band.id === state.selectedBandId))
    .attr("aria-label", band => {
      const s = band.summaries[garment];
      return `${band.name}, ${band.colour} sector, ${band.totalMembers} members. Overall matching pairs ${scoreText(s)}: ${s.matchingPairs} out of ${s.totalPairs}. ${s.known} of ${band.totalMembers} colours known. Select for member details.`;
    })
    .on("click", (event, band) => {
      actions.update({ selectedBandId: band.id });
      actions.showTooltip(event.currentTarget, band);
    })
    .on("keydown", (event, band) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); actions.update({ selectedBandId: band.id }); }
      if (event.key === "Escape") actions.hideTooltip();
    })
    .on("pointerenter focus", (event, band) => actions.showTooltip(event.currentTarget, band))
    .on("pointerleave blur", actions.scheduleHideTooltip);
  animate(marks, duration).style("opacity", 1);
  const points = positionMarks(dom, marks, band => scoreRadius(band.summaries[garment].score), duration);
  marks.select(".band-point").attr("fill", band => colourFill(band.colour));
  points.attr("r", band => band.id === state.selectedBandId ? 8 : 6.5);
  const unavailable = bands.filter(band => band.summaries[garment].score === null);
  d3.select("#unavailable").property("hidden", !unavailable.length)
    .text(unavailable.length ? `Not plotted: ${unavailable.map(band => band.name).join(", ")}. Fewer than two known colours; use the band selector for their records.` : "");
  renderDetails(d3, model.byId.get(state.selectedBandId), garment);
}

function positionMarks(dom, marks, radius, duration) {
  const point = band => dom.d3.pointRadial(band.angle, radius(band));
  animate(marks.select(".band-stem"), duration)
    .attr("x1", band => dom.d3.pointRadial(band.angle, LAYOUT.arcOuter)[0])
    .attr("y1", band => dom.d3.pointRadial(band.angle, LAYOUT.arcOuter)[1])
    .attr("x2", band => point(band)[0]).attr("y2", band => point(band)[1]);
  let points;
  for (const selector of [".band-point", ".band-halo", ".band-hit"]) {
    const target = animate(marks.select(selector), duration).attr("cx", band => point(band)[0]).attr("cy", band => point(band)[1]);
    if (selector === ".band-point") points = target;
  }
  return points;
}

function drawScaleLabels(dom, bands, garment) {
  const { d3 } = dom;
  const points = bands.map(band => d3.pointRadial(band.angle, scoreRadius(band.summaries[garment].score)));
  const labels = [0, .5, 1].map(value => {
    const width = value === 0 ? 42 : value === .5 ? 56 : 64;
    const point = d3.range(0, 360, 3).map(degrees => d3.pointRadial(degrees * Math.PI / 180, scoreRadius(value)))
      .find(([x, y]) => Math.hypot(Math.max(0, Math.abs(x) - width / 2), Math.max(0, Math.abs(y) - 14)) > LAYOUT.arcOuter &&
        points.every(([px, py]) => Math.abs(px - x) > width / 2 + 11 || Math.abs(py - y) > 25));
    if (!point) throw new Error("Cannot place a score label without covering a band.");
    return { value, width, x: point[0], y: point[1] };
  });
  const items = dom.scaleLabels.selectAll("g").data(labels, label => label.value).join(enter => {
    const item = enter.append("g");
    item.append("rect").attr("class", "scale-backplate").attr("y", -14).attr("height", 28).attr("rx", 8);
    item.append("text").attr("class", "scale-label").attr("text-anchor", "middle").attr("dy", ".35em");
    return item;
  }).attr("transform", label => `translate(${label.x},${label.y})`);
  items.select("rect").attr("x", label => -label.width / 2).attr("width", label => label.width);
  items.select("text").text(label => `${label.value * 100}%`);
}

function renderDetails(d3, band, garment) {
  d3.select("#detail-empty").property("hidden", Boolean(band));
  d3.select("#detail-panel").property("hidden", !band);
  d3.select("#detail-title").text(band ? band.name : "Look inside a band");
  if (!band) {
    d3.select("#member-records").property("open", false);
    d3.select("#member-list").selectAll("li").remove();
    d3.select("#colour-counts").selectAll("li").remove();
    return;
  }
  const summary = band.summaries[garment];
  d3.select("#detail-subtitle").text(`${band.totalMembers} member records / ${GARMENTS[garment].label.toLowerCase()}`);
  d3.select("#detail-score").classed("is-unavailable", summary.score === null).text(scoreText(summary));
  d3.select("#detail-pairs").text(summary.score === null ? "Not enough known colours to form a pair."
    : `${summary.matchingPairs} matching ${summary.matchingPairs === 1 ? "pair" : "pairs"} out of ${summary.totalPairs} known-member pairs.`);
  d3.select("#detail-coverage").classed("incomplete", summary.missing > 0)
    .text(`${summary.known} known colours out of ${band.totalMembers} members.${summary.missing ? ` ${summary.missing} missing; the score describes only the known colours.` : ""}`);
  d3.select("#detail-mode").text(modeText(summary));
  const counts = [...summary.counts].map(([colour, count]) => ({ colour, count }));
  if (summary.missing) counts.push({ colour: null, count: summary.missing });
  const countItems = d3.select("#colour-counts").selectAll("li").data(counts, item => item.colour).join(enter => {
    const li = enter.append("li");
    li.append("span").attr("class", "swatch");
    li.append("span").attr("class", "count-name");
    li.append("span").attr("class", "count-value");
    return li;
  });
  countItems.each(function (item) { setSwatch(d3.select(this).select(".swatch"), item.colour); });
  countItems.select(".count-name").text(item => item.colour ?? "Missing");
  countItems.select(".count-value").text(item => item.colour === null ? `${item.count} missing`
    : `${item.count} / ${summary.known} (${Number((item.count / summary.known * 100).toFixed(1))}%)`);
  const members = d3.select("#member-list").selectAll("li").data(band.members, member => member.id).join(enter => {
    const li = enter.append("li");
    li.append("span").attr("class", "member-name");
    const colour = li.append("span").attr("class", "member-colour");
    colour.append("span").attr("class", "swatch");
    colour.append("span").attr("class", "member-colour-name");
    return li;
  });
  members.select(".member-name").text(member => member.name);
  members.each(function (member) { setSwatch(d3.select(this).select(".swatch"), member[garment]); });
  members.select(".member-colour-name").text(member => member[garment] ?? "Missing colour");
}
