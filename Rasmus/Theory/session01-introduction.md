# VIZ1 – Session 1: Introduction

Source: Tamara Munzner, *"Visualization – Analysis & Design"*.

---

## Course structure (context)

The course has two main topics:
1. **Designing** visualizations based on data and use case
2. **Implementing** the visualization

Teaching elements: theory, exercises, hand-ins (3 mandatory D3.js/React hand-ins; oral exam based on one of them).

### On Generative AI use
Recommended use is for **reviewing your own work only** — not for generating designs or code. Actually learning visualization requires:
- Coming up with your own ideas
- Evaluating your own designs
- Fiddling with the code yourself to get the output right

---

## The Munzner Framework: What, Why, How

A first-pass mental model for designing any visualization (explored in depth in [Session 2](session02-visual-encodings.md)):

| Question | Concerns |
|---|---|
| **What** | The data: its types and semantics |
| **Why** | The purpose: intended actions and intended targets |
| **How** | The visualization: marks and channels used to encode the data |

---

## Marks and Channels

- **Marks** – the base geometric shapes used to represent items:
  - 0D: points
  - 1D: lines
  - 2D: areas
  - 3D: volumes (rarely used)
- **Channels** – how marks are visually presented: **position, size, colour, shape**

**Worked example** (blood pressure of hospital patients by day): starting from raw measurements, the demo built up a scatter-style chart step by step — first plotting patients as points, then encoding the *number of patients* as circle size, then filtering to only overnight patients, and finally combining **4 channels at once** (position × 2, size, colour) to show day, systolic/diastolic pressure, and patient count together.

---

## SVG (Scalable Vector Graphics)

### What it is
- Vector-based (points, directions, paths) rather than pixel-based.
- Resolution-independent / scalable.
- Can represent shapes and text.

### When to use it
- ✅ Icons, illustrations, diagrams — anything simple and scalable.
- ❌ Photographs — loses information and produces bigger files than raster formats.

### The `<svg>` element
```html
<svg width="800" height="600" viewBox="0 0 800 600">
```
- `width` / `height` – absolute size on the page. Not recommended in general (unresponsive).
- `viewBox` – the internal coordinate system of the SVG area; all coordinates/sizes are relative to it. **Recommended for responsiveness.**

### Grouping
```html
<g transform="translate(0, 500)">…</g>
```
- `<g>` groups elements together — conceptually "the `<div>` of SVG".
- Child elements inherit the properties of the `<g>`.
- A group can be transformed as a unit: **translate, rotate, scale, skew**.

### Paths & Bezier curves
```html
<path d="M 200 100 C 350 100, 350 200, 500 200" fill="none" stroke="black" stroke-width="2"/>
```
- A path continues from where the previous segment ended.
- `z` closes the path.
- Lower-case commands (e.g. `c` instead of `C`) use coordinates **relative** to the current point — often easier to reason about.
- Cubic Bezier curves are defined by two control points that pull the curve toward them.

---

## D3.js

A library for **creating, updating, and animating** data-driven visualizations. Provides primitives for:
- Simple SVG elements
- Complex groups of SVG elements (axes, diagrams, curves, trees)
- Data loading
- Mapping data to SVG
- Interaction

Uses a **fluent interface** (method chaining / pipelining):
```js
const svg = d3.select("svg");
svg.append("text")
  .attr("x", 590)
  .attr("y", 525)
  .attr("font-size", 16)
  .text("Systolic Pressure");
```

### The data pipeline: Load → Format → Measure → Scale → Bind

**1. Loading — data formats (`d3-fetch`)**

| Format | Description | Example | Function |
|---|---|---|---|
| CSV | Comma-separated values | `88, 144, 819` | `d3.csv()` |
| TSV | Tab-separated values | `88  144  819` | `d3.tsv()` |
| DSV | Delimiter-separated values | `88; 144; 819` | `d3.dsv()` |
| JSON | JavaScript Object Notation | `{ "d": 88, "s": 144, "c": 819 }` | `d3.json()` |
| Text | Plain text | — | `d3.text()` |
| XML | Extensible Markup Language | `<data><d>88</d>…</data>` | `d3.xml()` |

