export const GARMENTS = Object.freeze({
  bottom_color: { label: "Bottoms" },
  shirt_color: { label: "Shirts" }
});

export const COLOURS = Object.freeze({
  black: "#202124",
  "navy blue": "#233e67",
  blue: "#276bb0",
  "light blue": "#9fc5e8",
  "dark gray": "#53565a",
  gray: "#92969a",
  "light gray": "#d0d3d5",
  white: "#ffffff",
  brown: "#795336",
  tan: "#cbb58a",
  "dark green": "#27563b",
  green: "#4c8553",
  "dark red": "#822b39",
  red: "#c84245",
  "rust orange": "#b45b35",
  orange: "#e08031",
  salmon: "#e99887",
  pink: "#e8b0c6",
  purple: "#865a9d",
  yellow: "#e7c749",
  "light yellow": "#f4e6a6",
  patterned: "patterned"
});

export const COLOUR_ORDER = Object.freeze([
  "red", "salmon", "rust orange", "orange", "brown", "tan",
  "light yellow", "yellow", "green", "dark green",
  "blue", "light blue", "navy blue", "purple", "pink", "dark red",
  "white", "light gray", "gray", "dark gray", "black", "patterned"
]);

const BOTTOM_COLOURS = new Set([
  "black", "gray", "green", "light blue", "light gray",
  "navy blue", "red", "tan", "white", "yellow"
]);
const REQUIRED_HEADERS = ["band", "name", "bottom_color", "shirt_color"];
export const LAYOUT = Object.freeze({
  width: 1200, centre: 600,
  start: 0, end: 2 * Math.PI,
  arcInner: 165, arcOuter: 185, inner: 210, outer: 390
});
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;

function validateQuotes(text) {
  // D3's CSV parser is permissive; reject damaged quoting rather than changing a colour silently.
  let state = "start";
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (state === "quoted") {
      if (char === '"') {
        if (text[index + 1] === '"') index++;
        else state = "closed";
      }
    } else if (char === "," || char === "\r" || char === "\n") {
      state = "start";
    } else if (state === "closed") {
      throw new Error("Malformed CSV: unexpected text after a closing quote.");
    } else if (char === '"') {
      if (state !== "start") throw new Error("Malformed CSV: a quote appears inside an unquoted field.");
      state = "quoted";
    } else {
      state = "unquoted";
    }
  }
  if (state === "quoted") throw new Error("Malformed CSV: an unterminated quoted field.");
}

export function parseDataset(text, d3) {
  const clean = text.replace(/^\uFEFF/, "");
  validateQuotes(clean);
  const records = d3.csvParseRows(clean);
  if (records.length < 2) throw new Error("The dataset is empty or has no member records.");
  const headers = records[0].map(value => value.trim());
  if (new Set(headers).size !== headers.length) throw new Error("The CSV contains duplicate headers.");
  const rows = records.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      throw new Error(`CSV record ${index + 2} has ${values.length} fields; expected ${headers.length}.`);
    }
    return Object.fromEntries(headers.map((header, column) => [header, values[column]]));
  });
  rows.columns = headers;
  return normalizeMembers(rows);
}

export function normalizeMembers(rows) {
  if (!rows.length) throw new Error("The dataset is empty.");
  for (const header of REQUIRED_HEADERS) {
    if (!rows.columns?.includes(header)) throw new Error(`Missing required CSV header: ${header}.`);
  }
  const seen = new Set();
  return rows.map((row, index) => {
    const band = row.band?.trim();
    const name = row.name?.trim();
    const sourceRow = index + 2;
    if (!band || !name) throw new Error(`Missing band or name in CSV record ${sourceRow}.`);
    const id = JSON.stringify([band, name]);
    if (seen.has(id)) throw new Error(`Duplicate member record: ${band} / ${name}.`);
    seen.add(id);
    const member = { id, band, name, sourceRow };
    for (const garment of Object.keys(GARMENTS)) {
      const value = row[garment]?.trim() || null;
      if (value !== null && (!Object.hasOwn(COLOURS, value) ||
        (garment === "bottom_color" && !BOTTOM_COLOURS.has(value)))) {
        throw new Error(`Unsupported ${garment} "${value}" in CSV record ${sourceRow}. Update the colour contract first.`);
      }
      member[garment] = value;
    }
    return member;
  });
}

export function summarizeBand(members, garment) {
  if (!Object.hasOwn(GARMENTS, garment)) throw new Error(`Unknown garment: ${garment}.`);
  const counts = new Map();
  for (const member of members) {
    const value = member[garment];
    if (value !== null) counts.set(value, (counts.get(value) || 0) + 1);
  }
  const known = [...counts.values()].reduce((sum, count) => sum + count, 0);
  const totalPairs = known * (known - 1) / 2;
  const matchingPairs = [...counts.values()].reduce((sum, count) => sum + count * (count - 1) / 2, 0);
  const largestCount = Math.max(0, ...counts.values());
  const modes = [...counts].filter(([, count]) => count === largestCount).map(([colour]) => colour).sort(compare);
  return {
    counts, known, missing: members.length - known,
    matchingPairs, totalPairs, score: totalPairs ? matchingPairs / totalPairs : null, modes,
    dominantColour: modes.length > 1 ? "mixed" : modes[0] ?? null
  };
}

