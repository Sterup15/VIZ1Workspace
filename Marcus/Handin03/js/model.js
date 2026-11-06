export const GARMENTS = Object.freeze({
  bottom_color: { label: "Bottoms", singular: "bottom colour" },
  shirt_color: { label: "Shirts", singular: "shirt colour" }
});

export const GROUP_COLOURS = Object.freeze({
  3: "#0072b2", 4: "#c44b00", 5: "#00856a", 6: "#97449a", 7: "#946600"
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

const BOTTOM_COLOURS = new Set([
  "black", "gray", "green", "light blue", "light gray",
  "navy blue", "red", "tan", "white", "yellow"
]);
const REQUIRED_HEADERS = ["band", "name", "bottom_color", "shirt_color"];
export const LAYOUT = Object.freeze({
  width: 1000, centre: 500,
  start: 0, end: 2 * Math.PI,
  gap: 0,
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
    const member = { id, band, name, sourceRow, original: { ...row } };
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
    matchingPairs, totalPairs, score: totalPairs ? matchingPairs / totalPairs : null, modes
  };
}

export function allocateBandAngles(bands) {
  if (!bands.length) throw new Error("Cannot allocate angles without bands.");
  const sizes = [...new Set(bands.map(band => band.totalMembers))].sort((a, b) => a - b);
  const available = LAYOUT.end - LAYOUT.start - LAYOUT.gap * (sizes.length - 1);
  if (available <= 0) throw new Error("Too many size groups for the radial layout.");
  let start = LAYOUT.start;
  const placed = [];
  const groups = sizes.map(size => {
    const groupBands = bands.filter(band => band.totalMembers === size).sort((a, b) => compare(a.name, b.name));
    const end = start + available * groupBands.length / bands.length;
    const group = { size, count: groupBands.length, startAngle: start, endAngle: end };
    groupBands.forEach((band, index) => placed.push({
      ...band, angle: start + (index + 0.5) * (end - start) / groupBands.length
    }));
    start = end + LAYOUT.gap;
    return group;
  });
  return { groups, bands: placed };
}

export function createModel(members) {
  if (!members.length) throw new Error("Cannot build a model without member records.");
  const byBand = new Map();
  for (const member of members) {
    if (!byBand.has(member.band)) byBand.set(member.band, []);
    byBand.get(member.band).push(member);
  }
  const rawBands = [...byBand].map(([name, records]) => ({
    id: name, name,
    members: [...records].sort((a, b) => compare(a.name, b.name)),
    totalMembers: records.length,
    summaries: Object.fromEntries(Object.keys(GARMENTS).map(garment => [garment, summarizeBand(records, garment)]))
  }));
  const { groups, bands } = allocateBandAngles(rawBands);
  const categories = Object.fromEntries(Object.keys(GARMENTS).map(garment => [
    garment, Object.keys(COLOURS).filter(colour => members.some(member => member[garment] === colour))
  ]));
  return { members, groups, bands, byId: new Map(bands.map(band => [band.id, band])), categories };
}

export function scoreRadius(score) {
  if (score === null) return null;
  if (!Number.isFinite(score) || score < 0 || score > 1) throw new Error(`Invalid uniformity score: ${score}.`);
  return LAYOUT.inner + (LAYOUT.outer - LAYOUT.inner) * score;
}

export function initialState() {
  return { activeGarment: "bottom_color", sizeFocus: "all", selectedBandId: null };
}

export function emphasizedBands(model, state) {
  return model.bands.filter(band => state.sizeFocus === "all" || band.totalMembers === state.sizeFocus);
}

export function nextState(model, state, patch) {
  const next = { ...state, ...patch };
  if (!Object.hasOwn(GARMENTS, next.activeGarment)) throw new Error("Invalid garment selection.");
  if (next.sizeFocus !== "all" && !model.groups.some(group => group.size === next.sizeFocus)) {
    throw new Error("Invalid band-size focus.");
  }
  if (next.selectedBandId !== null && !model.byId.has(next.selectedBandId)) throw new Error("Unknown selected band.");
  if (next.selectedBandId !== null && next.sizeFocus !== "all" &&
      model.byId.get(next.selectedBandId).totalMembers !== next.sizeFocus) {
    if (patch.selectedBandId) next.sizeFocus = model.byId.get(next.selectedBandId).totalMembers;
    else next.selectedBandId = null;
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
