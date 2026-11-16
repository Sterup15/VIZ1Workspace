import { GARMENTS } from "./model.js";

export const TRACKS = Object.freeze([
  { garment: "bottom_color", label: GARMENTS.bottom_color.label, colour: "#0072b2", inner: 122, outer: 140 },
  { garment: "shirt_color", label: GARMENTS.shirt_color.label, colour: "#c44b00", inner: 96, outer: 114 }
]);

export function filledEnd(slot, score) {
  if (score === null) return null;
  if (!Number.isFinite(score) || score < 0 || score > 1) throw new Error(`Invalid matching-pair score: ${score}.`);
  return slot.startAngle + (slot.endAngle - slot.startAngle) * score;
}

export function createWheels(model) {
  return model.groups.map(group => {
    const bands = model.bands.filter(band => band.totalMembers === group.size);
    const slots = bands.map((band, index) => ({
      band, startAngle: index * 2 * Math.PI / bands.length, endAngle: (index + 1) * 2 * Math.PI / bands.length
    }));
    const averages = Object.fromEntries(TRACKS.map(({ garment }) => {
      const available = bands.filter(band => band.summaries[garment].score !== null);
      return [garment, {
        score: available.length
          ? available.reduce((sum, band) => sum + band.summaries[garment].score, 0) / available.length : null,
        available: available.length,
        incomplete: bands.filter(band => band.summaries[garment].missing > 0).length
      }];
    }));
    return { size: group.size, count: bands.length, slots, averages };
  });
}

export function comparisonMessage(wheels) {
  const common = wheels.filter(wheel => [3, 4, 5].includes(wheel.size));
  if (common.length === 3 && common.every(wheel => TRACKS.every(track => wheel.averages[track.garment].score !== null))) {
    const middle = common.find(wheel => wheel.size === 4);
    if (TRACKS.every(track => common.filter(wheel => wheel !== middle)
      .every(wheel => middle.averages[track.garment].score > wheel.averages[track.garment].score))) {
      return "For both garments, 4-member bands average higher than 3- and 5-member bands. Bigger is not consistently more matching here.";
    }
  }
  return "Compare each group's averages, then inspect individual bands. A group average can hide very different recorded looks.";
}