export function createModel(members) {
  if (!members.length) throw new Error("Cannot build a model without member records.");
  const byBand = new Map();
  for (const member of members) {
    if (!byBand.has(member.band)) byBand.set(member.band, []);
    byBand.get(member.band).push(member);
  }
  const bands = [...byBand].map(([name, records]) => ({
    id: name, name,
    members: [...records].sort((a, b) => compare(a.name, b.name)),
    totalMembers: records.length,
    summaries: Object.fromEntries(Object.keys(GARMENTS).map(garment => [garment, summarizeBand(records, garment)]))
  })).sort((a, b) => a.totalMembers - b.totalMembers || compare(a.name, b.name));
  const categories = Object.fromEntries(Object.keys(GARMENTS).map(garment => [
    garment, [...COLOUR_ORDER, "mixed"].filter(colour => bands.some(band => band.summaries[garment].dominantColour === colour))
  ]));
  const colourLayouts = Object.fromEntries(Object.keys(GARMENTS).map(garment => [
    garment, allocateColourAngles(bands, garment, categories[garment])
  ]));
  return { members, bands, byId: new Map(bands.map(band => [band.id, band])), categories, colourLayouts };
}

function allocateColourAngles(bands, garment, categories) {
  const groups = categories.map(colour => ({
    colour,
    bands: bands.filter(band => band.summaries[garment].dominantColour === colour)
      .sort((a, b) => compare(a.name, b.name))
  }));
  const total = groups.reduce((sum, group) => sum + group.bands.length, 0);
  let start = LAYOUT.start;
  const marks = [];
  for (const group of groups) {
    group.count = group.bands.length;
    group.startAngle = start;
    group.endAngle = start + (LAYOUT.end - LAYOUT.start) * group.count / total;
    group.bands.forEach((band, index) => marks.push({
      ...band, colour: group.colour, key: band.id,
      angle: start + (index + 0.5) * (group.endAngle - start) / group.count
    }));
    start = group.endAngle;
  }
  return { groups, marks };
}

export function scoreRadius(score) {
  if (score === null) return null;
  if (!Number.isFinite(score) || score < 0 || score > 1) throw new Error(`Invalid uniformity score: ${score}.`);
  return LAYOUT.inner + (LAYOUT.outer - LAYOUT.inner) * score;
}

export function initialState() {
  return { activeGarment: "bottom_color", colourFocus: "all", colourPosition: null, selectedBandId: null };
}

export function colourAtPosition(model, garment, position) {
  if (!Number.isFinite(position) || position < 0 || position > 1) throw new Error("Invalid colour-slider position.");
  if (!Object.hasOwn(GARMENTS, garment)) throw new Error("Invalid garment selection.");
  const groups = model.colourLayouts[garment].groups;
  if (!groups.length) throw new Error("No recorded colours are available for the colour slider.");
  return groups.find(group => position * 2 * Math.PI < group.endAngle) || groups.at(-1);
}

export function filteredBands(model, state) {
  return model.bands.filter(band => state.colourFocus === "all" ||
    band.summaries[state.activeGarment].dominantColour === state.colourFocus);
}

export function colourMarks(model, state) {
  return model.colourLayouts[state.activeGarment].marks.filter(mark =>
    (state.colourFocus === "all" || mark.colour === state.colourFocus) &&
    mark.summaries[state.activeGarment].score !== null);
}

export function nextState(model, state, patch) {
  const next = { ...state, ...patch };
  if (!Object.hasOwn(GARMENTS, next.activeGarment)) throw new Error("Invalid garment selection.");
  if (Object.hasOwn(patch, "colourPosition")) {
    next.colourFocus = colourAtPosition(model, next.activeGarment, patch.colourPosition).colour;
  }
  if (next.colourFocus !== "all" && !model.categories[next.activeGarment].includes(next.colourFocus)) {
    if (patch.activeGarment && !Object.hasOwn(patch, "colourFocus")) next.colourFocus = "all";
    else throw new Error("Invalid clothing-colour filter.");
  }
  if (next.selectedBandId !== null && !model.byId.has(next.selectedBandId)) throw new Error("Unknown selected band.");
  if (next.selectedBandId !== null && next.colourFocus !== "all" &&
      model.byId.get(next.selectedBandId).summaries[next.activeGarment].dominantColour !== next.colourFocus) {
    if (patch.selectedBandId) throw new Error("Selected band does not belong to the filtered colour group.");
    else next.selectedBandId = null;
  }
  if (next.colourFocus === "all") next.colourPosition = null;
  else if (patch.activeGarment || Object.hasOwn(patch, "colourFocus") || next.colourPosition === null) {
    const group = model.colourLayouts[next.activeGarment].groups.find(group => group.colour === next.colourFocus);
    next.colourPosition = (group.startAngle + group.endAngle) / (4 * Math.PI);
  }
  return next;
}

export function modeText(summary) {
  if (!summary.modes.length) return "No known colour";
  return summary.modes.length > 1 ? `Tied: ${summary.modes.join(", ")}` : summary.modes[0];
}

export function scoreText(summary) {
  return summary.score === null ? "Unavailable" : `${Number((summary.score * 100).toFixed(1))}%`;
}
