# VIZ1 – Session 6: Effective Communication in Visualizations

Slides: *VIZ1 (6) – Effective Communication in Visualizations* (Ole I Hougaard).
Book: Munzner, *Visualization Analysis & Design* — **chapter 5** (Marks and Channels) and **chapter 10** (Map Color and Other Channels).
Web: [gestaltprinciples.com](https://www.gestaltprinciples.com/) and [color-blindness.com](https://www.color-blindness.com/) (home of the **Coblis** simulator).
Builds on the data/task abstraction from [Session 5](session05-exploratory-visualizations.md): that session was the *What* and the *Why*; this one is the *How*.

**The one-sentence summary:** once you know your attribute types and which attributes matter most, the encoding is close to a lookup — ordered attributes get **magnitude** channels, categorical attributes get **identity** channels, the most important attribute gets the **most effective** channel (almost always position), and colour is three channels, not one, that you must test against colour blindness.

---

## 1. Marks

A **mark** is a basic graphical element, classified by how many spatial dimensions it needs:

| Mark | Dimension | Examples | D3.js |
|---|---|---|---|
| **Point** | 0D | Scatterplot dots | `<circle>`, `d3.symbol()` |
| **Line** | 1D | Bars (yes — a bar is a *line* mark), line chart | `<line>`, `<rect>` used as a bar, `<path>` |
| **Area** | 2D | Map regions, treemap cells, streamgraph bands | `<path>` from `d3.area()`, `<rect>` as a region |
| **Volume** | 3D | Rarely used | — |

### Marks can be items or links

For tables a mark is an **item**. For networks a mark can also be a **link**:
- **Connection** — a line between two items (node–link diagram).
- **Containment** — areas nested inside each other to show hierarchy (treemaps, Venn-style enclosures).

Links can't be drawn as points.

### What a mark can still carry

A mark's dimensionality limits which channels are still free:

- **Area marks** already have their size and shape fixed by what they are (a country on a map, a treemap cell), so they **can't be size- or shape-coded**. The cartogram is the famous exception.
- **Line marks** that use length for a value can be size-coded only in the *other* direction (fatter bars), never longer — the length is already "taken".
- **Point marks** are completely unconstrained, so they can carry **size and shape**. That's exactly why the bubble chart works.

---

## 2. Channels

A **visual channel** controls the appearance of a mark, independently of its dimensionality. The main ones from the book:

| Group | Channels |
|---|---|
| Position | Horizontal, vertical, both; spatial region; depth (3D) |
| Colour | **Hue, saturation, luminance** (three separate channels — §6) |
| Size | Length (1D), area (2D), volume (3D) |
| Other | Tilt/angle, curvature, shape, motion (direction, velocity, flicker), texture |

Munzner's progression shows one channel being added per extra attribute:

1. **Bar chart** — line marks; vertical position for a quantitative attribute, horizontal position for a categorical one.
2. **Scatterplot** — a second quantitative attribute takes horizontal position, so the mark becomes a point.
3. **+ hue** — a third, categorical attribute.
4. **+ size** — a fourth, quantitative attribute.

That's Session 1's blood-pressure demo, step for step.

**Redundant encoding** means the same attribute on two channels (e.g. hue *and* shape). It uses up channels, but whatever you encode becomes very easy to see — and it's the standard colour-blindness safety net (§9).

### Channels in D3.js

In D3, *a channel = a scale + an SVG attribute*:

| Channel | SVG attribute | Typical scale |
|---|---|---|
| Aligned position | `x`, `y`, `cx`, `cy`, `transform` | `scaleLinear`, `scaleTime`, `scaleBand`, `scalePoint` |
| Length | `width`, `height` | `scaleLinear` with a **zero** baseline |
| Area | `r` | **`scaleSqrt`** — see below |
| Hue | `fill`, `stroke` | `scaleOrdinal(d3.schemeTableau10)` |
| Luminance / saturation | `fill` | `scaleSequential(d3.interpolateBlues)` |
| Tilt | `transform="rotate(…)"` | `scaleLinear` into degrees |
| Shape | `d` from `d3.symbol().type(…)` | `scaleOrdinal(d3.symbolsFill)` |
| Motion | `.transition()` | — |

> **The `r` trap.** A circle's *area* is πr², so mapping a value linearly to the radius makes a value twice as big look **four** times as big. Use `d3.scaleSqrt()` for radii so that area — which is what the eye judges — is proportional to the value.

---

## 3. Identity vs. magnitude channels

Our perceptual system has two fundamentally different modes:

| Channel type | Answers | Channels |
|---|---|---|
| **Identity** (*what / where*) | *What* is it? *Which* group? | Spatial region, **hue**, shape, motion |
| **Magnitude** (*how much*) | *How much* bigger, darker, longer? | Position, length, angle, area, depth, **luminance**, **saturation**, curvature, volume |

Asking "how much more circle is this triangle?" is meaningless — shape is identity. Asking "which line is this?" when all marks are lines is unproductive — length is magnitude.

This split is deliberately the same split as the attribute types in [Session 5 §3.4](session05-exploratory-visualizations.md): **categorical ↔ identity, ordered ↔ magnitude.**

---

## 4. Expressiveness and effectiveness

Two principles govern every channel choice:

- **Expressiveness** — the encoding should express *all of, and only,* the information in the attributes. Ordered data must look ordered, and **unordered data must not look ordered.** Munzner calls violating this *"a common beginner's mistake in vis."*
- **Effectiveness** — the *importance* of an attribute should match the *salience* of its channel. Your most important attribute gets your best channel.

### What each kind of attribute needs from its channel

From the slides — with ordering direction from Session 5 mapped onto channels:

| Attribute | The channel must… | Example |
|---|---|---|
| Ordered, **sequential** | Have a clear **low point** | Bar length from 0; a light → dark ramp |
| Ordered, **diverging** | Have a clear **centre point** | Blue → white → red; bars going left/right from an axis |
| Ordered, **cyclic** | Show that the **low and high ends are the same** | An angle around a full circle; a cyclic colour scale such as `d3.interpolateRainbow` or `d3.interpolateSinebow` |
| **Categorical** | Let you **identify** categories | Distinct hues, shapes, separate regions |

---

## 5. Channel rankings

Munzner's figure 5.6 — the core of the chapter and the figure on the slides — ranked from most to least effective:

| Rank | Magnitude channels → **ordered** attributes | Identity channels → **categorical** attributes |
|---|---|---|
| 1 | **Position on a common scale** | **Spatial region** |
| 2 | Position on unaligned scales | **Colour hue** |
| 3 | Length (1D size) | Motion |
| 4 | Tilt / angle | Shape |
| 5 | Area (2D size) | |
| 6 | Depth (3D position) | |
| 7 | Colour luminance ≈ colour saturation | |
| 8 | Curvature ≈ volume (3D size) | |

Things to take from it:

- **Spatial position tops both lists**, and it's the *only* channel on both. *"The choice of which attributes to encode with position is the most central choice in visual encoding"* — they dominate the reader's mental model.
- Using a magnitude channel for categories, or an identity channel for ordered data, breaks expressiveness however effective the channel is.
- **Hue is #2 for categorical data — and last for ordered data.** In Cleveland and McGill's ordering for magnitude, hue comes after everything else.
- **3D depth** is far down; the power of position is only true for the **2D plane** — see the rule below.

> **A note on slide 15.** It says hue is *"a channel of high effectiveness for sequential data."* That contradicts the book's ranking, chapter 10 (*"hue does not have an implicit perceptual ordering"*), and the slides' own expressiveness logic. Hue is highly effective for **categorical** data. For sequential data, use luminance or saturation, possibly *with* hue on top (§7.2). If this comes up at the exam, give the book's version and mention why.

### Rule: if 2D can solve it, don't use 3D

> **If a problem can be solved with a 2D visualization, don't make it 3D.**

Munzner calls this rule of thumb **"No Unjustified 3D"** (book §6.3). It's tempting to think that if two dimensions are good, three must be better. But the channel rankings above only reward **planar** (2D) position. Depth is a much weaker channel, and adding it costs you several things:

| Cost | What goes wrong |
|---|---|
| **The power of the plane is lost** | The top-ranked channels — aligned and unaligned position — only apply to positions *in the plane* |
| **Depth is perceived badly** | Stevens' exponent for depth is **n ≈ 0.67**, worse than area (0.7). We see in *"2.05D"* (Ware): plenty of information across the image plane, and only one point per line of sight in depth |
| **Occlusion hides information** | Marks in front hide marks behind. Finding them means rotating or navigating, which costs time and memory |
| **Perspective distortion** | Distant objects shrink and shift, so **position and size can't be compared** any more. Bars in a 3D bar chart are harder to compare than the same bars in aligned 2D charts |
| **Shading and shadows** | They add clutter, can be mistaken for marks, and interfere with colour: shadows change luminance, highlights change hue and saturation |
| **Tilted text is illegible** | Labels turned out of the screen plane become blocky and hard to read |

**When 3D *is* justified:** when the task genuinely is about **understanding the shape of something that is three-dimensional** — inherently spatial data such as a medical scan, the fluid flow around a wing, or a building. There, the benefit of a 3D view with interactive navigation outweighs the costs.

For **abstract data** — sales, ratings, counts, categories, everything in this course so far — there's practically always a 2D alternative: aligned bar charts, small multiples, a colour or size channel, or deriving a new attribute. Munzner points out that the right 2D encoding often follows from a *different data abstraction*. So: no 3D pie charts, no 3D bar charts, and no 3D effects just for decoration.

### The NBA uniforms discussion (slide 8)

The break exercise uses [pudding.cool/2024/10/nba-uniforms](https://pudding.cool/2024/10/nba-uniforms/) and asks you to **identify the marks, identify the channels, and rank those channels by effectiveness.** The method works on any chart:

1. List each **mark type** (point / line / area) and what one mark stands for.
2. For every channel, write *attribute → channel* and the **attribute type**.
3. Check **expressiveness**: is every channel the right *kind* for its attribute?
4. Look each channel up in the table and **rank** them.
5. Ask whether the *most important* attribute got the *top-ranked* channel.

---

## 6. Why the rankings look like that

Rankings are mainly about **accuracy**, also weighted by discriminability, separability, popout and grouping.

### 6.1 Accuracy

How close is perception to the true value? Stevens' **power law**: perceived sensation S = Iⁿ for physical intensity I.

- **Length**: n ≈ 1.0 — we perceive it almost exactly.
- **Area**: n ≈ 0.7 — *compressed*; we underestimate big areas.
- **Brightness**: n ≈ 0.5 — strongly compressed.
- **Red–grey saturation**: magnified.

Cleveland and McGill's experiments ranked: aligned position > unaligned position > length > angle ≫ area. Heer and Bostock replicated that by crowdsourcing; the only change was that length and angle came out roughly equal.

### 6.2 Discriminability

How many distinguishable steps — **bins** — does a channel have? Line width only manages a few before a line turns into an area. The rule is to **match the ranges**: the number of values to show must not exceed the number of bins. If it does, either aggregate the data into meaningful bins or switch channel.

| Channel | Approx. bins |
|---|---|
| Luminance | < 5; Ware: avoid greyscale if you need more than 2–4 on a non-uniform background |
| Saturation | ~3 |
| Hue, small separated regions | ~6–7 |
| Categorical colour overall | 6–12, *counting* the background and default colours |
| Curvature | 2–3 |
| Shape (10×10 px) | ~a dozen |
| Line width | Few — good for 3–4 values |

### 6.3 Separability

Channels used together range from fully **separable** to fully **integral**:

| Pair | Result |
|---|---|
| Position + hue | **Fully separable** — you can attend to either one |
| Size + hue | Some interference — hue is hard to see on small marks |
| Width + height | **Integral** — you see *area*, so you get three groups (small, flattened, large) instead of four |
| RGB red + green | **Major interference** — you just see four colours |

Neither end is "good" by itself. Use separable pairs for two attributes, and an integral pair only if the fused perception is what you want.

### 6.4 Popout

**Popout** (*preattentive processing*) is when one item jumps out of many immediately. The key property is that **finding it takes the same time with 15 distractors as with 50** — the low-level visual system is processing in parallel.

- Works for hue, shape, tilt, size, proximity, motion, even shadow direction.
- Strength depends on the difference: red against blue pops out faster than a circle against squares.
- **Combinations don't pop out.** A red circle among red squares *and* blue circles needs serial search, one item at a time. Space + colour and motion + shape are rare exceptions; three channels never pop out.
- **Rule: count on popout for one channel at a time.**
- Parallelism is a channel that does *not* pop out.

The slides' version: a few red elements in a field of green ones, or moving elements against static ones. *"This works immediately because of our tendency to see images as shapes and patterns"* — which is what leads to Gestalt (§10).

### 6.5 Grouping

How strongly different devices say "these belong together," strongest first:

1. **Containment** — an enclosing area.
2. **Connection** — a line between items.
3. **Proximity** — the same spatial region. This is why spatial region is the #1 categorical channel.
4. **Similarity** — the same hue, motion, or carefully chosen shape.

Shape needs care: a forward **C** vs. a backward **C** don't form groups, while circles vs. stars do.

### 6.6 Relative, not absolute, judgements

**Weber's Law:** the smallest difference we can detect is a fixed *percentage* of the magnitude, ΔI / I = K. We judge relatively.

- Two **unaligned, unframed** bars that differ by 15% are hard to compare. A **frame** fixes it: the *empty* parts of the frames differ by about 50%. **Aligning** the bars does the same. This is why aligned position beats length.
- Luminance is contextual: in the checkerboard illusion two identical greys look different because of their neighbours.
- Colour is contextual too: in the two-cube illusion "the same red" tiles are actually orange and purple.

---

## 7. Colour

### 7.1 How we see colour

- The retina has **rods** (low-light, black and white — ignore for vis) and **cones** in three types — **S**, **M**, **L** (short, medium, long wavelength) — each peaking at a different wavelength.
- The brain immediately recombines the cone signals into three **opponent channels**: **red–green**, **blue–yellow**, and **black–white (luminance)**.
- Luminance carries the **high-resolution edge information**. The two colour channels are lower resolution.

### 7.2 Colour spaces

| Space | What it is | Good for |
|---|---|---|
| **RGB** | *"A trick"* — it stimulates the cones at certain intensities and the brain assembles a colour | Computers. Its axes are **integral**, so don't encode separate data on R, G and B |
| **HSL / HSV** | Hue = *"what a child would call the colour"*; saturation = colour strength (0 = grey); value/lightness = brightness (0 = black) | Intuitive colour picking — but only **pseudo-perceptual** |
| **L\*a\*b\*** | One luminance axis L\* plus two colour axes, all designed to be perceptually linear | Interpolation and colour differences |

Equal HSL lightness does **not** look equally bright: six colours with identical L are visibly different. Our eyes are most sensitive in the middle of the spectrum (green–yellow). **Yellow** hits close to the peak of both the M and L cones, so we see it as very bright — it has **high luminance**. That's why yellow text on white is unreadable.

> **D3:** `d3.interpolateRgb` blends in RGB, which can produce muddy middles. `d3.interpolateLab` / `d3.interpolateHcl` interpolate in perceptual spaces. The ready-made `d3-scale-chromatic` ramps are already built carefully.

### 7.3 The three colour channels

| Channel | Type | Strengths | Limitations |
|---|---|---|---|
| **Luminance** | Magnitude | Perceived as ordered; the **only** channel that gives crisp edges and readable text | Few bins; "uses up" contrast you need for detail; poor across non-contiguous regions |
| **Saturation** | Magnitude | Perceived as ordered; works in colour **and** black-and-white | ~3 bins; weak on small marks |
| **Hue** | **Identity** | #2 channel for categories; great for grouping | **No perceptual order**; ~6–7 bins on small separated marks |

Three points that follow:

- **Text needs luminance contrast** — **10:1** is good, **3:1** the minimum (Ware). Hue contrast alone gives no edges.
- **Mark size decides saturation:** small marks (points, lines) need **bright, saturated** colours; large areas (backgrounds, map regions, streamgraph bands) need **pastels**.
- **Hue has no inherent order.** People always put grey between black and white, and pink between red and white, but nobody agrees on an order for red, blue, green and yellow. Conventions like traffic lights or the rainbow are *learned*, not perceived.

The slides' practical advice: luminance is *"hard to compute"*, so the easiest approach is to **keep one hue and vary value/lightness** — a single-hue ramp like `d3.interpolateBlues`.

### 7.4 Transparency

A fourth colour-related channel. It interacts strongly with the others, so **don't combine it with luminance or saturation coding.** It works with hue, using very few steps (usually two). Main use: separating a foreground layer from a background layer, often redundantly.

---

## 8. Colormaps

A **colormap** maps data values to colours. Its taxonomy mirrors the attribute types:

| Colormap | For | Built from | D3 examples |
|---|---|---|---|
| **Categorical** (qualitative) | Categorical data | Distinct hues, segmented | `schemeTableau10`, `schemeCategory10`, `schemeSet2` (pastel, for areas) |
| **Sequential** | Ordered, min → max | Luminance and/or saturation, maybe plus hue | `interpolateBlues`, `interpolateGreys`, `interpolateViridis` |
| **Diverging** | Ordered, around a meaningful midpoint | Two hues at the ends, neutral middle (white, grey, black or yellow) | `interpolateRdBu`, `interpolatePuOr` |
| **Cyclic** | Cyclic data | Ends meet | `interpolateRainbow`, `interpolateSinebow` |
| **Bivariate** | Two attributes at once | Hue × saturation | Safe only when one attribute is **binary** |

- **Continuous vs. segmented:** continuous for quantitative attributes (especially fields); segmented for categories. For ordinal data, segmented emphasises the *discreteness* and continuous the *order*.
- Two categorical attributes in one bivariate colormap gives poor results — don't.
- Good resource: **[ColorBrewer](https://colorbrewer2.org)**. Most of D3's named schemes come from it.

### 8.1 Too many categories

If you have more categories than discriminable hues (the 21-chromosome mouse genome example in the book), there are two good options:

1. **Reduce the bins deliberately** — derive meaningful groups (use a hierarchy if there is one), or keep the few most important categories and put the rest in **"Other"**.
2. **Use other channels** too: shape, size, glyphs, as well as colour.

Either is better than letting the reader's eye create its own uneven, meaningless bins.

### 8.2 The rainbow colormap

A rainbow is a default in a lot of software, but for ordered data it has **three problems**:

1. **Hue is used for order** — it's an identity channel with no perceptual order.
2. It's **not perceptually linear** — equal steps don't look equal. Some ranges show three colours, while an equally wide range is "all yellow".
3. **Fine detail is invisible** — hue gives no edges; luminance does.

**Fix:** a multi-hue colormap with **monotonically increasing luminance** — hues for nameable regions ("the dark blue sea, the green lowlands"), luminance for the order. `d3.interpolateViridis` is built this way.

Rainbows are **fine** as a **segmented** colormap for a *small* number of categories, and as a cyclic colormap.

> This is the theory behind [Session 3 §5.3](session03-manipulating-data.md)'s choice of Viridis for the ordinal age groups.

---

## 9. Colour blindness

### 9.1 Facts

- Caused by reduced or missing **L-, M- or S-cones**.
- **1 in 12 men (8%)** have red–green colour blindness; **1 in 200 women (0.5%)**. The slides add about 1 in 200 for other forms.
- Red–green is **on the X chromosome** (sex-linked), which is why men are affected far more. Tritanopia is very rare and not sex-linked.
- "Colour blind" is misleading; **colour deficiency** is more accurate, since most can still see colour. And *"red–green"* is misleading too: **every type affects the whole spectrum**, not only red and green (color-blindness.com).
- Pairs commonly confused (book): **red/green**, **red/black**, **blue/purple**, **light green/white**, **brown/green**.

### 9.2 Types (slide 17)

| Missing / weak cone | Partial | Full | Colloquial |
|---|---|---|---|
| None | Trichromatic | Trichromatic | Normal |
| **L** (long, red) | Protanomaly (red-weak) | Protanopia (red-blind) | Red/green colour blind |
| **M** (medium, green) | Deuteranomaly (green-weak) | Deuteranopia (green-blind) | Red/green colour blind |
| **S** (short, blue) | Tritanomaly (blue-weak) | Tritanopia (blue-blind) | Blue/yellow colour blind |
| L and S | — | Blue cone monochromacy | Completely colour blind |
| All | — | Monochromacy (achromatopsia) | Completely colour blind |

The slide example runs `d3.schemePaired` through Coblis and shows it four ways: normal, red-blind, green-blind and blue-blind. The scheme is six light/dark pairs — blue, green, red, orange, purple, and yellow/brown — so it relies on hue to separate the pairs. Hue is exactly what the deficiencies take away, while the light/dark luminance step inside each pair survives. See §12 for the same effect measured on a real palette.

### 9.3 How to deal with it

From the slides:
1. **Know the usage situation.**
2. **Think twice before using hue.**
3. **Don't use too many different colours.**
4. **Use a colour simulator** — [Coblis](https://www.color-blindness.com/coblis-color-blindness-simulator/): upload a screenshot and view it as protanopia, deuteranopia, tritanopia, etc.
5. **Preferably, test with colour-blind users.**

From the book:
- **Don't encode with hue alone** — vary **luminance or saturation** too, so categories differ in brightness as well as colour.
- **Avoid red–green diverging ramps.** Where red/green is a hard domain convention, make sure the red and the green differ in luminance.
- Encode **redundantly** — hue *plus* shape, a direct label, or position.

A quick self-check, from Munzner's chapter 6 rules of thumb: **"get it right in black and white."** If the chart still works in greyscale, it relies on luminance rather than hue alone — and that covers most colour deficiencies.

---

## 10. Other channels

| Channel | Type | Key facts |
|---|---|---|
| **Length** | Magnitude | Very accurate (n ≈ 1). Can't be used together with area to encode different things |
| **Area** | Magnitude | n ≈ 0.7 — middle of the ranking. Width + height fuse into one area perception |
| **Volume** | Magnitude | Bottom of the ranking — *"rarely the right choice"* |
| **Angle / tilt** | Magnitude | Above area. Accurate near 0°, 45° and 90° — you can tell 89° from 90° but not 37° from 38°. Sequential within one quadrant (90°), **diverging** over a half circle (180°), **cyclic** over a full circle with an arrow |
| **Curvature** | Magnitude | Line marks only; 2–3 bins |
| **Shape** | Identity | Point and line marks — on lines it becomes dashed/dotted patterns. Many bins when large, about a dozen at 10×10 px. Filled shapes carry hue better than thin crosses |
| **Motion** | Identity | Extremely salient and separable from static channels, *"nearly impossible to ignore."* Safest as **binary**: moving vs. still. Best for **temporary highlighting**, e.g. on hover |
| **Texture / stippling** | Combination | Orientation + scale + contrast. One or two dozen categories with care; dashed lines are stippling |

> Motion ties back to [Session 4](session04-interactivity.md): transitions grab attention because motion is so salient, which is also why the slides warn to *"beware of distracting the user."*

---

## 11. Gestalt principles

*Gestalt* (German for "form" or "shape"): *"an organized whole that is perceived as more than the sum of its parts."* Developed by German psychologists in the 1910s–1920s, the principles (also called the **laws of grouping**) describe how the brain organises what it sees into groups and patterns. The slides use them as the tool for designing **popout** and grouping deliberately.

| Principle | Meaning | In a visualization |
|---|---|---|
| **Similarity** | Elements that look alike are grouped. Odd ones out pop out | Same hue = same series; one highlighted bar in grey ones |
| **Continuity** | *"Eyes naturally follow smooth paths"* — objects on a smooth curve seem to belong together | Lines in a line chart; trend lines; aligned labels |
| **Proximity** | Things close together are seen as one group | Grouped bar charts; gaps between groups; legends next to what they explain |
| **Closure** | The brain *"connects the dots"* to complete shapes (the triangle that isn't there) | Charts that work without full borders; subtle grouping without drawn boxes |
| **Common fate** | Elements **moving together** are grouped — *stronger than similarity* (slides) | Animated transitions: items that move together read as one set |
| **Figure–ground** | We separate a focal *figure* from its *background* | Muted gridlines and backgrounds; strong data marks |
| **Symmetry & order** | Balanced, symmetrical elements feel cohesive | Centred streamgraphs; mirrored population pyramids |
| **Prägnanz** | We prefer the simplest, clearest interpretation | Remove clutter; prefer simple shapes and few colours |
| **Common region** | Elements inside a shared boundary or background are related | Shaded panels; a box around a legend; small-multiple frames |

**Bonus — connectedness** (slide 27): *"not really a Gestalt principle"*. We draw the connection ourselves with a line. *"Not terribly subtle, but works."*

### Gestalt ↔ Munzner

The two vocabularies describe the same thing:

| Munzner grouping (§6.5) | Gestalt principle |
|---|---|
| Containment | Common region, closure |
| Connection | Connectedness, continuity |
| Proximity / spatial region | Proximity |
| Similarity of identity channels | Similarity |
| Motion | Common fate |

---

## 12. Worked example: analysing a real chart

Running the analysis on your own **HandIn02 streamgraph** ([main.js](../HandIn02/js/main.js)) — the same steps Exercise 6.1 asks for.

**Marks**
- **Areas** — one `<path>` per love-song category, made with `d3.area()`.
- **Line** — the dashed vertical guide line on hover.

**Channels**

| Attribute | Type | Channel | Rank in its list |
|---|---|---|---|
| Year | Quantitative, sequential | Horizontal position (aligned) | 1 / magnitude |
| Number of songs | Quantitative, sequential | Vertical position — **aligned only for the bottom layer**, unaligned for every layer stacked on it | 1 for the bottom layer, **2** for the rest |
| Category | Categorical | Hue (`schemeTableau10` + one grey) | 2 / identity |
| Selected category | Categorical (interaction) | Filtering + an animated transition | Motion / common fate |

**Critique**
- ✅ **Expressive:** category → hue (identity), counts → position (magnitude).
- ⚠️ **Effectiveness:** only the bottom layer sits on a common baseline. That's the formal reason Session 3 said lookup is "harder" in stacked charts, and it's why the dropdown matters: isolating one category gives it an aligned baseline.
- ✅ **Discriminability:** 8 categories, within the 6–12 hue bins — but at the high end.
- ✅ **Figure–ground:** non-love songs are a neutral grey, so the love categories stand out.
- ❌ **Colour blindness — this one fails.** A simulation of the actual palette (Machado et al. colour-deficiency matrices, distances in CIELAB ΔE) shows:

  | Pair | Normal vision | Deuteranopia | Protanopia |
  |---|---|---|---|
  | *It's Complicated* (red `#e15759`) vs. *Pursuit* (green `#59a14f`) | ΔE 91 | **ΔE 0.9** — the same colour | ΔE 29 |
  | *Not a Love Song* (grey `#C1B9BA`) vs. *Love Song for the Self* (teal `#76b7b2`) | ΔE 27 | ΔE 10 | **ΔE 3.4** |

  A ΔE below ~10 is hard to tell apart on separated marks; under ~2 is essentially identical. They aren't adjacent in the stack, but the legend and the tooltip can't help a deuteranope tell which is which. Fixes: replace one of the pair with a hue that differs in **luminance** (e.g. a dark blue), or add direct labels on the bands as a redundant encoding — and confirm in Coblis.
- ⚠️ `curveBasis` smoothing trades the continuity principle (nice flowing bands) for exactness.

---

## 13. Exercises 6.1 – 6.3 (Exercises 6 document)

All three revisit **your design from last session** — the From-Data-to-Visualization sketch.

### 6.1 – Marks and Channels
- Which **marks** did you use?
- Which **channels**?
- Are the channels **suitable for the attribute types**? → expressiveness, §3–4.
- How **effective** are they? → ranking, §5.

### 6.2 – Use of colour
- Did you use colour? **Why or why not?**
- Pick something that *could* be shown with colour. **Which colour channel** — hue, saturation or luminance — and why? → §7.3.
- **Which colour scheme?** → §8. **Test it in Coblis** or a similar simulator. → §9.

### 6.3 – Redesign
Redesign using 6.1 and 6.2, fill in this schema, then swap with another group for **peer review**:

| Design element | Chosen element | Argumentation |
|---|---|---|
| **Marks** | | |
| **Channels** | | |
| **Gestalt principles** | | |

### A filled-in example

Using the film-or-digital design from [Session 5 §8](session05-exploratory-visualizations.md) — *"How has the share of digitally shot movies changed from 2006 to 2017?"*, drawn as a 100% stacked area chart:

| Design element | Chosen element | Argumentation |
|---|---|---|
| **Marks** | Area marks, one band per shooting medium (`D`, `F`, `D\|F`, `U`) | A share of a whole over time is a composition. Areas show that, and since the band shapes are fixed by the data they don't need size coding |
| **Channels** | **Year → horizontal position** (aligned). **Share → vertical position**, with **Digital as the bottom band** so the key series is aligned with 0%. **Medium → hue** | The most important attribute (digital share) gets the top-ranked channel, *aligned* position, by putting it at the baseline. Medium is categorical, so hue (identity channel #2) is expressive. Only 4 categories, well inside 6–12 hue bins |
| **Colours** | Digital and Film in a strongly different hue **and** luminance (dark blue vs. light orange); `D\|F` a mid tone; `U` neutral grey. Pastel versions, because they're large areas | Large regions → low saturation. Differing luminance survives deuteranopia and greyscale ("get it right in black and white"). No red/green pair. Checked in Coblis |
| **Gestalt principles** | **Similarity** (one hue per medium), **figure–ground** (grey "unknown" recedes), **continuity** (bands flow across years), **proximity** (labels placed directly on the bands instead of a separate legend) | Direct labels cut the eye's back-and-forth to a legend and are a redundant, colour-free encoding. The neutral unknown band keeps the focus on film vs. digital |

---

## 14. Checklist

Before implementing an encoding:

- [ ] Every **mark** named, and what one mark represents.
- [ ] Every attribute → channel pair written down, **with the attribute type**.
- [ ] **Expressive:** ordered → magnitude channel, categorical → identity channel.
- [ ] **Effective:** the most important attribute is on **aligned position**.
- [ ] **2D, not 3D** — 3D only if the task is understanding a genuinely 3D shape.
- [ ] Sequential has a low point, diverging a centre, cyclic a wrap-around.
- [ ] Number of values ≤ the channel's **bins** — otherwise aggregate or switch channel.
- [ ] Radii use `scaleSqrt`; bar lengths start at **0**.
- [ ] Hue only for categories; ordered colour varies **luminance**; no rainbow for ordered data.
- [ ] Saturated colours for small marks, pastels for large areas; text has ≥ 3:1 luminance contrast.
- [ ] **Coblis** check done; it still works in **black and white**.
- [ ] Popout relies on **one** channel.
- [ ] Gestalt principles used on purpose — proximity, similarity, common region, figure–ground.
