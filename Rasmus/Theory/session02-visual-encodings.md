# VIZ1 – Session 2: Visual Encodings of Data

Source: Tamara Munzner, *"Visualization – Analysis & Design"*.
Builds directly on the What/Why/How framework and D3.js pipeline from [Session 1](session01-introduction.md).

---

## The "What": Data

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

---

## The "Why": Task abstraction

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

## Tables: keys and values

- A table is a list of items (rows).
- An item is identified by one or more **keys** (attributes).
- The remaining attributes are **values**.
- To visualize a table (a key+value pair, or two values), decide: are the attributes quantitative, ordinal, or categorical? What is the abstract task?

### Chart choice by task

**Discover trends:**
- Scatterplot – 2 quantitative values
- Scatterplot matrix – pairwise quantitative values
- Line chart – ordinal key + quantitative value
- Parallel coordinates – ordinal key + quantitative values

**Compare values:**
- Bar chart – ordinal key + quantitative value
- Radial bar chart – cyclic key + quantitative value

**Design pitfalls observed in examples:**
- Too much information in one chart buries the intent (e.g. overlaying too many trend lines).
- Colour choices matter even for a "simple" bar chart discovering trends.
- "Gold-plating" (nice-to-have polish, e.g. a scrollable chart with a separate fixed axis) should come after the core design works — implemented with two stacked SVGs: a static axis SVG and a scrollable content SVG.

---

## Working with data (revisited)

### Selection
```js
const svg = d3.select("#container")
  .append("div")
  .attr("id", "barChartSVG")
  .append("svg")
  .attr("viewBox", "0 0 800 4000");
```
- A selection is a collection of SVG/HTML elements chosen via a CSS selector.
- Used to change attributes, add elements, delete elements, and bind data.

### Binding (recap)
Makes D3 reactive to data. Procedure: **select** elements → **define** the data → **join** with the data (updates elements to fit the data) → **format** the new (and old) elements.
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

### Scaling (revisited and expanded)

A scale is a mapping from data values to displayed values (positions, colours, text, …). Used for consistent display and mandatory for things like chart axes.

```js
const systolicScale = d3.scaleLinear().domain([90, 160]).range([100, 660]);
const diastolicScale = d3.scaleLinear().domain([60, 110]).range([500, 100]);
const colorScale = d3.scaleLinear()
  .domain([0, 3])
  .range(["white", "lightgray", "darkgray", "gray"]);
```

**Types of scaling for quantitative data:**
- `d3.scaleLinear` — straightforward linear mapping.
- `d3.scaleLog` / `d3.scalePow` — logarithmic/power mappings.
- `d3.scaleSequential` — continuous colour scale for sequential data (e.g. grey → red). Better than abusing a linear scale for colour.
- `d3.scaleDiverging` — continuous colour scale for diverging data (e.g. blue → grey → red).
- `d3.scaleQuantile` / `d3.scaleQuantize` / `d3.scaleThreshold` — discrete colour scales via binning the data.

**Types of scaling for ordinal / categorical data:**
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

## Exercises 1.5, 2.1 – 2.3 (Exercises 2 document)

Continuing from Session 1's pipeline exercises, using the Google Trends dataset and building toward the bar-chart hand-in:

1. **1.5 – Bind the data**: apply data binding to the `<rect>` elements of the project; print and inspect the result with `console.log()`; if time permits, create appropriate scales and visualize some data.
2. **2.1 – Planning the layout**: design a bar chart layout — how would scales position the bars and labels? How would `<g>` groups build the legend? (Sketch it before implementing.)
3. **2.2 – Implementing the layout**: implement the planned layout in D3.js, in small steps. Colours used: `#1f77b4`, `#ff7f0e`, `#2ca02c`.
4. **2.3 – Discover trends**: design a visualization to surface trends in the Google Trends data — applying the task-abstraction concept from this session.
