// The attributes that can be chosen in the dropdown. Overall is the clothing only.
const GARMENTS = ['shirt', 'jacket', 'bottom'];
const LOOKS = ['hair', 'eyes', 'skin'];
const ATTRIBUTES = ['overall', ...GARMENTS, ...LOOKS];

// Turns the 234 member rows into one object per band with a signature colour and a
// uniformity score for each attribute.
function prepareData(rows) {
  const members = rows.map(d => ({
    band: d.band.trim(),
    name: d.name.trim(),
    hair: clean(d.hair_color),
    eyes: cleanEyes(d.eyes),
    skin: clean(d.skin),
    shirt: cleanClothing(d.shirt_color),
    // An empty jacket_color means the member wears no jacket: none of the empty
    // rows has a jacket in top_style.
    jacket: cleanClothing(d.jacket_color),
    bottom: cleanClothing(d.bottom_color)
  }));

  // How often each colour is used in the whole dataset. Used to break ties.
  const datasetCounts = {};
  [...GARMENTS, ...LOOKS].forEach(attribute => {
    datasetCounts[attribute] = countValues(members.map(m => m[attribute]));
  });
  datasetCounts.overall = countValues(members.flatMap(m => [m.shirt, m.jacket, m.bottom]));

  const bands = Array.from(d3.group(members, m => m.band), ([name, bandMembers]) => {
    const band = { name, members: bandMembers, size: bandMembers.length };

    // Shirt, jacket, bottom, hair, eyes, skin: the share of ALL band members with the
    // signature colour. A member without a jacket (or with an unknown colour) counts as
    // not matching.
    [...GARMENTS, ...LOOKS].forEach(attribute => {
      band[attribute] = signature(bandMembers.map(m => m[attribute]), datasetCounts[attribute]);
      if (band[attribute] !== null) {
        band[attribute].total = bandMembers.length;
        band[attribute].uniformity = band[attribute].count / bandMembers.length;
      }
    });

    // Overall: how alike the band dresses = the average of the garment scores. Jackets
    // only count for bands where someone wears one. The signature colour is the most
    // common colour among all the band's shirts, jackets and bottoms together.
    const parts = GARMENTS.filter(garment => band[garment] !== null);
    band.overall = signature(bandMembers.flatMap(m => [m.shirt, m.jacket, m.bottom]), datasetCounts.overall);
    band.overall.parts = parts;
    band.overall.uniformity = d3.mean(parts, garment => band[garment].uniformity);

    return band;
  });

  return { members, bands };
}

// Finds the most common colour. Returns null when nobody has a recorded colour
// (e.g. a band without jackets).
function signature(values, datasetCount) {
  const counts = countValues(values);
  if (counts.size === 0) return null;

  const top = d3.max(counts.values());
  // Tie-break: the colour that is more common in the whole dataset wins.
  const tied = Array.from(counts.keys())
    .filter(colour => counts.get(colour) === top)
    .sort((a, b) => (datasetCount.get(b) ?? 0) - (datasetCount.get(a) ?? 0) || a.localeCompare(b));

  return { colour: tied[0], tiedWith: tied.slice(1), count: top, counts: counts };
}

// Map of colour -> count, ignoring missing values
function countValues(values) {
  return d3.rollup(values.filter(v => v !== null), v => v.length, v => v);
}

function clean(value) {
  const trimmed = (value ?? '').trim().toLowerCase();
  return trimmed === '' ? null : trimmed;
}

// "patterned" (8 shirts) is not a colour, so it is treated like an unknown colour
function cleanClothing(value) {
  const colour = clean(value);
  return colour === 'patterned' ? null : colour;
}

// Two members have "difficult to tell" style eye colours; they are unknown, not a colour
function cleanEyes(value) {
  const eyes = clean(value);
  return eyes === null || eyes.includes('tell') ? null : eyes;
}
