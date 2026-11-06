import { COLOURS, GROUP_COLOURS, GARMENTS, LAYOUT, scoreRadius, scoreText, modeText, emphasizedBands } from "./model.js";

function setSwatch(selection, colour) {
  selection.attr("class", `swatch${colour === null ? " swatch-missing" : colour === "patterned" ? " swatch-patterned" : ""}`)
    .style("--swatch", colour !== null && colour !== "patterned" ? COLOURS[colour] : null)
    .attr("aria-hidden", "true");
}

export function createDOM(d3, model, actions) {
  for (const group of model.groups) {
    if (!Object.hasOwn(GROUP_COLOURS, group.size)) throw new Error(`Unsupported band size ${group.size}; update the group colour key.`);
  }
  const svg = d3.select("#viz").append("svg")
    .attr("viewBox", `0 0 ${LAYOUT.width} ${LAYOUT.width}`)
    .attr("role", "group").attr("aria-labelledby", "svg-title svg-description");
  svg.append("title").attr("id", "svg-title").text("Band size and recorded clothing-colour uniformity");
  svg.append("desc").attr("id", "svg-description");
  const chart = svg.append("g").attr("transform", `translate(${LAYOUT.centre},${LAYOUT.centre})`);
  const guideArc = d3.arc().startAngle(LAYOUT.start).endAngle(LAYOUT.end);
  const ticks = [0, 0.5, 1];
  chart.append("g").selectAll("path").data(ticks).join("path").attr("class", "score-guide")
    .attr("d", value => guideArc({ innerRadius: scoreRadius(value), outerRadius: scoreRadius(value) }));
  const axis = chart.append("g").attr("aria-hidden", "true");
  axis.append("line").attr("class", "score-axis").attr("x1", 0).attr("x2", 0)
    .attr("y1", -LAYOUT.inner).attr("y2", -LAYOUT.outer);
  ticks.forEach(value => {
    axis.append("line").attr("class", "score-axis").attr("x1", -5).attr("x2", 7)
      .attr("y1", -scoreRadius(value)).attr("y2", -scoreRadius(value));
    axis.append("text").attr("class", "scale-label").attr("x", value === 0 ? -24 : 0)
      .attr("y", -scoreRadius(value) + (value === 0 ? 16 : 28))
      .attr("text-anchor", "middle").text(`${value * 100}%`);
  });
  chart.append("text").attr("class", "centre-title").attr("y", -15).text(`${model.bands.length} bands`);
  chart.append("text").attr("id", "garment-caption").attr("class", "centre-note").attr("y", 22);
  chart.append("text").attr("id", "selection-caption").attr("class", "centre-note selection-caption").attr("y", 57);
  const groupArc = d3.arc().innerRadius(LAYOUT.arcInner).outerRadius(LAYOUT.arcOuter);
  const arcs = chart.append("g").selectAll("path").data(model.groups, group => group.size).join("path")
    .attr("class", "group-arc").attr("d", groupArc).attr("fill", group => GROUP_COLOURS[group.size])
    .attr("role", "button").attr("tabindex", 0)
    .attr("aria-label", group => `Emphasise ${group.size}-member bands, ${group.count} bands in the full dataset`)
    .on("click", (_, group) => actions.focusGroup(group.size))
    .on("keydown", (event, group) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); actions.focusGroup(group.size); }
    });
  drawGroupLabels(d3, chart, model.groups);
  const marks = chart.append("g").attr("class", "band-marks");
  const dom = {
    svg, chart, arcs, marks, d3,
    garment: d3.select("#garment"), band: d3.select("#band-select"),
    status: d3.select("#chart-status"),
    tooltip: d3.select("#tooltip"), announcement: d3.select("#announcement")
  };
  dom.band.selectAll("option").remove();
  dom.groups = d3.select("#group-controls").selectAll("button")
    .data([{ size: "all", count: model.bands.length }, ...model.groups], group => group.size)
    .join("button").attr("type", "button").attr("class", "group-key")
    .attr("data-size", group => group.size)
    .attr("aria-label", group => group.size === "all" ? "Show all group colours"
      : `Emphasise ${group.size}-member bands, ${group.count} bands`)
    .on("click", (_, group) => actions.focusGroup(group.size));
  dom.groups.filter(group => group.size !== "all").append("span").attr("class", "group-swatch")
    .style("background-color", group => GROUP_COLOURS[group.size]).attr("aria-hidden", "true");
  dom.groups.append("span").text(group => group.size === "all" ? "All"
    : `${group.size} members: ${group.count}`);
  dom.garment.on("change", event => actions.update({ activeGarment: event.target.value }));
  dom.band.on("change", event => actions.update({ selectedBandId: event.target.value || null }));
  d3.select("#clear-selection").on("click", () => actions.update({ selectedBandId: null }));
  d3.select("#controls").on("submit", event => event.preventDefault());
  d3.select("#control-fields").property("disabled", false);
  return dom;
}

