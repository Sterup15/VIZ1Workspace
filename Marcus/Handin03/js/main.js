import { createModel, parseDataset, initialState, nextState, scoreText } from "./model.js";
import { createDOM, render } from "./view.js";

export async function start() {
  const d3 = window.d3;
  if (!d3) throw new Error("The local D3 library could not be loaded");
  const response = await fetch(new URL("../boys.csv", import.meta.url), { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Dataset request failed (HTTP ${response.status})`);
  const model = createModel(parseDataset(await response.text(), d3));
  let state = initialState();
  let hideTimer;
  let dom;

  function hideTooltip() {
    clearTimeout(hideTimer);
    dom.tooltip.property("hidden", true);
    dom.marks.selectAll(".band-mark").attr("aria-describedby", null).classed("is-inspected", false);
  }

  function showTooltip(element, band) {
    clearTimeout(hideTimer);
    const summary = band.summaries[state.activeGarment];
    d3.select("#tooltip-title").text(band.name);
    d3.select("#tooltip-summary").text(`${band.totalMembers} members / matching pairs ${scoreText(summary)}`);
    d3.select("#tooltip-pairs").text(`${summary.matchingPairs} matching pairs out of ${summary.totalPairs}.`);
    d3.select("#tooltip-coverage").text(`${summary.known}/${band.totalMembers} colours known. Select for all member records.`);
    dom.tooltip.property("hidden", false);
    dom.marks.selectAll(".band-mark").attr("aria-describedby", null).classed("is-inspected", false);
    d3.select(element).attr("aria-describedby", "tooltip").classed("is-inspected", true);
    const point = element.querySelector(".band-point").getBoundingClientRect();
    const tooltip = dom.tooltip.node().getBoundingClientRect();
    const left = Math.max(10, Math.min(point.right + 14, window.innerWidth - tooltip.width - 10));
    const top = point.top >= tooltip.height + 14 ? point.top - tooltip.height - 10
      : Math.max(10, Math.min(point.bottom + 12, window.innerHeight - tooltip.height - 10));
    dom.tooltip.style("left", `${left}px`).style("top", `${top}px`);
  }

  function update(patch) {
    try {
      const previous = state;
      const next = nextState(model, state, patch);
      const focusedMark = document.activeElement?.closest(".band-mark");
      const restoreFocus = document.activeElement?.id === "clear-selection" && next.selectedBandId === null;
      if (focusedMark && model.byId.get(focusedMark.dataset.band).summaries[next.activeGarment].score === null) dom.band.node().focus();
      state = next;
      hideTooltip();
      render(dom, model, state, actions);
      if (restoreFocus) dom.band.node().focus();
      const selected = model.byId.get(state.selectedBandId);
      const focusMessage = previous.sizeFocus !== state.sizeFocus
        ? state.sizeFocus === "all" ? " All group colours restored." : ` ${state.sizeFocus}-member group emphasised.` : "";
      dom.announcement.text((selected
        ? `${selected.name} selected. Matching pairs ${scoreText(selected.summaries[state.activeGarment])}; member details updated.`
        : previous.selectedBandId ? "Band selection cleared. Choose a band to inspect its records." : "View updated.") + focusMessage);
    } catch (error) {
      console.error("Unable to update the visualization:", error);
      hideTooltip();
      dom.status.classed("visually-hidden", false).classed("error", true).text(`Unable to update the visualization: ${error.message}. Reload to try again.`);
      d3.select("#control-fields").property("disabled", true);
      d3.select("#clear-selection").property("disabled", true);
      dom.svg.selectAll("[tabindex]").attr("tabindex", -1).on("click", null).on("keydown", null);
      document.body.dataset.appState = "error";
    }
  }
  const actions = {
    update, showTooltip, hideTooltip,
    scheduleHideTooltip: () => { clearTimeout(hideTimer); hideTimer = setTimeout(hideTooltip, 180); },
    focusGroup: size => update({ sizeFocus: state.sizeFocus === size ? "all" : size })
  };
  dom = createDOM(d3, model, actions);
  dom.tooltip.on("pointerenter", () => clearTimeout(hideTimer)).on("pointerleave", hideTooltip);
  window.addEventListener("resize", hideTooltip);
  window.addEventListener("scroll", hideTooltip, true);
  document.addEventListener("keydown", event => { if (event.key === "Escape") hideTooltip(); });
  render(dom, model, state, actions);
  document.body.dataset.appState = "ready";
}