```js
const data = await d3.json("./data/bp.json");
```

**2. Formatting (`d3-format`)** — normal data formatting, date formatting, rounding, string formatting/parsing.
```js
function format(data) { /* … */ }

d3.json(`data/${fileNameJSON}`).then(rawData => {
  const formattedData = rawData.map(format);
  return formattedData;
});
```

**3. Measuring** — get an overview of the data; needed to understand boundaries and drive scaling. Count elements, find min/max, group and measure within groups.
```js
const groups = d3.groups(d => d.day);
for ([day, data] of groups) {
  console.log(day);
  console.log(d3.count(data));
  console.log(d3.min(data, d => d.diastolic));
}
```

**4. Scaling** — a mapping from data values to displayed values (positions, colours, text, …). Used for consistent display and is mandatory for things like chart axes. (Expanded further in [Session 2](session02-visual-encodings.md).)
```js
const systolicScale = d3.scaleLinear().domain([90, 160]).range([100, 660]);
const diastolicScale = d3.scaleLinear().domain([60, 110]).range([500, 100]);
const colorScale = d3.scaleLinear()
  .domain([0, 3])
  .range(["white", "lightgray", "darkgray", "gray"]);
```

Building an axis from a scale:
```js
svg.append("g")
  .attr("id", "horizontal-axis")
  .attr("transform", "translate(0, 500)")
  .call(d3.axisBottom(systolicScale)
    .tickSizeOuter(0)
    .tickValues([100, 110, 120, 130, 140, 150]));
```

Using scales to set element attributes directly:
```js
svg.append("circle")
  .attr("cx", systolicScale(d.systolic))
  .attr("cy", diastolicScale(d.diastolic))
  .attr("r", countScale(d.count))
  .attr("fill", colorScale(d.day))
  .attr("stroke", "black")
  .attr("stroke-width", 2);
```

**5. Binding** — makes D3 reactive to data.
Procedure: **select** elements → **define** the data → **join** with the data (updates elements to fit the data) → **format** the new (and old) elements.
```js
svg.selectAll("circle")
  .data(data)
  .join("circle")
  .attr("cx", d => systolicScale(d.systolic))
  .attr("cy", d => diastolicScale(d.diastolic))
  .attr("r", d => countScale(d.count))
  .attr("fill", d => colorScale(d.day))
  .attr("stroke", "black")
  .attr("stroke-width", 2);
```

### Marks & Channels in D3.js

| | Visualization theory | D3.js |
|---|---|---|
| **Marks** | Points, lines (incl. curves), areas, (volumes) | SVG elements: `circle`, `line`, `rect`, … |
| **Channels** | Positions on scales, lengths, areas, tilt, colour, shape | A scale + an SVG element attribute (shape is a notable exception) |

---

## Exercises 1.1 – 1.4 (Exercises 1 document)

These exercises walk through the first stages of the data pipeline above, using the Google Trends dataset:

1. **1.1 – Getting started**: open the starter project in VS Code and run it with Live Server; inspect the result in the browser.
2. **1.2 – Load the data**: find the Google Trends data in `data/`, identify its data types and format, load it, and display it with `console.log()`.
3. **1.3 – Format the data**: write a function that formats a datum into an array of `{date, type, value}` objects, then build the full formatted array with `flatMap()`.
4. **1.4 – Measure the data**: group the data by `type`, inspect each group, find min/max/count per type and the first/last date — using functions from `d3-array`.

(Exercise 1.5 – *Bind the data* — and the layout exercises that follow it — are covered in [Session 2](session02-visual-encodings.md), since they build on concepts introduced there.)
