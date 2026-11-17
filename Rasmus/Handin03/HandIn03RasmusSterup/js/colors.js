// These have no hue, so they belong on the greyscale wheel instead of the colour wheel.
// Silver only occurs as a hair colour.
const GREYS = ['white', 'light gray', 'silver', 'gray', 'dark gray', 'black'];

// The CSV only has colour names, so each name needs a hex value to be drawn.
// Its hue (and for greys its lightness) also decides where it sits on the wheel.
// "patterned" (8 shirts) is not a colour, so it is treated as unknown (see data.js).
const COLOUR_HEX = {
  'white': '#ffffff',
  'light gray': '#d3d3d3',
  'gray': '#9a9a9a',
  'dark gray': '#555555',
  'black': '#1a1a1a',
  'dark brown': '#4e3020',
  'brown': '#8b5a2b',
  'tan': '#d2b48c',
  'light yellow': '#fff2a8',
  'yellow': '#f5d21f',
  'orange': '#f28c28',
  'rust orange': '#b7410e',
  'salmon': '#fa8072',
  'pink': '#f4a6c0',
  'red': '#d62728',
  'dark red': '#8b0000',
  'purple': '#7b3fa0',
  'navy blue': '#1f2a5a',
  'dark blue': '#1f3f9a',
  'blue': '#2f6fd6',
  'light blue': '#8ec5f0',
  'green': '#3a9d4b',
  'dark green': '#1e5631',

  // Hair, eye and skin colours, only used for the member figures
  'blonde': '#e8c66a',
  'strawberry blonde': '#e3a46f',
  'silver': '#c0c0c0',
  'hazel': '#8e7618',
  'light': '#f1d3b5',
  'medium-light': '#e0b48f',
  'medium': '#c68e63',
  'medium-dark': '#8d5a3b',
  'dark': '#5a3825'
};

// The colour wheel cycles red -> orange -> yellow -> green -> blue -> purple -> red, with the
// six colours evenly spaced. Each pair is [angle on the wheel, HSL hue].
const WHEEL_STOPS = [[0, 0], [60, 30], [120, 60], [180, 120], [240, 240], [300, 280], [360, 360]];
const hueToWheel = d3.scaleLinear().domain(WHEEL_STOPS.map(s => s[1])).range(WHEEL_STOPS.map(s => s[0]));
const wheelToHue = d3.scaleLinear().domain(WHEEL_STOPS.map(s => s[0])).range(WHEEL_STOPS.map(s => s[1]));

// The names shown next to the slider, at their position (0-1) on each wheel
const WHEEL_NAMES = {
  colour: [['red', 0], ['orange', 1 / 6], ['yellow', 2 / 6], ['green', 3 / 6], ['blue', 4 / 6], ['purple', 5 / 6], ['red', 1]],
  grey: GREYS.map(colour => [colour, wheelPosition(colour, 'grey')])
};

// The greyscale wheel goes from white (just after the top) to black (just before the top).
// The 10 degrees on each side of the top keep white and black apart.
function greyAngle(darkness) {
  return 10 + darkness * 3.4;
}

// Where a named colour sits on a wheel, as a fraction (0-1) of the way round,
// or null when the colour isn't on that wheel.
function wheelPosition(colour, mode) {
  const isGrey = GREYS.includes(colour);
  if (mode === 'grey') {
    return isGrey ? greyAngle(100 - d3.lab(COLOUR_HEX[colour]).l) / 360 : null;
  }
  return isGrey ? null : hueToWheel(d3.hsl(COLOUR_HEX[colour]).h) / 360;
}

// The colour of the wheel itself at a fraction (0-1) of the way round
function wheelColour(t, mode) {
  if (mode === 'grey') {
    const darkness = Math.max(0, Math.min(100, (t * 360 - 10) / 3.4));
    return d3.lab(100 - darkness, 0, 0).formatHex();
  }
  return d3.hsl(wheelToHue(t * 360), 0.85, 0.5).formatHex();
}
