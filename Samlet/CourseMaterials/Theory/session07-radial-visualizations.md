# VIZ1 – Session 7: Radial Visualizations (self-study)

The session that should have covered radial charts in D3 was cancelled, so this is **self-study**. It's the theory behind **Hand-in 3** ("The Boyband Blueprint"), which *must* be radial.

**Sources**
- Book: Munzner, *Visualization Analysis & Design* — **§7.6.3 Radial Layouts**. This builds on the channel rankings in chapter 5 and the angle channel in §10.4.2, both summarised in [Session 6](session06-effective-communication.md).
- [How to build a Radial Bar Chart with D3 JS and React JS](https://dev.to/simbamkenya/how-to-build-a-radial-bar-chart-with-d3-js-and-react-js-3cil) (DEV Community).
- [D3 Graph Gallery](https://d3-graph-gallery.com/index.html), especially the [circular barplot](https://d3-graph-gallery.com/circular_barplot.html) and its [labels example](https://d3-graph-gallery.com/graph/circular_barplot_label.html).
- [Recapping radials](https://www.storytellingwithdata.com/blog/2019/7/15/recapping-radials) (*storytelling with data*) — over 50 radial charts, with a critique.
- Slides: *VIZ1 (7) – Visualization Workshop*. Brief: `Handin3.docx`.

**The one-sentence summary:** a radial chart swaps a straight axis for an **angle**, and the angle is a weaker channel than position, so going radial has to be *justified*. The good justifications are data that is genuinely **cyclic**, a **part-to-whole** with few parts, or a deliberate choice of eye-catching form. In D3 it all comes down to `d3.pie()` (data → angles), `d3.arc()` (angles → SVG path), and a little `sin`/`cos`.

---

## 1. What "radial" means

A radial layout uses **polar coordinates**:

| | Rectilinear (the charts so far) | Radial |
|---|---|---|
| Coordinates | x and y, two **position** channels | **angle** around a centre + **radius** (distance from the centre) |
| Axis shape | Two straight, perpendicular lines | A circle (angle) and a line from the centre outwards (radius) |
| Natural for | Almost everything | Cycles, part-to-whole |

Mathematically the two are the same thing, transformed. Take a rectangle: squash its bottom edge into a single point (the centre) and bend the rectangle around so its left and right edges meet. The rectangle becomes a disc (Munzner fig. 7.15). Every bar chart has a radial twin.

**Perceptually, though, they are not the same at all.** That's the whole point of this session.

---

## 2. What you give up by going radial

Munzner names two consequences "from visual encoding principles alone":

1. **Angle is perceived less accurately than position.** In the ranking from Session 6 §5, position on a common scale is #1 and tilt/angle is #4. A pie chart is worse still: it asks for **angle judgements on area marks**, and its wedges are narrow at the centre and wide at the edge, *"making the area judgement particularly difficult."*
2. **Angle is inherently cyclic.** The start and the end of a circle are the same point. That's perfect for cyclic data — and **misleading** for data that isn't (*"encoding nonperiodic data with the periodic channel of angle may be misleading"*).

Two more costs follow:

3. **The two axes are not equal.** Radial layouts *"imply an asymmetry of importance between the two attributes"*, so they're a poor choice when both attributes matter equally. An experiment by Diehl et al. found rectilinear layouts faster and more accurate overall, but suggests that if you *do* go radial, **put the more important attribute on the angle (the sectors) and the less important on the radius (the rings).**
4. **Outer marks look bigger.** For the same angle, a bar further from the centre covers more area. D3 Graph Gallery cites Mike Bostock's warning: *"long bars tend to be visually inflated if no specific care is given."* `d3.scaleRadial` exists to counter this (§6.3). The gallery also warns that bars in a circular barplot *"do not share the same Y axis"* — every bar points in its own direction, so there's no common baseline to compare along.

> **Rule of thumb:** treat radial like 3D in Session 6 — *no unjustified radial.* If a straight-axis chart answers the question, it will usually answer it more accurately.

---

## 3. When radial *is* justified

This is the answer to the workshop question *"Why are angles appropriate?"*

| Justification | Why it works | Example |
|---|---|---|
| **The data is cyclic** | Angle is cyclic too, so the end wraps round to the start. December sits next to January, and 23:59 next to 00:00. A straight axis breaks the cycle in an arbitrary place | Hour of day, day of week, month, season, compass direction |
| **Part-to-whole** | A full circle is 360° = 100%. Pie and donut slices must add up, which matches proportions | Share of a total, with **few** parts (book: *"a maximum of around a dozen"*) |
| **A single value against a maximum** | A ring that fills up reads instantly as "how far along" | Progress or KPI gauge (the DEV tutorial) |
| **A hierarchy** | Nested rings show levels: the centre is the root, the outer rings are its descendants | Sunburst |
| **Relationships between groups** | Groups sit around the edge; ribbons connect them across the middle | Chord diagram |
| **Engagement — the *enjoy* action** | *storytelling with data*: *"humans are naturally drawn to circles and curves"*; radials *"catch the eye and attention of an audience"* | Infographics, story openers |

**When it is *not* justified:**
- The task is **precise comparison** or lookup. Use bars.
- There are **many categories**, so slices become slivers.
- The data **isn't cyclic** and has no natural start and end that meet.
- Both attributes are **equally important**.
- It's radial "for the sake of it". One *storytelling with data* participant rejected forcing a radial format for exactly that reason.

The blog's verdict is worth remembering: *"circular visuals are often in conflict with the effective communication of data"*, and if a radial is chosen mainly for looks, *"you are more likely creating visual art than effective data visualization."* Hand-in 3 requires radial, so your job is to choose data and encodings where the circle *earns its place*.

---

## 4. A catalogue of radial charts

| Chart | Mark | Channels | Data | Good for | Watch out |
|---|---|---|---|---|---|
| **Pie** | Area (wedge) | **Angle** = value, hue = category | 1 categorical + 1 quantitative | Part-to-whole, ≤ ~12 parts | Angle on area is inaccurate; never 3D |
| **Donut** | Area (ring segment) | Same as pie (arc length) | Same | Same; the centre holds a title or total | Same as pie |
| **Polar area** (rose, coxcomb) | Area (wedge, all **equal angles**) | **Radius / length** = value, angle = category | 1 categorical + 1 quantitative | Cyclic categories (Florence Nightingale's months) | Area grows with radius² → use `scaleRadial` |
| **Radial bar** / **circular barplot** | Line (bar) around a circle | **Length** = value, angle = category | 1 categorical + 1 quantitative | Many categories in compact space; cyclic data | No shared baseline; outer bars inflated |
| **Radial progress / gauge** | Arc | **Arc length** = value / max | 1 value | KPI, percentage | One number — a big label might do |
| **Radar / spider** | Line (closed polygon) | **Radius** per axis | Several quantitative attributes per item | Profile shape of a few items | Axis order changes the shape; filled areas mislead |
| **Sunburst** | Nested arcs | Angle = size, ring = depth | Tree | Hierarchy plus part-to-whole | Outer rings get thin |
| **Chord** | Arcs + ribbons | Arc length = total, ribbon width = flow | Network / matrix | Flows between groups | Dense; needs interaction |
| **Radial line / area** | Line or area | Radius = value, angle = time | Time series | Cycles (daily, yearly) | Compare with a line chart |

Munzner's comparison of the three main options:
- A **pie** encodes the value with **angle on area marks** — the weakest option.
- A **polar area chart** encodes it with **length**, varying the wedge's length *"just as a bar chart varies the length of the bar"* — a more direct equivalent of a bar chart.
- A **radial bar chart** uses **line marks with length**. *"The only difference is the radial versus the rectilinear orientation of the axes."*
- For part-to-whole, a **normalized stacked bar** shows the same information with the more accurate length channel. Its trade-offs are a long, thin aspect ratio instead of a square, and less screen area.

---

## 5. The geometry you need

### 5.1 Angles in D3

- Angles are in **radians**: a full circle is `2 * Math.PI` (≈ 6.283), so `Math.PI` is half a circle. Degrees = radians × 180 / π.
- **D3's angle 0 is 12 o'clock, and angles grow clockwise**, like a clock. A quarter turn (π/2) is 3 o'clock.
- Polar → screen coordinates for a D3 angle `a` and radius `r`:

  ```js
  const x =  r * Math.sin(a);
  const y = -r * Math.cos(a);   // minus, because SVG's y-axis points down
  // or the built-in helper, which does exactly this:
  const [x, y] = d3.pointRadial(a, r);
  ```

  Verified in D3 7.9: `pointRadial(0, 100)` = `[0, -100]` (straight up), `pointRadial(π/2, 100)` = `[100, 0]` (right).

> **Classic bug:** school maths puts angle 0 at **3 o'clock** and turns **counter-clockwise** (`x = r·cos a, y = r·sin a`). Mix the two conventions and everything comes out a quarter turn off and mirrored. Use **one** convention: D3's, with `sin` for x and `−cos` for y, or simply `d3.pointRadial`.

### 5.2 Put the origin in the middle

Radial charts are drawn around (0, 0), so move a group to the centre of the SVG once and draw everything inside it:

```js
const size = 600;
const svg = d3.select('#viz').append('svg').attr('viewBox', `0 0 ${size} ${size}`);
const chart = svg.append('g').attr('transform', `translate(${size / 2}, ${size / 2})`);
```

### 5.3 SVG `rotate()` uses a different zero

SVG's `rotate(deg)` takes **degrees**, and its 0° points to **3 o'clock** (the positive x-axis). To turn something so it points along a D3 angle `a`:

```js
`rotate(${a * 180 / Math.PI - 90})`   // radians → degrees, then -90 to move 0 from 3 o'clock to 12 o'clock
```

This one line is behind every rotated radial label (§7).

---

## 6. The D3 toolbox

### 6.1 `d3.pie()` — data → angles

`d3.pie` **doesn't draw anything**. It works out where each slice starts and ends:

```js
const pie = d3.pie()
  .value(d => d.count)   // which number decides the slice size
  .sort(null);           // keep the data's order (see the trap below)

const slices = pie(data);
// each slice: { data, value, index, startAngle, endAngle, padAngle }
```

> **Trap:** by default `d3.pie()` **sorts the slices by value, largest first**. The array it returns stays in your data order, but the *angles* follow the sorted order. In a test with two values `[1, 3]`, the `3` got angles 0 → 3π/2 and the `1` came second. If your data has a meaningful order (months, size categories), use **`.sort(null)`**.

Useful options:
- `.startAngle(-Math.PI / 2).endAngle(Math.PI / 2)` — a **half circle** (gauge or "rainbow").
- `.padAngle(0.02)` — gaps between slices.

### 6.2 `d3.arc()` — angles → SVG path

`d3.arc` is a **path generator**, like `d3.area()` in [Session 3](session03-manipulating-data.md). Give it a start angle, an end angle and two radii, and it returns the `d` string for a ring segment:

```js
const arc = d3.arc()
  .innerRadius(120)     // 0 = pie wedge, > 0 = donut segment
  .outerRadius(250)
  .padAngle(0.01)       // gap between neighbours
  .cornerRadius(4);     // rounded corners

chart.selectAll('path')
  .data(slices)         // the output of d3.pie(): each slice has startAngle and endAngle
  .join('path')
  .attr('d', arc)
  .attr('fill', d => color(d.data.category));
```

Every setting can be a **constant or a function of the datum**. That's how a circular barplot turns the outer radius into the data channel: `.outerRadius(d => y(d.value))`.

`arc.centroid(d)` returns the **middle** of a segment — halfway between the two radii, at the middle angle. It's the easiest label position (§7.1).

### 6.3 Scales for radial charts

| Purpose | Scale | Note |
|---|---|---|
| **Category → angle** | `d3.scaleBand().domain(categories).range([0, 2 * Math.PI])` | `bandwidth()` is now the angular width of one category |
| **Cyclic number → angle** (hour, month) | `d3.scaleLinear().domain([0, 24]).range([0, 2 * Math.PI])` | Use the **full** cycle as the domain (`[0, 24]`, not `[0, 23]`), or the last value ends up on top of the first |
| **Value → radius** | **`d3.scaleRadial().domain([0, max]).range([inner, outer])`** | Makes the **area** grow with the value, not the radius. Verified: with domain and range 0–100, `scaleRadial(25)` = 50 (a linear scale gives 25), so area ∝ value |
| **Value → angle** (gauge) | `d3.scaleLinear().domain([0, max]).range([0, 2 * Math.PI])` | |

**Why `scaleRadial` and an inner radius matter:** without an inner radius, small values are squashed into slivers at the centre. Without `scaleRadial`, a doubled value covers *four times* the area. It's the same fix as using `scaleSqrt` for circle radii in Session 6.

A visible side effect: with `scaleRadial`, evenly spaced values (0, 5, 10, …) give gridline circles that get **closer together further out**. That's correct — each ring adds the same amount of *area* — but it's worth explaining in your reading guide.

### 6.4 Points around a circle: `Math.sin` / `Math.cos`

Hand-in 3's example uses this to place band members as circles and lines around each band's arc:

```js
// spread the n members of a band evenly across the band's slice
const members = band.members;
const step = (slice.endAngle - slice.startAngle) / members.length;

members.forEach((m, i) => {
  const angle = slice.startAngle + step * (i + 0.5);     // middle of the member's share
  const [x, y] = d3.pointRadial(angle, radiusFor(m));    // same as [r*sin, -r*cos]
  chart.append('circle').attr('cx', x).attr('cy', y).attr('r', 5);
});
```

A line from the circle's edge to that point is the same idea twice: `pointRadial(angle, inner)` to `pointRadial(angle, outer)`.

### 6.5 Radial lines and areas

`d3.lineRadial()` and `d3.areaRadial()` are the polar versions of `d3.line()` and `d3.area()`. Use `.angle()` and `.radius()` instead of `.x()` and `.y()`:

```js
const radar = d3.lineRadial()
  .angle((d, i) => i * 2 * Math.PI / attributes.length)
  .radius(d => r(d.value))
  .curve(d3.curveLinearClosed);   // close the shape for radar charts
```

### 6.6 There's no `d3.axisRadial`

You draw the reading aids yourself, with the same join pattern as always:

```js
// concentric gridlines: the radial "y-axis". Draw these BEFORE the bars, so they sit behind them.
const ticks = y.ticks(4);
chart.selectAll('.grid').data(ticks).join('circle')
  .attr('class', 'grid').attr('r', d => y(d))
  .attr('fill', 'none').attr('stroke', '#ccc').attr('stroke-dasharray', '2,3');

// ...draw the bars here...

// gridline labels: draw these AFTER the bars, with a white halo.
// 12 o'clock is exactly where the first bar starts, so labels drawn first end up hidden behind it.
chart.selectAll('.grid-label').data(ticks).join('text')
  .attr('class', 'grid-label').attr('y', d => -y(d)).attr('dy', '-0.3em')
  .attr('text-anchor', 'middle')
  .attr('stroke', 'white').attr('stroke-width', 3).attr('paint-order', 'stroke')
  .text(d => d);
```

---

## 7. Labels — the hard part

Labels are where radial charts usually break. There are three standard approaches.

### 7.1 Centroid labels

Use these for big segments in pies and donuts:

```js
chart.selectAll('.label').data(slices).join('text')
  .attr('class', 'label')
  .attr('transform', d => `translate(${arc.centroid(d)})`)
  .attr('text-anchor', 'middle')
  .text(d => d.data.category);
```

### 7.2 Rotated labels that point outwards

Use these for circular barplots. This is the gallery's technique:

```js
const mid = d => x(d.category) + x.bandwidth() / 2;            // the middle angle of the bar
const onLeft = d => (mid(d) + Math.PI) % (2 * Math.PI) < Math.PI; // true for the left half

chart.selectAll('.label').data(data).join('g')
  .attr('transform', d => `rotate(${mid(d) * 180 / Math.PI - 90}) translate(${y(d.value) + 10}, 0)`)
  .attr('text-anchor', d => onLeft(d) ? 'end' : 'start')
  .append('text')
  .attr('transform', d => onLeft(d) ? 'rotate(180)' : null)
  .attr('dominant-baseline', 'middle')
  .text(d => d.category);
```

Read it in three steps:
1. **Rotate** the group so its x-axis points outwards along the bar (the −90 from §5.3).
2. **Translate** along that x-axis to just past the end of the bar.
3. On the **left half** the text would read upside down, so rotate it 180° and anchor it at the end.

### 7.3 Labels outside the circle

Use these when segments are too small for text: place the label at `arc.centroid` of a bigger arc (e.g. `outerRadius + 20`), with a leader line, or move the detail into a **tooltip**.

**Readability rules:**
- Keep text **horizontal or radial** — never tilted at an arbitrary angle (Munzner's *"tilted text isn't legible"*). Flip the left half so nothing is upside down.
- **Leave out** labels that don't fit, rather than letting them overlap. Show them on hover instead.
- Start at **12 o'clock and go clockwise** — readers already know how to read a clock.
- **Order** the segments deliberately: the natural order for cyclic or ordinal data (`.sort(null)`), sorted by value for categorical data.

---

## 8. Interaction on radial charts

Nothing new compared to [Session 4](session04-interactivity.md): arcs are just `<path>` elements, so `.on('click', (event, d) => update(...))` works as usual. And `d.data` gives the original row when the data came through `d3.pie()`.

Common interactions (Hand-in 3's examples):
- **Click** an arc to reveal details or members (a details panel).
- **Hover** to highlight. A cheap effect is to redraw the hovered arc with a slightly bigger `outerRadius`.
- **Filter** by an attribute, then fade the non-matching segments (figure–ground from Session 6).

> **Transitions of arcs:** transitioning `.attr('d', arc)` straight between two pie layouts makes D3 interpolate the *path strings*, which gives warped shapes. The correct technique is `.attrTween('d', …)`, which interpolates the **angles** and redraws the arc on each frame. For a hand-in it's perfectly fine to animate simpler things instead — opacity, colour or radius — which interpolate cleanly.

---

## 9. Worked example: is radial justified for the boyband data?

Using `Rasmus/Handin03/boys.csv`: 234 members in 55 bands.

### 9.1 A justified radial: birthdays across the year

**Question:** *Are boyband members' birthdays spread evenly through the year?*

Birth month is derived from `dob`, which 191 members have:

| Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 22 | 13 | 8 | 10 | 14 | 16 | 16 | 20 | 20 | 15 | 22 | 15 |

- **Month is cyclic**, so angle is *expressive*: December really is next to January. On a straight bar chart the busy November–January stretch (22, 15, 22) is split across the two ends of the axis. On a circle it shows as one clump.
- Chart: a **radial bar chart / polar area chart**. Angle = month (`scaleBand` over 12 months), length = count (`scaleRadial`). Start at 12 o'clock, go clockwise, `.sort(null)` (months keep their order).
- Following Diehl et al., the angle carries the structure the reader navigates by (the month) and the radius carries the value. Twelve categories is right at Munzner's *"around a dozen"* limit — fine.

### 9.2 A part-to-whole: hair length

Short 137, medium 78, long 14 (229 members). Three categories that add up to a whole, so a **pie or donut** is defensible. But be honest at the exam: a single normalized stacked bar would show the same with the more accurate length channel. The radial version is chosen for form and fits a radial assignment; the bar is more precise.

### 9.3 Not justified: height

`height` (60–79 inches, 119 members) is ordered but **not cyclic**. Mapping it to an angle would put the shortest and tallest members next to each other, at the top of the circle. That's misleading. If height is in your design, encode it with **radius or length** — e.g. the length of each member's line in the hand-in example — not with angle.

### 9.4 The structural layer: band sizes

Bands have 3–7 members. `d3.pie().value(d => d.members.length)` makes each band's arc **proportional to its number of members**, which is part-to-whole over all 234 members. Members can then be placed inside their band's arc with §6.4. This is the hand-in example's structure: *arcs as a meaningful structural element, not decoration.*

---

## 10. For the workshop and Hand-in 3

The session 7 slides and the Hand-in 3 brief ask questions that this document answers:

| Question | Where |
|---|---|
| *Why are angles appropriate?* | §3 (justifications) and §2 (costs) — name the property of your data the angle matches (cyclic, part-to-whole) |
| *How does the arc layout communicate?* | §4 (which channel does the arc use: angle, arc length, radius?) and §9 |
| *Which marks and channels?* | §4; the ranking in [Session 6](session06-effective-communication.md) §5 |
| *Label orientation, spacing, overlap, readability* | §7 |
| *Legend / reading guide* | Concentric gridlines with values (§6.6), a centre label, a short "how to read" note. A radial chart needs more reading support than a bar chart |
| *Meaningful interaction* | §8 |

### Marks-and-channels planning table (the hand-in's format), filled for §9.1

| Data attribute | Mark | Channel | Why this choice? |
|---|---|---|---|
| Birth month | Radial bar (line mark in a wedge) | **Angle** (`scaleBand` over 12 months, clockwise from 12 o'clock) | Month is cyclic; angle is the one channel where December meets January |
| Number of members born that month | Same bar | **Length / radius** (`scaleRadial` from an inner radius) | Length is the most accurate channel left; `scaleRadial` keeps area proportional to the count |
| Season (derived) | Bar fill | **Hue**, 4 colours | Categorical → identity channel; groups the months (similarity) |
| Count values | Concentric circles + labels | Position along the radius | Reading support — a radial chart has no axis of its own |

---

## 11. Checklist

- [ ] I can say **why** this is radial: cyclic data, part-to-whole, gauge, hierarchy, or a deliberate engagement goal.
- [ ] Angle is **not** used for non-cyclic ordered data.
- [ ] The more important attribute is on the **angle**, the less important on the **radius**.
- [ ] ≤ about a dozen slices/segments, or a plan for the rest ("Other", tooltip).
- [ ] `d3.pie().sort(null)` if the order matters.
- [ ] `scaleRadial` for a value on the radius, and an **inner radius** so small values aren't slivers.
- [ ] Angles: D3 convention (0 at 12 o'clock, clockwise); `d3.pointRadial` or `[r·sin, −r·cos]`.
- [ ] Labels: no upside-down text, no overlap; tooltips for small segments.
- [ ] Reading support: gridline circles, a legend, a centre label or annotation.
- [ ] Colour from Session 6: categorical hue, colour-blind tested.
- [ ] No 3D pies.
