# VIZ1 – Session 3: Manipulating Data

Slides: *VIZ1 (3) – Manipulating data* (Ole I Hougaard).
Builds on the D3.js pipeline from [Session 1](session01-introduction.md) and the data/task/scale vocabulary from [Session 2](session02-visual-encodings.md).

**The one-sentence summary:** raw rows are almost never what you draw — first you *group* them, then you *aggregate* them, then (for two-dimensional data) you *stack* them. This session is about those three steps and the two charts they unlock: the **stacked bar chart** and the **streamgraph**.

The running example is a WHO blood-pressure dataset. Each row is one measured person:

| Country | WHO_Region | Age_Group | Year | Diastolic_BP_mmHg | MAP |
|---|---|---|---|---|---|
| Denmark | Europe | Adult (30-39) | 2004 | 78 | 93.1 |
| Kenya | Africa | Infant (0-1) | 2001 | 41 | 57.8 |
| … | … | … | … | … | … |

---

## 1. Grouping

Grouping in D3 works like `GROUP BY` in SQL: **a group is the subset of rows that share the same value**, and you say what "the same value" means by passing a **key function**.

```js
const byRegion = d3.group(data, d => d.WHO_Region);
```

`d3.group()` returns a **JavaScript `Map`** with one entry per unique key. The key is whatever the key function returned; the value is **the array of original rows** in that group.

Take this tiny table:

| name | category | age |
|---|---|---|
| A | 1 | 12 |
| B | 1 | 21 |
| C | 1 | 15 |
| B | 1 | 17 |
| C | 2 | 22 |
| C | 2 | 11 |

- `d3.group(data, d => d.name)` → a Map with keys `A`, `B`, `C` (3 entries)
- `d3.group(data, d => d.category)` → a Map with keys `1`, `2` (2 entries)

```js
const byName = d3.group(data, d => d.name);
byName.get("C");
// [ {name:"C", category:1, age:15},
//   {name:"C", category:2, age:22},
//   {name:"C", category:2, age:11} ]
```

> **Junior tip:** a `Map` is not an array and not a plain object. You read it with `.get(key)`, loop it with `for (const [key, rows] of map)`, and turn it into an array of `[key, rows]` pairs with `Array.from(map)`. D3's `.data()` accepts any iterable, so you can often pass the Map straight in.

Grouping alone doesn't give you something to draw — it gives you *piles of rows*. You still have to reduce each pile to a number.

---

## 2. Aggregating

### 2a. The manual way (`d3.group` + `Array.from`)

This is what we did in session 2: group first, then map each `[key, rows]` entry into an object with the numbers you want.

```js
const groups = d3.group(data, d => d.Country);

const bpByCountry = Array.from(groups, ([country, values]) => ({
  country,
  WHO_Region: values[0].WHO_Region,                        // carry a field along
  averageDiastolic: d3.mean(values, d => d.Diastolic_BP_mmHg),
  sampleSize: values.length
}));
// [ { country: "Denmark", WHO_Region: "Europe", averageDiastolic: 79.4, sampleSize: 512 }, … ]
```

Use this when you need **several numbers per group**, or need to keep extra fields around.

### 2b. The short way (`d3.rollup`)

`d3.rollup` combines grouping and aggregation in one call. The signature is:

```js
d3.rollup(data, aggregationFunction, keyFunction1, keyFunction2, …)
```

Note the order: **the aggregation function comes before the key functions.**

```js
const groupedData = d3.rollup(
  data,
  group => d3.mean(group, d => d.MAP),   // aggregate: each group array → one number
  d => d.Age_Group                       // key: what defines a group
);
// Map { "Infant (0-1)" => 57.8, "Early Childhood (1-5)" => 64.1, … }
```

You get a `Map` of **key → single value** instead of key → array. That is exactly the shape a bar chart wants: one bar per key, bar length from the value.

