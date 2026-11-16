import { createModel, parseDataset, scoreText, modeText } from "./model.js";
import { TRACKS, createWheels, filledEnd, comparisonMessage } from "./wheels-model.js";

function drawWheel(d3, container, wheel, actions) {
  const svg = container.append("svg").attr("viewBox", "0 0 320 320")
    .attr("role", "group").attr("aria-labelledby", `wheel-title-${wheel.size}`);
  svg.append("title").attr("id", `wheel-title-${wheel.size}`)
    .text(`${wheel.size}-member bands. Outer track: bottoms. Inner track: shirts. One slot per band; filled fraction shows matching pairs.`);
  const patternId = `unavailable-${wheel.size}`;
  const pattern = svg.append("defs").append("pattern").attr("id", patternId)
    .attr("width", 6).attr("height", 6).attr("patternUnits", "userSpaceOnUse");
  pattern.append("rect").attr("width", 6).attr("height", 6).attr("fill", "#faf9f6");
  pattern.append("path").attr("d", "M-1,1 L1,-1 M0,6 L6,0 M5,7 L7,5").attr("stroke", "#56616a");
  const chart = svg.append("g").attr("transform", "translate(160,160)");
  const outline = d3.arc().innerRadius(92).outerRadius(144);
  const slots = chart.selectAll(".band-slot").data(wheel.slots, slot => slot.band.id).join("g")
    .attr("class", "band-slot").attr("data-band", slot => slot.band.id).attr("role", "button")
    .attr("tabindex", 0).attr("aria-pressed", "false")
    .attr("aria-label", slot => `${slot.band.name}, ${wheel.size} members. ${TRACKS.map(track => {
      const s = slot.band.summaries[track.garment];
      return `${track.label} ${scoreText(s)}, ${s.known} of ${wheel.size} colours known`;
    }).join(". ")}. Select for member evidence.`)
    .on("click", (_, slot) => actions.select(slot.band.id))
    .on("keydown", (event, slot) => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); actions.select(slot.band.id); }
    })
    .on("pointerenter focus", (event, slot) => actions.inspect(event.currentTarget, slot.band))
    .on("pointerleave blur", actions.scheduleHide);
  for (const track of TRACKS) {
    const arc = d3.arc().innerRadius(track.inner).outerRadius(track.outer);
    slots.append("path").attr("class", `track ${track.garment}`).attr("d", arc)
      .style("fill", slot => slot.band.summaries[track.garment].score === null ? `url(#${patternId})` : null);
    slots.append("path").attr("class", `score-fill ${track.garment}`)
      .attr("fill", track.colour)
      .attr("d", slot => {
        const endAngle = filledEnd(slot, slot.band.summaries[track.garment].score);
        return endAngle === null || endAngle === slot.startAngle ? null : arc({ ...slot, endAngle });
      });
    slots.append("line").attr("class", "slot-boundary")
      .attr("x1", slot => d3.pointRadial(slot.startAngle, track.inner)[0])
      .attr("y1", slot => d3.pointRadial(slot.startAngle, track.inner)[1])
      .attr("x2", slot => d3.pointRadial(slot.startAngle, track.outer)[0])
      .attr("y2", slot => d3.pointRadial(slot.startAngle, track.outer)[1]);
  }
  slots.append("path").attr("class", "selection-outline").attr("d", outline);
  slots.append("path").attr("class", "slot-hit").attr("d", outline);
  chart.append("text").attr("class", "average-label").attr("y", -38).text("Average per band");
  TRACKS.forEach((track, index) => {
    chart.append("text").attr("class", "wheel-average").attr("data-garment", track.garment)
      .attr("y", index * 29 - 4).attr("fill", track.colour)
      .text(`${track.label} ${scoreText(wheel.averages[track.garment])}`);
  });
}

function renderEvidence(d3, band) {
  d3.select("#detail-empty").property("hidden", Boolean(band));
  d3.select("#detail-content").property("hidden", !band);
  d3.select("#detail-title").text(band ? band.name : "Look inside a band");
  const cards = d3.select("#band-scores").selectAll(".band-score").data(band ? TRACKS : [], track => track.garment)
    .join(enter => {
      const card = enter.append("section").attr("class", "band-score");
      card.append("h3");
      card.append("p").attr("class", "value");
      card.append("p").attr("class", "pairs");
      card.append("p").attr("class", "known");
      return card;
    }).attr("data-garment", track => track.garment);
  if (band) {
    d3.select("#detail-size").text(`${band.totalMembers} member records`);
    cards.select("h3").text(track => track.label);
    cards.select(".value").style("color", track => track.colour).text(track => scoreText(band.summaries[track.garment]));
    cards.select(".pairs").text(track => {
      const s = band.summaries[track.garment];
      return s.score === null ? "Not enough known colours to form a pair."
        : `${s.matchingPairs} matching ${s.matchingPairs === 1 ? "pair" : "pairs"} out of ${s.totalPairs}.`;
    });
    cards.select(".known").classed("incomplete", track => band.summaries[track.garment].missing > 0).text(track => {
      const s = band.summaries[track.garment];
      return `${s.known} of ${band.totalMembers} colours known.${s.missing ? " Missing colours are excluded, not assumed to match." : ""}`;
    });
    d3.select("#modes").text(TRACKS.map(track => `${track.label}: ${modeText(band.summaries[track.garment])}`).join(". "));
  }
  const rows = d3.select("#members").selectAll("tr").data(band ? band.members : [], member => member.id)
    .join(enter => {
      const row = enter.append("tr");
      row.append("th").attr("scope", "row").attr("class", "name");
      row.append("td").attr("class", "bottom");
      row.append("td").attr("class", "shirt");
      return row;
    });
  rows.select(".name").text(member => member.name);
  rows.select(".bottom").text(member => member.bottom_color ?? "Missing");
  rows.select(".shirt").text(member => member.shirt_color ?? "Missing");
}

