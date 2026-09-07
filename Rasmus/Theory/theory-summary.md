# VIZ1 – Theory & Concepts Summary

Compiled from Session 1 (Introduction), Session 2 (Visual Encodings of Data), and Exercises 1–2.
Primary source: Tamara Munzner, *"Visualization – Analysis & Design"*.

---

## 1. The Munzner Framework: What, Why, How

A core mental model for designing any visualization:

| Question | Concerns |
|---|---|
| **What** | The data: its types and semantics |
| **Why** | The purpose: intended actions and intended targets (task abstraction) |
| **How** | The visualization: marks and channels used to encode the data |

### Task abstraction
Users describe what they want in plain language; our job is to translate that into visualization terms.

- *"I want to see how ice cream sales are influenced by temperature"* → **discover trends**
- *"I want to explore how average incomes differ across segments"* → **compare values**

**Verbs (actions):**
- **Analyze** → discover, present, enjoy; annotate, record, derive
- **Search** → lookup, browse, locate, explore
- **Query** → identify, compare, summarize

**Nouns (targets):**
- **All data** → trends, outliers, features
- **Attributes** → distribution, extremes, dependency, correlation, similarity

---

## 2. The "What": Data

### Data types (elements of a dataset)
- **Items** – samples, objects, rows, nodes in a graph
- **Attributes** – properties of items
- **Links** – edges of graphs/trees (not hyperlinks)
- **Positions** – geographic, spatial 2D/3D
- **Grid** – collections of positions with underlying geometry/topology

### Dataset types
- **Tables** – rows of items identified by a key, columns of attributes
- **Networks** – graphs of nodes and links
- **Fields** – items sampled from a continuous domain (continuous key)
- **Geometry** – spatial fields, usually geographic
- **Multi-dimensional tables** – items identified by 2+ keys

### Attribute types
- **Categorical** – discrete, unordered (names, colours, gender, species, manufacturer)
- **Ordinal** – discrete, ordered (shirt sizes, grades, floors, dates)
- **Quantitative** – continuous, ordered (revenue, medical data, prices)

### Tables: keys and values
- A table is a list of items (rows).
- An item is identified by one or more **keys** (attributes).
- The remaining attributes are **values**.
- To visualize a table, decide: are the attributes quantitative, ordinal, or categorical? What is the abstract task?

---

## 3. The "How": Marks and Channels

- **Marks** – the base geometric shapes used to represent items:
  - 0D: points
  - 1D: lines
  - 2D: areas
  - 3D: volumes (rarely used)
- **Channels** – how marks are visually presented: **position, size, colour, shape**

### Mapping to D3.js
| Visualization concept | D3.js |
|---|---|
| Marks | SVG elements (`circle`, `line`, `rect`, …) |
| Channels | A scale mapped to an SVG element attribute (exceptions exist, e.g. shape) |

### Chart choice by task (examples from Session 2)

**Discover trends:**
- Scatterplot – 2 quantitative values
- Scatterplot matrix – pairwise quantitative values
- Line chart – ordinal key + quantitative value
- Parallel coordinates – ordinal key + quantitative values

**Compare values:**
- Bar chart – ordinal key + quantitative value
- Radial bar chart – cyclic key + quantitative value

**Design pitfalls observed:**
- Too much information in one chart buries the intent (e.g. overlaying too many trend lines).
- "Gold-plating" (nice-to-have polish, e.g. a scrollable chart with a fixed axis) should come after the core design works.

---

## 4. SVG (Scalable Vector Graphics)

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

## 5. D3.js

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

### Selections
```js
const svg = d3.select("#container")
  .append("div")
  .attr("id", "barChartSVG")
  .append("svg")
  .attr("viewBox", "0 0 800 4000");
```
- A selection is a collection of SVG/HTML elements chosen via a CSS selector.
- Used to change attributes, add elements, delete elements, and bind data.

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

**4. Scaling** — a mapping from data values to displayed values (positions, colours, text, …). Used for consistent display and is mandatory for things like chart axes.
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

### Types of scales (Session 2, expanded)

**Quantitative data:**
- `d3.scaleLinear` — straightforward linear mapping.
- `d3.scaleLog` / `d3.scalePow` — logarithmic/power mappings.
- `d3.scaleSequential` — continuous colour scale for sequential data (e.g. grey → red). Better than abusing a linear scale for colour.
- `d3.scaleDiverging` — continuous colour scale for diverging data (e.g. blue → grey → red).
- `d3.scaleQuantile` / `d3.scaleQuantize` / `d3.scaleThreshold` — discrete colour scales via binning the data.

**Ordinal / categorical data:**
- `d3.scaleOrdinal` — manual 1-to-1 mapping of domain values to range values.
- `d3.scaleBand` — maps discrete domain values to *intervals* of the range (good for bar chart bars); supports `.padding()`.
  ```js
  const ageGroupScale = d3.scaleBand()
    .domain(ageGroups)
    .range([100, 500])
    .padding(0.2);
  ```
- `d3.scalePoint` — maps discrete domain values to *equidistant points* in the range.

---

## 6. Applying it: Marks & Channels in D3.js (recap)

| | Visualization theory | D3.js |
|---|---|---|
| **Marks** | Points, lines (incl. curves), areas, (volumes) | SVG elements: `circle`, `line`, `rect`, … |
| **Channels** | Positions on scales, lengths, areas, tilt, colour, shape | A scale + an SVG element attribute (shape is a notable exception) |

---

## 7. Working method / exercise progression so far

The exercises build the D3 pipeline end-to-end on a real dataset (Google Trends):

1. **1.1 – Getting started**: run the starter project with VS Code + Live Server, inspect it in the browser.
2. **1.2 – Load the data**: identify the data's types and format, then load it and inspect with `console.log()`.
3. **1.3 – Format the data**: transform each datum into a flat array of `{date, type, value}` objects using `flatMap()`.
4. **1.4 – Measure the data**: group by `type`, then find min/max/count per group and first/last date, using `d3-array` functions.
5. **1.5 – Bind the data**: bind the formatted data to `<rect>` elements, inspect the result, and (time permitting) build scales to visualize it.
6. **2.1–2.2 – Plan & implement a bar chart layout**: decide how scales position bars and labels, how `<g>` groups form a legend, then implement it (project uses the colour set `#1f77b4`, `#ff7f0e`, `#2ca02c`).
7. **2.3 – Discover trends**: design a visualization to surface trends in the Google Trends dataset, applying the task-abstraction concept from Section 1.

This progression mirrors the theoretical pipeline in Section 5: **load → format → measure → scale → bind**.

---

## 8. On Generative AI use in this course

Recommended use is for **reviewing your own work only** — not for generating designs or code. Actually learning visualization requires:
- Coming up with your own ideas
- Evaluating your own designs
- Fiddling with the code yourself to get the output right