Common aggregation functions from `d3-array` ([docs](https://d3js.org/d3-array/summarize)): `d3.mean`, `d3.median`, `d3.sum`, `d3.min`, `d3.max`, `d3.extent`, `d3.count`, `d3.deviation`. To count rows, the aggregation function is just `group => group.length`.

| | `d3.group` | `d3.rollup` |
|---|---|---|
| Returns | key → **array of rows** | key → **aggregated value** |
| Use when | you need the rows, or many stats per group | you need one number per group |

---

## 3. Bar chart: which channels are doing what?

Before writing code, name the channels (session 2's "How"):

**Keys** — the categories, one per bar
- Must be **discrete**: categorical or ordinal.
- Sometimes you *create* discrete keys by **binning** a quantitative attribute (e.g. ages 0–1, 1–5, 6–10 → "Age Group"). That's what the dataset already did.
- Channels used: **region** (the bar's position/slot) and **colour**.

**Values** — the measured number
- **Sequential / quantitative**, ordered from a minimum upwards.
- Channel used: the **length of the bar** (a size channel).

Concretely, for a horizontal bar chart of mean arterial pressure per age group:

```js
const ageGroupScale = d3.scaleBand()      // key   → a slot (region channel)
  .domain([...groupedData.keys()])
  .range([0, 450])
  .padding(0.2);

const mapScale = d3.scaleLinear()          // value → a length (size channel)
  .domain([50, 110])
  .range([0, 550]);

svg.selectAll("rect")
  .data(groupedData)                       // a Map iterates as [key, value] pairs
  .join("rect")
  .attr("y", ([key]) => ageGroupScale(key))
  .attr("height", ageGroupScale.bandwidth())
  .attr("x", 0)
  .attr("width", ([, value]) => mapScale(value));
```

> **Watch out:** the length channel is only honest if the value axis starts at its true baseline (usually 0). Starting a bar axis at 50 — as the lecture's example does, to spread the pressures out — exaggerates differences. Fine for exploring, risky for presenting.

---

## 4. Multi-dimensional groups

Both `d3.group` and `d3.rollup` take **more than one key function**:

```js
d3.group(data, keyFn1, keyFn2, …)
d3.rollup(data, aggregateFn, keyFn1, keyFn2, …)
```

The result is a **Map of Maps** — one level of nesting per key function.

```js
const nested = d3.rollup(
  data,
  d => d.length,        // count the people
  d => d.Year,          // outer key
  d => d.Age_Group      // inner key
);
// Map {
//   2000 => Map { "Infant (0-1)" => 180, "Early Childhood (1-5)" => 380, … },
//   2001 => Map { "Infant (0-1)" => …,   … },
//   …
// }

nested.get(2000).get("Infant (0-1)");   // 180
```

This is two-dimensional tabular data: outer key × inner key → number. Two charts display it well: the **stacked bar chart** and the **streamgraph**.

---

## 5. Stacked bar chart

**What it shows:** two-dimensional tabular data where *both* dimensions are discrete (categorical/ordinal).

**Why (task abstraction):**
- ✅ **Compare** values — total heights are easy to compare
- ✅ **Discover** trends — across the outer key
- ⚠️ **Lookup** a specific value — harder; only the bottom series sits on a common baseline

### 5.1 What `d3.stack()` actually produces

This is the part that confuses everyone the first time, so look at the shape before the code.

A stack is **an array of arrays of coordinates**:

- The **outer array** has one element per inner key — one per colour in the legend (e.g. one per age group). Each of these carries a `.key` property naming that series.
- Each **inner element** is a 2-element array `[from, to]`: where that rectangle starts and ends **in domain values, not pixels**. D3 has already done the running sum for you.
- Each inner element also carries a `.data` property: the **original entry** from your group/rollup, i.e. the 2-element array `[key, map]`.

```js
const ageGroups = [...new Set(data.map(d => d.Age_Group))];

const stacker = d3.stack()
  .keys(ageGroups)                                  // one series per age group
  .value(([region, ageMap], ageGroup) => ageMap.get(ageGroup) ?? 0);

const stacks = stacker(groupedData);                // groupedData: Map region → Map ageGroup → count
```

Printed, one series looks like this:

```js
stacks[0].key           // "Infant (0-1)"           ← the series (colour)
stacks[0][0]            // [0, 45]                  ← [from, to] in domain values
stacks[0][0].data       // ["Africa", Map { … }]    ← the original entry
stacks[0][0].data[0]    // "Africa"                 ← the outer key (the bar)
```

So inside the drawing code:
- `d.key` → **which colour** (the inner key / series)
- `d.data[0]` → **which bar** (the outer key)
- `d[0]`, `d[1]` → **bottom and top** of this rectangle, in domain values

> **Junior tip:** `.value()` is needed here because the default accessor reads `d[key]` off a plain object. Our data is a Map of Maps, so we tell D3 how to dig out a number. And `?? 0` matters — a missing combination must become 0, or you get `NaN` coordinates and invisible rectangles.

### 5.2 Drawing it: a nested data join

A stacked bar chart is a **two-level join**: one `<g>` per series (carrying the colour), and inside it one `<rect>` per bar.

```js
const ageGroupVis = visibleArea.selectAll(".ageGroupRects")
  .data(stacks)                                       // level 1: one group per series
  .join("g")
  .attr("class", "ageGroupRects")
  .attr("fill", d => ageGroupColorScale(d.key));      // colour set once, inherited by children

ageGroupVis.selectAll("rect")
  .data(d => d)                                       // level 2: the series' own array
  .join("rect")
  .attr("x", d => regionScale(d.data[0]))             // which bar
  .attr("width", regionScale.bandwidth())
  .attr("y", d => sizeScale(d[1]))                    // top of the segment
  .attr("height", d => sizeScale(d[0]) - sizeScale(d[1]));
```

Two things to internalise:

1. **`.data(d => d)`** — in a nested join, the data function receives the parent's datum. The parent's datum *is* the array of `[from, to]` pairs, so returning it unchanged spreads it over the child `<rect>`s.
2. **`height = sizeScale(d[0]) - sizeScale(d[1])`** and not the other way around. `sizeScale` is a y-scale, so its range is inverted (`[height, 0]`): a bigger value gives a smaller pixel y. `y` is the *top* (`d[1]`), and the height is the bottom pixel minus the top pixel.

`regionScale` is a `d3.scaleBand` (see [Session 2](session02-visual-encodings.md)) — `.bandwidth()` gives the width of one slot, padding already subtracted.

### 5.3 Colour choice

The lecture showed the same chart twice, identical except for the colour scale:

| Treating age group as… | Palette | Result |
|---|---|---|
| **Categorical** (unordered) | 12 distinct hues (blue, green, red, orange, purple…) | Segments are easy to tell apart, but the eye finds no order — you cannot see "young at the bottom, old at the top" |
| **Ordinal** (discrete but *sequential*) | one sequential ramp, e.g. `d3.interpolateViridis` | The bar reads bottom-to-top as a progression; the ordering in the data becomes visible in the picture |

Age group is ordinal, so the sequential ramp is the correct choice.

```js
const ageGroupColorScale = d3.scaleOrdinal()
  .domain(ageGroups)
  .range(ageGroups.map((_, i) => d3.interpolateViridis(i / (ageGroups.length - 1))));
```

**Rule of thumb:** match the palette to the attribute type. Categorical → distinct hues. Ordinal/quantitative → a sequential ramp. Diverging data (around a meaningful midpoint) → a diverging ramp.

---

## 6. Streamgraph

Same data, same two discrete dimensions — but the segments become smooth flowing bands. It is the stacked bar chart's sibling, so most of the code is shared.

**Channels:**
- **Keys** — discrete (categorical/ordinal), possibly created by binning. Channels: **region** (position along x) and **colour**.
- **Values** — sequential/quantitative. Channel: **position on the y-axis** (where the band's edges sit), rather than a bar length.

**Why:** compare values, discover trends, and **enjoy** the data — "enjoy" is a legitimate goal in session 2's verb list, and it's the one that justifies the extra polish below.

### 6.1 The area generator

Where the bar chart drew one `<rect>` per data point, the streamgraph draws **one `<path>` per series**. `d3.area()` is a generator: you configure it with accessor functions, and it becomes a function that turns an array of points into an SVG path string.

```js
const areaGenerator = d3.area()
  .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)  // centre of the band slot
  .y0(d => sizeScale(d[0]))                                  // bottom edge
  .y1(d => sizeScale(d[1]));                                 // top edge
```

The accessors read the **exact same stack structure** as section 5.1: `d.data[0]` is the outer key (here the year), `d[0]`/`d[1]` are the bottom and top in domain values. The `+ bandwidth() / 2` centres the point in its band, so the curve passes through the middle of each slot instead of its left edge.

### 6.2 Drawing it

```js
visibleArea.append("g")
  .attr("class", "graph")
  .selectAll("path")
  .data(stacks)                                  // one path per series — no nested join
  .join("path")
  .attr("d", areaGenerator)                      // D3 calls the generator with the datum
  .attr("fill", d => ageGroupColorScale(d.key));
```

Note `.attr("d", areaGenerator)` — you pass the *function itself*, and D3 calls it with each series array. Also note that `d` is doing double duty here: the SVG attribute named `d` (path data) and the D3 convention of naming the datum `d`. Unrelated things that happen to share a letter.

### 6.3 Enjoying the data: smoother curves

Straight segments between years look jagged. Add an interpolation curve:

```js
const areaGenerator = d3.area()
  .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
  .y0(d => sizeScale(d[0]))
  .y1(d => sizeScale(d[1]))
  .curve(d3.curveBasis);          // ← smooth
```

`d3.curveBasis` is a B-spline: it smooths *past* the data points rather than through them, which is what gives a streamgraph its organic look. If you need the curve to actually hit every value, use `d3.curveCatmullRom` or `d3.curveMonotoneX` instead.

### 6.4 Enjoying the data: centering

A streamgraph is usually centred on an invisible baseline rather than sitting on the x-axis. Do it by shifting each column *down by half its own total*, so every column is balanced around zero:

```js
const areaGenerator = d3.area()
  .x(d => yearScale(d.data[0]) + yearScale.bandwidth() / 2)
  .y0((d, i) => sizeScale(d[0] - annualSizes[i] / 2) - center)
  .y1((d, i) => sizeScale(d[1] - annualSizes[i] / 2) - center)
  .curve(d3.curveBasis);
```

- `annualSizes[i]` is the **total** for the i-th x-position (the sum over all age groups in that year). Precompute it once — the index `i` lines up because every series walks the same x-positions in the same order.
- Subtracting `annualSizes[i] / 2` happens in **domain values**, inside the scale.
- `center` is a constant **pixel** offset that moves the whole shape into the middle of the SVG.

> **Shortcut (not in the slides):** `d3.stack().offset(d3.stackOffsetWiggle)` does the classic streamgraph centering for you, and `d3.stackOffsetSilhouette` does plain symmetric centering. The manual version above is worth understanding first, because it makes explicit what those offsets are doing.

---

## 7. Picking between them

| | Stacked bar chart | Streamgraph |
|---|---|---|
| Value channel | bar **length** | **position** of the band edges |
| Mark | `<rect>` per cell (nested join) | `<path>` per series |
| Best at | comparing totals, reading the bottom series | seeing shape and flow over an ordered key |
| Worst at | looking up a value mid-stack | looking up any value — no common baseline at all |
| Outer key wants to be | categorical or ordinal | **ordinal/sequential** (usually time) |

Both come from the *same* rollup and the *same* `d3.stack()` output. Once you have the stack, swapping between them is a change of marks, not a change of data.

---

## 8. The pipeline, end to end

```js
// 1. LOAD  (session 1)
const raw = await d3.csv("data/blood_pressure.csv", d3.autoType);

// 2. GROUP + AGGREGATE  (this session)
const groupedData = d3.rollup(raw, g => g.length, d => d.WHO_Region, d => d.Age_Group);

// 3. STACK
const ageGroups = [...new Set(raw.map(d => d.Age_Group))];
const stacks = d3.stack()
  .keys(ageGroups)
  .value(([region, ageMap], ag) => ageMap.get(ag) ?? 0)(groupedData);

// 4. MEASURE + SCALE  (sessions 1–2)
const maxTotal = d3.max(groupedData.values(), m => d3.sum(m.values()));
const regionScale = d3.scaleBand().domain([...groupedData.keys()]).range([60, 760]).padding(0.1);
const sizeScale   = d3.scaleLinear().domain([0, maxTotal]).range([500, 20]);

// 5. BIND + DRAW  (this session: nested join, or one path per series)
```

**Debugging checklist** — when the chart comes out blank, `console.log` in this order: the rollup Map, then `stacks`, then `stacks[0][0]` and `stacks[0][0].data`. Almost every stacked-chart bug is either a `NaN` from a missing combination (fix with `?? 0`), or reading `d[0]` where you meant `d.data[0]`.

---

## Exercise

The slide deck ends with a single open exercise:

> **Try this on the uploaded template project and data.**

Which, concretely, means working through the session on the WHO blood-pressure data:

1. **Group and aggregate** — build a one-dimensional rollup (e.g. mean `MAP` per `Age_Group`) and draw it as a bar chart. Check that your key is discrete and your value scale's baseline is honest.
2. **Go two-dimensional** — rollup with two key functions (e.g. count per `WHO_Region` × `Age_Group`, or per `Year` × `Age_Group`) and inspect the Map of Maps in the console before drawing anything.
3. **Stack it** — build the stack, print `stacks[0][0]` until the `[from, to]` / `.data` / `.key` structure is obvious, then draw the stacked bar chart with the nested join.
4. **Fix the colours** — swap a categorical palette for a sequential ramp and compare what each one lets you see.
5. **Turn it into a streamgraph** — keep the stack, replace the rects with `d3.area()` paths over `Year`, then add `.curve(d3.curveBasis)` and the centering offset.
