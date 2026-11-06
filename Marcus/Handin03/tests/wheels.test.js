import { createModel, normalizeMembers, parseDataset } from "../js/model.js";
import { TRACKS, createWheels, filledEnd, comparisonMessage } from "../js/wheels-model.js";

export function runTests(d3, csvText) {
  const results = [];
  const test = (name, action) => {
    try { action(); results.push({ name: `Wheels: ${name}`, passed: true }); }
    catch (error) { results.push({ name: `Wheels: ${name}`, passed: false, error: error.message }); }
  };
  const equal = (actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  };
  const close = (actual, expected) => {
    if (!Number.isFinite(actual) || Math.abs(actual - expected) > 1e-12) throw new Error(`Expected ${expected}, got ${actual}`);
  };
  const model = createModel(parseDataset(csvText, d3));
  const wheels = createWheels(model);
  test("five groups retain all 55 individual bands", () => {
    equal(wheels.map(wheel => [wheel.size, wheel.count]), [[3, 12], [4, 21], [5, 19], [6, 2], [7, 1]]);
    equal(new Set(wheels.flatMap(wheel => wheel.slots.map(slot => slot.band.id))).size, 55);
  });
  for (const [size, bottom, shirt] of [[3, 2 / 3, 5 / 12], [4, 101 / 126, 37 / 63], [5, 139 / 190, .5], [6, 1, 17 / 30], [7, 4 / 21, 4 / 21]]) {
    test(`${size}-member means match exact reference scores`, () => {
      const wheel = wheels.find(value => value.size === size);
      close(wheel.averages.bottom_color.score, bottom);
      close(wheel.averages.shirt_color.score, shirt);
    });
  }
  test("every wheel fills one turn with equal, adjacent band slots", () => {
    for (const wheel of wheels) {
      close(wheel.slots[0].startAngle, 0);
      close(wheel.slots.at(-1).endAngle, 2 * Math.PI);
      wheel.slots.forEach((slot, index) => {
        close(slot.endAngle - slot.startAngle, 2 * Math.PI / wheel.count);
        if (index) close(slot.startAngle, wheel.slots[index - 1].endAngle);
      });
    }
  });
  test("each filled fraction equals the band score for both garments", () => {
    for (const wheel of wheels) for (const slot of wheel.slots) for (const track of TRACKS) {
      const score = slot.band.summaries[track.garment].score;
      close((filledEnd(slot, score) - slot.startAngle) / (slot.endAngle - slot.startAngle), score);
    }
  });
  test("zero has no fill, one fills the slot, null stays unavailable", () => {
    const slot = { startAngle: .5, endAngle: 1.5 };
    equal([filledEnd(slot, 0), filledEnd(slot, 1), filledEnd(slot, null)], [.5, 1.5, null]);
  });
  test("invalid scores produce errors", () => {
    for (const score of [-1, 2, NaN, Infinity, undefined]) {
      let failed = false;
      try { filledEnd({ startAngle: 0, endAngle: 1 }, score); }
      catch (error) { failed = /Invalid/.test(error.message); }
      equal(failed, true);
    }
  });
  test("missing shirts flag coverage without changing group membership", () => {
    const wheel = wheels.find(value => value.size === 4);
    equal([wheel.count, wheel.averages.shirt_color.available, wheel.averages.shirt_color.incomplete], [21, 21, 1]);
  });
  test("unavailable scores are excluded, not averaged as zeros", () => {
    const rows = ["A", "B", "C"].flatMap((band, index) => [0, 1, 2].map(member => ({
      band, name: String(member), bottom_color: index === 0 ? "black" : "", shirt_color: ""
    })));
    rows.columns = ["band", "name", "bottom_color", "shirt_color"];
    const wheel = createWheels(createModel(normalizeMembers(rows)))[0];
    equal(wheel.averages.bottom_color, { score: 1, available: 1, incomplete: 2 });
    equal(wheel.averages.shirt_color, { score: null, available: 0, incomplete: 3 });
  });
  test("means give every band equal weight, not every known pair", () => {
    const rows = [
      { band: "A", name: "1", bottom_color: "black", shirt_color: "black" },
      { band: "A", name: "2", bottom_color: "white", shirt_color: "white" },
      { band: "A", name: "3", bottom_color: "red", shirt_color: "red" },
      { band: "B", name: "1", bottom_color: "black", shirt_color: "black" },
      { band: "B", name: "2", bottom_color: "black", shirt_color: "black" },
      { band: "B", name: "3", bottom_color: "", shirt_color: "" }
    ];
    rows.columns = ["band", "name", "bottom_color", "shirt_color"];
    close(createWheels(createModel(normalizeMembers(rows)))[0].averages.bottom_color.score, .5);
  });
  test("original radial geometry and model remain untouched", () => {
    const before = JSON.stringify(model);
    createWheels(model);
    equal(JSON.stringify(model), before);
  });
  test("reversed source order preserves wheel order and averages", () => {
    const reversed = createWheels(createModel([...model.members].reverse()));
    equal(reversed.map(wheel => [wheel.averages, wheel.slots.map(slot => [slot.band.id, slot.startAngle])]),
      wheels.map(wheel => [wheel.averages, wheel.slots.map(slot => [slot.band.id, slot.startAngle])]));
  });
  test("headline is grounded in the actual averages, not hard-coded regardless of data", () => {
    equal(comparisonMessage(wheels).startsWith("For both garments, 4-member"), true);
    equal(comparisonMessage([]).includes("A group average can hide"), true);
    const modified = wheels.map(wheel => ({
      ...wheel, averages: Object.fromEntries(TRACKS.map(track => [track.garment, { score: wheel.size / 10 }]))
    }));
    equal(comparisonMessage(modified).startsWith("For both garments, 4-member"), false);
  });
  return results;
}
