# VIZ1 – Session 3: Manipulating Data

Source: Tamara Munzner, *"Visualization – Analysis & Design"*.
Builds on the data pipeline from [Session 1](session01-introduction.md) and the encoding theory from [Session 2](session02-visual-encodings.md).

The theme of this session: the data you load is rarely the data you draw. Before encoding, you **group** and **aggregate** it — and the shape of the aggregated data determines which chart types are available to you.

---

## Grouping

Grouping works like SQL grouping:
- A **group** is a subset of the data sharing the same value.
- That value is defined by a **key function**.
- Usually an **aggregate function** is then applied to each group.

Aggregate functions in D3: <https://d3js.org/d3-array/summarize>

Groups are most often visualized by their **sizes**, using:
- Bar chart
- Stacked bar chart
- Streamgraph

### `d3.group`

`d3.group(data, keyFn)` returns a JavaScript **Map** with one entry per unique key value.

Given this table:

| name | category | age |
|---|---|---|
| A | 1 | 12 |
| B | 1 | 21 |
| C | 1 | 15 |
| B | 1 | 17 |
| C | 2 | 22 |
| C | 2 | 11 |

- `d3.group(data, d => d.name)` → keys `A`, `B`, `C`
- `d3.group(data, d => d.category)` → keys `1`, `2`

### Grouping and aggregation by hand

The group Map can be converted to an array of aggregated records — the approach used in Session 1's *measuring* step:

```js
const groups = d3.group(data, d => d.Country);

const bpByCountry = Array.from(groups,
  ([country, values]) => {
    return {
      country,
      WHO_Region: values[0].WHO_Region,
      averageDiastolic: d3.mean(values, d => d.Diastolic_BP_mmHg),
      sampleSize: values.length
    };
  });
```

This works, but sometimes there is a better way.

### `d3.rollup` — grouping + aggregation in one step

```js
const groupedData = d3.rollup(
  data,
  group => d3.mean(group, d => d.MAP),   // aggregation function
  d => d.Age_Group);                      // key function
```

Format: `d3.rollup(data, aggregationFunction, keyFunction)`.
The result — one aggregated value per key — is directly suitable for a **bar chart**.

---

## Channels in a bar chart

Revisiting marks & channels ([Session 1](session01-introduction.md)) for a concrete chart type:

**Keys**
- Keys are **discrete** (categorical or ordinal).
- Sometimes discrete keys are created from continuous data through **binning**.
- Channels used for keys: *region* (position/area along the axis) and *colour*.

**Values**
- Values in a bar chart are **sequential** — quantitative and ordered from a minimum upwards.
- Channel used for values: the **length of the bar** (a size channel).

---

## Multidimensional groups

Both `group` and `rollup` can create **groups of groups** by taking several key functions:

```js
d3.group(data, keyFn1, keyFn2, …)
d3.rollup(data, aggregateFn, keyFn1, keyFn2, …)
```

The result is a **map of maps**. Example — counting items per year per age group:

```js
d3.rollup(data, d => d.length, d => d.Year, d => d.Age_Group)
```

Two-dimensional grouped data can be visualized with **stacked bar charts** or **streamgraphs**.

---

## Stacked bar chart

- Used to display **2-dimensional tabular data**, where both dimensions are discrete (categorical/ordinal).
- **Why** (task abstraction): compare data, discover trends, look up data (lookup is harder in a stacked chart, because only the bottom series shares a common baseline).

### What a stack is in D3.js

A stack is **an array of arrays of coordinates**:
- Each element of the outer array corresponds to one **series** (one of the colours in the chart).
- Each element of a series is a 2-element array `[from, to]` — the range the rectangle should span, **in domain values** (not pixels).

Each of those `[from, to]` arrays also carries:
- a `data` property holding the original `[key, map]` entry from the `group`/`rollup`, and
- the series array itself has an extra `key` property (here: the age group).

### Drawing a stacked bar chart