export async function start() {
  const d3 = window.d3;
  if (!d3) throw new Error("The local D3 library could not be loaded");
  const response = await fetch(new URL("../boys.csv", import.meta.url), { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Dataset request failed (HTTP ${response.status})`);
  const model = createModel(parseDataset(await response.text(), d3));
  const wheels = createWheels(model);
  const selector = d3.select("#band-select");
  const tooltip = d3.select("#tooltip");
  let hideTimer;

  function hideTooltip() {
    clearTimeout(hideTimer);
    tooltip.property("hidden", true);
    d3.selectAll(".band-slot").classed("is-inspected", false).attr("aria-describedby", null);
  }

  function select(id) {
    try {
      if (id !== null && !model.byId.has(id)) throw new Error("Unknown selected band.");
      const restoreFocus = document.activeElement?.id === "clear-selection";
      hideTooltip();
      selector.property("value", id ?? "");
      d3.selectAll(".band-slot").classed("is-selected", slot => slot.band.id === id)
        .attr("aria-pressed", slot => String(slot.band.id === id));
      const band = model.byId.get(id);
      renderEvidence(d3, band);
      d3.select("#announcement").text(band ? `${band.name} selected. Bottoms ${scoreText(band.summaries.bottom_color)}; shirts ${scoreText(band.summaries.shirt_color)}. Member evidence updated.` : "Band selection cleared.");
      if (restoreFocus) selector.node().focus();
    } catch (error) {
      console.error("Unable to update comparison wheels:", error);
      hideTooltip();
      d3.select("#load-status").property("hidden", false).attr("class", "error")
        .text(`Unable to update comparison wheels: ${error.message}. Reload to try again.`);
      selector.property("disabled", true);
      d3.select("#clear-selection").property("disabled", true);
      d3.selectAll(".band-slot").attr("tabindex", -1).on("click", null).on("keydown", null).on("pointerenter focus", null);
      document.body.dataset.appState = "error";
    }
  }

  function inspect(element, band) {
    hideTooltip();
    d3.select(element).classed("is-inspected", true).attr("aria-describedby", "tooltip");
    tooltip.selectAll("*").remove();
    tooltip.append("strong").text(band.name);
    for (const track of TRACKS) {
      const s = band.summaries[track.garment];
      tooltip.append("p").text(`${track.label}: ${scoreText(s)} (${s.known}/${band.totalMembers} colours known)`);
    }
    tooltip.append("p").text("Select for matching pairs and member records.");
    tooltip.property("hidden", false);
    const box = element.getBoundingClientRect();
    const tip = tooltip.node().getBoundingClientRect();
    tooltip.style("left", `${Math.max(10, Math.min(box.right + 8, innerWidth - tip.width - 10))}px`)
      .style("top", `${Math.max(10, Math.min(box.top, innerHeight - tip.height - 10))}px`);
  }

  const actions = { select, inspect, scheduleHide: () => { clearTimeout(hideTimer); hideTimer = setTimeout(hideTooltip, 180); } };
  const cards = d3.select("#wheels").selectAll("article").data(wheels, wheel => wheel.size).join("article")
    .attr("class", "wheel-card").attr("data-size", wheel => wheel.size);
  cards.append("h2").text(wheel => `${wheel.size} members`);
  cards.append("p").attr("class", wheel => `sample${wheel.count < 3 ? " small-sample" : ""}`)
    .text(wheel => `${wheel.count} ${wheel.count === 1 ? "band" : "bands"}${wheel.count < 3 ? " / very small sample" : ""}`);
  cards.each(function (wheel) {
    const card = d3.select(this);
    drawWheel(d3, card, wheel, actions);
    for (const track of TRACKS) {
      const average = wheel.averages[track.garment];
      if (average.available < wheel.count || average.incomplete) {
        card.append("p").attr("class", "coverage").text(`${track.label}: ${average.available}/${wheel.count} scores available; ${average.incomplete} ${average.incomplete === 1 ? "band" : "bands"} with missing colours.${average.available < wheel.count ? " Hatched slots are unavailable, not zero." : ""}`);
      }
    }
  });
  selector.selectAll("option").remove();
  selector.selectAll("option").data([{ id: "", name: "Choose a band..." }, ...model.bands], band => band.id)
    .join("option").attr("value", band => band.id).text(band => band.name);
  selector.on("change", event => select(event.target.value || null)).property("disabled", false);
  d3.select("#clear-selection").on("click", () => select(null));
  tooltip.on("pointerenter", () => clearTimeout(hideTimer)).on("pointerleave", hideTooltip);
  document.addEventListener("keydown", event => { if (event.key === "Escape") hideTooltip(); });
  window.addEventListener("scroll", hideTooltip, true);
  window.addEventListener("resize", hideTooltip);
  d3.select("#finding").text(comparisonMessage(wheels)).property("hidden", false);
  const smallGroups = wheels.filter(wheel => wheel.count < 3)
    .map(wheel => `${wheel.size} members: ${wheel.count} ${wheel.count === 1 ? "band" : "bands"}`);
  d3.select("#sample-caution").text(`Equal-sized wheels do not mean equal evidence.${smallGroups.length ? ` Very small samples (${smallGroups.join("; ")}).` : ""} These are recorded looks, not proof of intentional coordination.`);
  d3.select("#load-status").property("hidden", true);
  renderEvidence(d3);
  document.body.dataset.appState = "ready";
}