function drawGroupLabels(d3, chart, groups) {
  const labels = groups.map(group => {
    const angle = (group.startAngle + group.endAngle) / 2;
    const anchor = d3.pointRadial(angle, 403);
    return { ...group, anchor, side: anchor[0] < 0 ? -1 : 1, y: anchor[1] };
  });
  for (const side of [-1, 1]) {
    let previous = -430;
    for (const label of labels.filter(value => value.side === side).sort((a, b) => a.y - b.y)) {
      label.y = Math.max(label.y, previous + 64);
      previous = label.y;
    }
  }
  const items = chart.append("g").attr("aria-hidden", "true").selectAll("g").data(labels).join("g");
  items.append("path").attr("class", "group-leader")
    .attr("d", label => `M${label.anchor} L${label.side * 348},${label.y} L${label.side * 362},${label.y}`);
  items.append("text").attr("class", "group-label").attr("x", label => label.side * 370)
    .attr("y", label => label.y - 5).attr("text-anchor", label => label.side < 0 ? "end" : "start")
    .text(label => `${label.size} members`);
  items.append("text").attr("class", "group-count").attr("x", label => label.side * 370)
    .attr("y", label => label.y + 20).attr("text-anchor", label => label.side < 0 ? "end" : "start")
    .text(label => `${label.count} ${label.count === 1 ? "band" : "bands"}`);
}

export function render(dom, model, state, actions) {
  const { d3 } = dom;
  const bands = model.bands;
  const emphasized = emphasizedBands(model, state);
  const garment = state.activeGarment;
  const known = model.bands.reduce((sum, band) => sum + band.summaries[garment].known, 0);
  dom.status.classed("visually-hidden", true).text(`${emphasized.length} of ${bands.length} bands emphasised; all remain in the overview. ${GARMENTS[garment].label}: ${known} known colours across ${model.members.length} member records${known < model.members.length ? ` (${model.members.length - known} missing)` : ""}.`);
  d3.select("#garment-caption").text(`Recorded ${GARMENTS[garment].label.toLowerCase()}`);
  d3.select("#selection-caption").text(state.selectedBandId || "Select a band to explore");
  dom.svg.select("#svg-description").text(`Full circle: ${bands.length} bands, grouped clockwise by member count from the top. Arc width represents band count; colour identifies the labelled size group. Radial position represents matching pairs, from zero percent on the inner guide to one hundred percent on the outer guide. Select a point or use the band selector to see its members. Current clothing: ${GARMENTS[garment].label}.`);
  dom.garment.property("value", garment);
  dom.band.selectAll("option").data([{ id: "", name: "Choose a band..." }, ...bands], band => band.id)
    .join("option").attr("value", band => band.id).text(band => band.name);
  dom.band.property("value", state.selectedBandId || "");
  dom.arcs.classed("is-emphasized", group => state.sizeFocus === group.size)
    .attr("aria-pressed", group => String(state.sizeFocus === group.size));
  dom.groups.attr("aria-pressed", group => String(state.sizeFocus === group.size));

  const marks = dom.marks.selectAll(".band-mark").data(
    bands.filter(band => band.summaries[garment].score !== null), band => band.id
  ).join(enter => {
    const item = enter.append("g").attr("class", "band-mark").attr("role", "button").attr("tabindex", 0);
    item.append("line").attr("class", "band-stem");
    item.append("circle").attr("class", "band-halo").attr("r", 8);
    item.append("circle").attr("class", "band-point").attr("r", 5);
    item.append("circle").attr("class", "band-hit").attr("r", 9);
    return item;
  }).attr("data-band", band => band.id)
    .classed("is-muted", band => state.sizeFocus !== "all" && state.sizeFocus !== band.totalMembers)
    .classed("is-selected", band => band.id === state.selectedBandId)
    .attr("aria-pressed", band => String(band.id === state.selectedBandId))
    .attr("aria-label", band => {
      const s = band.summaries[garment];
      return `${band.name}, ${band.totalMembers} members. Matching pairs ${scoreText(s)}: ${s.matchingPairs} out of ${s.totalPairs}. ${s.known} of ${band.totalMembers} colours known. Select for member details.`;
    })
    .on("click", (_, band) => actions.update({ selectedBandId: band.id }))
    .on("keydown", (event, band) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); actions.update({ selectedBandId: band.id }); }
      if (event.key === "Escape") actions.hideTooltip();
    })
    .on("pointerenter focus", (event, band) => actions.showTooltip(event.currentTarget, band))
    .on("pointerleave blur", actions.scheduleHideTooltip);
  marks.select(".band-stem")
    .attr("x1", band => d3.pointRadial(band.angle, LAYOUT.inner)[0])
    .attr("y1", band => d3.pointRadial(band.angle, LAYOUT.inner)[1])
    .attr("x2", band => d3.pointRadial(band.angle, scoreRadius(band.summaries[garment].score))[0])
    .attr("y2", band => d3.pointRadial(band.angle, scoreRadius(band.summaries[garment].score))[1]);
  for (const selector of [".band-point", ".band-halo", ".band-hit"]) {
    marks.select(selector)
      .attr("cx", band => d3.pointRadial(band.angle, scoreRadius(band.summaries[garment].score))[0])
      .attr("cy", band => d3.pointRadial(band.angle, scoreRadius(band.summaries[garment].score))[1]);
  }
  marks.select(".band-point").attr("fill", band => GROUP_COLOURS[band.totalMembers]);
  const unavailable = bands.filter(band => band.summaries[garment].score === null);
  d3.select("#unavailable").property("hidden", !unavailable.length)
    .text(unavailable.length ? `Not plotted: ${unavailable.map(band => band.name).join(", ")}. Fewer than two known colours; use the band selector to inspect their records.` : "");
  renderDetails(d3, model.byId.get(state.selectedBandId), garment);
}

function renderDetails(d3, band, garment) {
  d3.select("#detail-panel").property("hidden", !band);
  d3.select("#detail-title").text(band ? band.name : "Look inside a band");
  if (!band) {
    d3.select("#category-summary").property("open", false);
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
  countItems.select(".count-value").text(item => item.count);
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