Note the **nested data join**: an outer join over the series (one `<g>` per colour), then an inner join over each series' `[from, to]` pairs.

```js
const ageGroupVis = visibleArea.selectAll(".ageGroupRects")
  .data(stacks)
  .join("g")
  .attr("class", "ageGroupRects")
  .attr("fill", d => ageGroupColorScale(d.key));

ageGroupVis.selectAll("rect")
  .data(d => d)
  .join("rect")
  .attr("x", d => regionScale(d.data[0]))
  .attr("width", regionScale.bandwidth())
  .attr("y", d => sizeScale(d[1]))
  .attr("height", d => sizeScale(d[0]) - sizeScale(d[1]));
```

- `d.data[0]` is the key of the original group (here, the region) → placed with a **band scale** (`bandwidth()` gives the band width, see [Session 2](session02-visual-encodings.md)).
- `d[0]` / `d[1]` are the `from`/`to` domain values → converted to pixels with `sizeScale`.
- Height is computed as `sizeScale(d[0]) - sizeScale(d[1])` because the y-axis range is inverted (larger values sit higher, i.e. at smaller pixel values).

### Colour choice

The colour scale must match the attribute type of the key:
- If age group is treated as **categorical** (unordered) → a categorical palette.
- If age group is treated as **ordinal** (discrete but sequential) → a sequential palette, so the order is visible.

Choosing a categorical palette for ordered data throws away information the reader could otherwise see at a glance.

---

## Streamgraph

- Also displays **2-dimensional tabular data** with both dimensions discrete.
- **Why**: compare data, discover trends, **enjoy** trends (the aesthetic/engagement action from Session 2's verb list).

### Channels in a streamgraph

**Keys**
- Discrete (categorical or ordinal), sometimes created through binning.
- Channels used: regions and colours.

**Values**
- Sequential (quantitative, ordered from a minimum upwards).
- Channel used: **position on the y-axis** (rather than the bar's length as in a bar chart).

### Creating areas

A streamgraph draws the same stack data as `<path>` areas instead of rectangles, using an **area generator**:

```js
const areaGenerator = d3.area()
  .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
  .y0(d => sizeScale(d[0]))
  .y1(d => sizeScale(d[1]));
```

- `.x()` – the horizontal position; `+ bandwidth() / 2` centres the point in its band.
- `.y0()` / `.y1()` – the lower and upper edge of the band at that x.

### Drawing the streamgraph

```js
visibleArea.append('g')
  .attr('class', 'graph')
  .selectAll("path")
  .data(stacks)
  .join("path")
  .attr("d", areaGenerator)
  .attr("fill", d => ageGroupColorScale(d.key));
```

One `<path>` per series; the area generator turns the series into the path's `d` attribute.

### Enjoying the data: smoother curves

```js
const areaGenerator = d3.area()
  .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
  .y0(d => sizeScale(d[0]))
  .y1(d => sizeScale(d[1]))
  .curve(d3.curveBasis);
```

`.curve(d3.curveBasis)` interpolates smoothly between the data points instead of connecting them with straight lines — better for *enjoying*/following trends, at the cost of exact lookup.

### Enjoying the data: centering

A true streamgraph is centred around a middle line rather than sitting on a baseline. Each band is shifted down by half the total size for that x position:

```js
const areaGenerator = d3.area()
  .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
  .y0((d, i) => sizeScale(d[0] - annualSizes[i] / 2) - center)
  .y1((d, i) => sizeScale(d[1] - annualSizes[i] / 2) - center)
  .curve(d3.curveBasis);
```

---

## Exercise

Apply the session's techniques (grouping/rollup, stacks, stacked bar chart and streamgraph) to the uploaded template project and data — the *RevenueStreamGraphMusicIndustry* project that [Session 4](session04-interactivity.md)'s exercises then build on.

> There is no separate "Exercises 3" document in the course materials; the exercise is stated on the final slide.
