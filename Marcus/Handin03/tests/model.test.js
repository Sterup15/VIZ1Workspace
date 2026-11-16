import {
  LAYOUT, parseDataset, normalizeMembers, summarizeBand, createModel,
  scoreRadius, scoreText, initialState, nextState, emphasizedBands, GROUP_COLOURS
} from "../js/model.js";

export function runTests(d3, csvText) {
  const results = [];
  const test = (name, action) => {
    try { action(); results.push({ name, passed: true }); }
    catch (error) { results.push({ name, passed: false, error: error.message }); }
  };
  const equal = (actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
    }
  };
  const close = (actual, expected) => {
    if (!Number.isFinite(actual) || Math.abs(actual - expected) > 1e-12) {
      throw new Error(`Expected ${expected}, received ${actual}`);
    }
  };
  const fails = (action, pattern) => {
    let caught;
    try { action(); } catch (error) { caught = error; }
    if (!caught || !pattern.test(caught.message)) throw new Error(`Expected an error matching ${pattern}.`);
  };
  const fixture = values => {
    const rows = values.map((value, i) => ({ band: "Test", name: `Member ${i}`, bottom_color: value, shirt_color: value }));
    rows.columns = ["band", "name", "bottom_color", "shirt_color"];
    return normalizeMembers(rows);
  };
  const members = parseDataset(csvText, d3);
  const model = createModel(members);
  const summary = (name, garment = "bottom_color") => model.byId.get(name).summaries[garment];
  test("234 records and 55 bands", () => equal([members.length, model.bands.length], [234, 55]));
  test("Five groups with the original band counts", () => equal(
    model.groups.map(group => [group.size, group.count]), [[3, 12], [4, 21], [5, 19], [6, 2], [7, 1]]
  ));
  test("Composite keys are unique", () => equal(new Set(members.map(member => member.id)).size, 234));
  for (const [garment, known, uniform, ties, categoryCount] of [
    ["bottom_color", 234, 35, 6, 10], ["shirt_color", 233, 21, 13, 22]
  ]) {
    test(`${garment}: coverage, full matches, ties and categories`, () => equal([
      model.bands.reduce((sum, band) => sum + band.summaries[garment].known, 0),
      model.bands.filter(band => band.summaries[garment].score === 1).length,
      model.bands.filter(band => band.summaries[garment].modes.length > 1).length,
      model.categories[garment].length
    ], [known, uniform, ties, categoryCount]));
    test(`${garment}: every summary reconciles`, () => {
      for (const band of model.bands) {
        const s = band.summaries[garment];
        equal(s.known + s.missing, band.totalMembers);
        equal([...s.counts.values()].reduce((a, b) => a + b, 0), s.known);
        if (s.score !== null) close(s.score, s.matchingPairs / s.totalPairs);
        scoreRadius(s.score);
      }
    });
  }
  for (const [name, garment, matching, total, score, modes] of [
    ["The Click Five", "bottom_color", 10, 10, 1, ["black"]],
    ["Ideal", "bottom_color", 3, 6, 0.5, ["white"]],
    ["Shai", "bottom_color", 2, 6, 1 / 3, ["black", "navy blue"]],
    ["Hanson", "bottom_color", 1, 3, 1 / 3, ["navy blue"]],
    ["Ideal", "shirt_color", 6, 6, 1, ["white"]],
    ["Shai", "shirt_color", 0, 6, 0, ["blue", "green", "patterned", "purple"]],
    ["Son by Four", "shirt_color", 3, 3, 1, ["white"]]
  ]) {
    test(`${name} / ${garment}: exact pair score and modes`, () => {
      const s = summary(name, garment);
      equal([s.matchingPairs, s.totalPairs, s.modes], [matching, total, modes]);
      close(s.score, score);
    });
  }
  test("Missing shirt does not change Son by Four's size group", () => equal(
    [model.byId.get("Son by Four").totalMembers, summary("Son by Four", "shirt_color").known,
      summary("Son by Four", "shirt_color").missing], [4, 3, 1]
  ));
  for (const [values, expected, modes] of [
    [["black", "black"], 1, ["black"]],
    [["black", "white"], 0, ["black", "white"]],
    [["black", "black", "black", "white"], 0.5, ["black"]],
    [["black", "black", "white", "white"], 1 / 3, ["black", "white"]],
    [["black", "white", "red", "green"], 0, ["black", "green", "red", "white"]],
    [[null, null], null, []],
    [["black", null], null, ["black"]],
    [["black", "black", null], 1, ["black"]]
  ]) {
    test(`Fixture ${JSON.stringify(values)}`, () => {
      const s = summarizeBand(fixture(values), "bottom_color");
      if (expected === null) equal(s.score, null); else close(s.score, expected);
      equal(s.modes, modes);
    });
  }
  test("Patterned is an exact category match, not a mode tie", () => {
    const records = fixture(["black", "black"]).map(member => ({ ...member, shirt_color: "patterned" }));
    const s = summarizeBand(records, "shirt_color");
    equal([s.score, s.modes], [1, ["patterned"]]);
  });
  test("Whitespace, quoted commas and escaped quotes survive CSV parsing", () => {
    const parsed = parseDataset('band,name,bottom_color,shirt_color\n" A, B ","A ""quoted"" name"," black ",white', d3);
    equal([parsed[0].band, parsed[0].name, parsed[0].bottom_color, parsed[0].sourceRow],
      ["A, B", 'A "quoted" name', "black", 2]);
  });
  const valid = "band,name,bottom_color,shirt_color\nA,N,black,white";
  for (const [name, input, error] of [
    ["empty input", "", /empty/],
    ["missing header", "band,name,shirt_color\nA,N,white", /bottom_color/],
    ["duplicate header", "band,name,name,shirt_color\nA,N,N,white", /duplicate headers/],
    ["empty identity", "band,name,bottom_color,shirt_color\nA,,black,white", /Missing band or name/],
    ["duplicate key", `${valid}\nA,N,black,white`, /Duplicate member/],
    ["extra field", `${valid},oops`, /fields/],
    ["missing field", "band,name,bottom_color,shirt_color\nA,N,black", /fields/],
    ["unsupported colour", valid.replace("black", "ultraviolet"), /Unsupported/],
    ["unterminated quote", 'band,name,bottom_color,shirt_color\nA,N,black,"white', /unterminated/],
    ["text after quote", 'band,name,bottom_color,shirt_color\nA,N,black,"white"x', /closing quote/],
    ["unquoted embedded quote", 'band,name,bottom_color,shirt_color\nA,N,black,wh"ite', /unquoted/]
  ]) test(`Reject ${name}`, () => fails(() => parseDataset(input, d3), error));

  test("Null scores are not placed at zero", () => equal(scoreRadius(null), null));
  test("Fixed linear radius at zero, halfway and one", () => equal(
    [scoreRadius(0), scoreRadius(0.5), scoreRadius(1)], [210, 300, 390]
  ));
  test("Invalid scores are explicit errors", () => {
    for (const value of [NaN, Infinity, -0.1, 1.1, undefined]) fails(() => scoreRadius(value), /Invalid/);
  });
  test("Angular widths sum to a full 360 degrees", () => close(
    model.groups.reduce((sum, group) => sum + group.endAngle - group.startAngle, 0), 2 * Math.PI
  ));
  test("Full-circle extent starts at the top with no angular gaps", () => {
    equal(LAYOUT.start, 0);
    equal(LAYOUT.gap, 0);
    close(LAYOUT.end, 2 * Math.PI);
    close(model.groups[0].startAngle, LAYOUT.start);
    close(model.groups.at(-1).endAngle, LAYOUT.end);
    model.groups.slice(1).forEach((group, i) => close(group.startAngle - model.groups[i].endAngle, LAYOUT.gap));
  });
  test("Arc width per band is identical", () => {
    for (const group of model.groups) close(
      (group.endAngle - group.startAngle) / group.count, 2 * Math.PI / 55
    );
  });
  test("Every band has a unique angle inside its size group", () => {
    equal(new Set(model.bands.map(band => band.angle)).size, 55);
    for (const band of model.bands) {
      const group = model.groups.find(value => value.size === band.totalMembers);
      if (!(band.angle > group.startAngle && band.angle < group.endAngle)) throw new Error(band.name);
    }
  });
  test("D3 polar convention and finite coordinates", () => {
    close(d3.pointRadial(0, 100)[1], -100);
    close(d3.pointRadial(Math.PI / 2, 100)[0], 100);
    for (const band of model.bands) {
      if (!d3.pointRadial(band.angle, scoreRadius(band.summaries.bottom_color.score)).every(Number.isFinite)) {
        throw new Error(`Invalid coordinates: ${band.name}`);
      }
    }
  });
  test("Reordering input preserves scores and slots", () => {
    const reordered = createModel([...members].reverse());
    equal(reordered.bands.map(band => [band.id, band.angle, band.summaries.bottom_color.score]),
      model.bands.map(band => [band.id, band.angle, band.summaries.bottom_color.score]));
  });
  test("Switch garment keeps the selected band", () => equal(
    nextState(model, { ...initialState(), selectedBandId: "Shai" }, { activeGarment: "shirt_color" }).selectedBandId, "Shai"
  ));
  test("Group focus counts the emphasis and clears incompatible selection", () => {
    const state = nextState(model, { ...initialState(), selectedBandId: "Shai" }, { sizeFocus: 3 });
    equal([state.selectedBandId, emphasizedBands(model, state).length, model.groups.length, model.bands.length], [null, 12, 5, 55]);
    equal(emphasizedBands(model, { ...initialState(), sizeFocus: 4 }).length, 21);
  });
  test("Selecting a muted band moves focus to its group", () => equal(
    nextState(model, { ...initialState(), sizeFocus: 3 }, { selectedBandId: "Shai" }),
    { ...initialState(), sizeFocus: 4, selectedBandId: "Shai" }
  ));
  test("All restores emphasis without changing garment or selection", () => equal(
    nextState(model, { activeGarment: "shirt_color", sizeFocus: 4, selectedBandId: "Shai" }, { sizeFocus: "all" }),
    { activeGarment: "shirt_color", sizeFocus: "all", selectedBandId: "Shai" }
  ));
  test("Clearing selection preserves garment and group focus", () => equal(
    nextState(model, { activeGarment: "shirt_color", sizeFocus: 4, selectedBandId: "Shai" }, { selectedBandId: null }),
    { activeGarment: "shirt_color", sizeFocus: 4, selectedBandId: null }
  ));
  test("Five distinct colours cover every supplied size group", () => {
    equal(new Set(model.groups.map(group => GROUP_COLOURS[group.size])).size, 5);
    for (const group of model.groups) {
      if (!/^#[0-9a-f]{6}$/.test(GROUP_COLOURS[group.size])) throw new Error(`Missing colour for ${group.size}`);
    }
  });
  test("Percent formatting preserves meaning and unavailable values", () => equal(
    [0, 1 / 3, 0.5, 1, null].map(score => scoreText({ score })), ["0%", "33.3%", "50%", "100%", "Unavailable"]
  ));
  test("Unscored bands remain selectable", () => {
    const sparse = createModel(fixture([null, null]));
    equal(nextState(sparse, initialState(), { selectedBandId: "Test" }).selectedBandId, "Test");
    equal(sparse.byId.get("Test").summaries.bottom_color.score, null);
  });
  test("Invalid control states are rejected", () => {
    fails(() => nextState(model, initialState(), { activeGarment: "jacket_color" }), /garment/);
    fails(() => nextState(model, initialState(), { sizeFocus: 99 }), /focus/);
    fails(() => nextState(model, initialState(), { selectedBandId: "Not a band" }), /Unknown/);
  });
  return results;
}
