# VIZ1 – Session 8: Explanatory Approach

Slides: *VIZ1 (8) – Explanatory Approach* (Ole I Hougaard). Exercises: *VIZ1 Exercises 8*.
Book: Munzner, *Visualization Analysis & Design* — **chapter 13** (Reduce Items and Attributes) and **chapter 14** (Embed: Focus+Context), plus the *present* action from chapter 3 (see [Session 5](session05-exploratory-visualizations.md) §4.2).
Accessibility: the [W3C Web Accessibility Initiative](https://www.w3.org/WAI/), the [WAVE evaluation tool](https://wave.webaim.org/), and MDN's [Accessibility guides](https://developer.mozilla.org/en-US/docs/Web/Accessibility) and ARIA [roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles) / [attributes](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes) references.

**The one-sentence summary:** sessions 5–7 were about *finding* things in data; this one is about *telling* someone what you found. You start from a **statement**, check honestly that the data supports it, design the chart so the reader's eye travels from premise to conclusion (**visual hierarchy**), keep it simple by **reducing** and **embedding**, and make sure everyone can read it — including people using screen readers.

---

## 1. The explanatory approach

The **explanatory** approach — also called **expository**, the word used in [Session 5 §5](session05-exploratory-visualizations.md) — is about:
- **showing findings**,
- **illustrating concepts**,
- **visualizing conclusions**.

A good chart *"can be more convincing than words and tables"*. That's exactly why the slides add: **beware of manipulative visualizations.** A persuasive chart built on a cherry-picked selection, a truncated axis or a misleading encoding (Session 6) persuades just as well, and that's the risk.

In Munzner's terms (ch. 3), this is the **present** action. Something *already understood* is communicated to an audience. The knowledge comes first, often from an earlier *discover* session, and the visualization comes second.

---

## 2. Exploratory vs. explanatory

| | **Exploratory** | **Explanatory** |
|---|---|---|
| Created to… | **discover** patterns, trends, insights | **communicate** patterns, trends, insights |
| Begins with… | one or more **questions** | a **statement** |
| Character | Allows for **experimentation** | **Stays on message** |
| User interaction | Drill-down, grouping and filtering — the reader steers | Only to **get more details** or **move on to the next visualization** |

The practical consequence: in an explanatory chart, every interaction should either deepen the *same* message or advance to the *next* one. A filter that lets the reader wander off and find a different story belongs in an exploratory tool.

---

## 3. The visualization process

The slides give eight steps. Compare with Session 5's process, which starts from questions — this one starts from a **conclusion**:

| # | Step | Framework |
|---|---|---|
| 1 | **State a conclusion** about the data | |
| 2 | **Find the data that supports the conclusion** — *no cherry-picking; filter by relevance* | **What?** |
| 3 | **Determine action and target** | **Why?** |
| 4 | **Choose marks and channels**, and **arrange** according to Gestalt and visual hierarchy | **How?** |
| 5 | **Sketch** | |
| 6 | **Review** | |
| 7 | **Implement** | |

**Step 2 is where honesty lives.** "Filter by relevance" means you may leave out data that is *irrelevant* or *broken* — but not data that is *inconvenient*. Two working rules:
- If you filter, **say so** (a footnote, a subtitle: *"21 incomplete recipes excluded"*).
- If the data doesn't support the statement, **change the statement**, not the data. §9.3 shows a case where the process should stop right here.

---

## 4. Visual hierarchy

*"Part of gestalt psychology"*: visual hierarchy decides **what the reader notices first**, and how you **lead the reader from premise to conclusion**.

The tools, roughly in reading order:

| Tool | Job |
|---|---|
| **Header** | States the conclusion — the first thing read |
| **Sub-header** | Context: what is measured, where, when |
| **Reading order** | Top-left to bottom-right in Western reading; put the key item where the eye starts |
| **Colour** | One emphasis colour on the key item, everything else muted (popout and figure–ground from [Session 6](session06-effective-communication.md)) |
| **Legend** | Only what's needed to decode the chart |
| **Description** | Source, method, caveats — read last |

### The example on slide 6

The slide's example is a Datawrapper chart titled ***"Milk has higher environmental impact than vegan substitutes"***:
- **The title is the conclusion.** No need to work it out yourself.
- **Three small bar charts** sit side by side: carbon emissions, land use and water use for five milks.
- **Cow's milk is the only row in full colour, in bold, and first.** The four plant milks are greyed out. The eye goes straight to the focus, and the grey rows are the context that makes it meaningful.
- **Values are written on the bars**, so nobody needs an axis to read 3.2 vs 0.7.
- **The source line is last**, in small grey text.

Every tool in the table above is used, and the reader gets premise (five milks, three measures) → conclusion (cow's milk is worst on all three) in seconds.

---

## 5. Storytelling

### 5.1 Storytelling 101

- **Show; don't tell.** You may *tell* the reader the **premise** (the context), but you must ***show*** the **conclusion**. If the conclusion only appears in the text, the chart isn't doing its job.
- **Setup and payoff**, using visual hierarchy to guide the reading:
  - **Setup:** the facts that call out for a conclusion.
  - **Payoff:** the conclusion, which is either
    - **straight** — the expected conclusion, confirmed; or
    - a **twist** — a reversal of expectation.

Twists are memorable, but only use one if the data really reverses the expectation.

The slides point to an example of a full story: [How Music Entered the Digital Era](https://public.tableau.com/app/profile/alexander.vassilev/viz/HowMusicEnteredtheDigitalEra/Dashboard) (Tableau Public).

### 5.2 A sequence of visualizations

Slide 9 shows a long-form dashboard on the **UN Human Development Index**, an Iron Viz entry by Simon Beaumont. It's a model for telling a story across several charts:
- **Each section is headed by a question**, with the key word in bold capitals: *What is the Human Development Index?* → *How has it **CHANGED** in the 21st century?* → *How does it differ by geographical **REGION**?* → *Does **DEMOCRACY** influence it?*
- **Each section is setup text, then a chart, then the payoff in a few sentences.**
- **One colour scheme runs through all sections** — the four HDI quartiles — and is explained once. Later charts reuse it, so the reader never has to relearn the encoding.
- **A vertical line with section dots** shows the reading order down the page.
- **Interaction stays on message**: *"hover over each node to read more detail"*, *"highlight a region"* — getting more details, never wandering off.

---

## 6. Simplicity

**Don't hide information** — but **select, synthesize, emphasize.** The two techniques the slides give are **reduction** and **embedding**, which are Munzner's chapters 13 and 14.

### 6.1 Reduction (book ch. 13)

Munzner: reduction is one of five strategies for managing complexity, alongside deriving data, changing the view over time, faceting into several views, and embedding.

| | **Items** (rows) | **Attributes** (columns) |
|---|---|---|
| **Filter** — elements are simply removed | Show fewer rows: e.g. only recipes with complete data, only 2006–2017 | Show fewer columns: e.g. only the ingredients relevant to the claim |
| **Aggregate** — a new element stands in for many | **Grouping** items: regions, countries, continents (Session 3's `d3.rollup`) | **Derived attributes** combining several: e.g. BMI from height and weight, MAP from blood pressures. The extreme version is **dimensionality reduction**: *"preserve the meaningful structure of a dataset while using fewer attributes"* |

The trade-off between the two, from the book:
- **Filtering is easy to understand** — but people have an *"out of sight, out of mind"* mentality: they forget what was filtered out, *"even when their absence is the result of quite recent actions."* In an explanatory chart *you* did the filtering, so the reader can't even know — another reason to disclose it.
- **Aggregation is cognitively safer**, because the stand-in element represents the whole group — but it *"cannot convey all omitted information"*. An average can hide exactly the interesting signal; Anscombe's quartet is the classic example. The five basic aggregation operators are **average, minimum, maximum, count, sum**.

### 6.2 Embedding: focus + context (book ch. 14)

**Focus + context** shows details of a selected subset (the **focus**) *inside* the same view as an overview of the rest (the **context**). The goal is to avoid the disorientation of plain zooming: the context acts as *"recognizable landmarks"*, so the reader doesn't have to remember where they are.

The three design choices (the figure on slide 12):

| Choice | How | Example |
|---|---|---|
| **Elide** | Some items are hidden, others summarized, and only the focus is shown in detail | A tree where uninteresting branches collapse into a summary triangle |
| **Superimpose** | A local layer of focus detail on top of the context | A "magic lens" or magnifier moved over a chart |
| **Distort** | The context is compressed to make room for a magnified focus | Fisheye views |

The slides' everyday version is **list–detail**: the **list is the context**, the **detail is the focus**.
- **User-controlled** (the reader picks the focus) → mostly **exploratory**.
- **Pre-selected** (you pick it for them) → mostly **explanatory**.

The milk chart in §4 is pre-selected focus + context: cow's milk is the focus, and the greyed plant milks are the context it's judged against.

---

## 7. Clarity

The slides' four rules:

1. **State the main message clearly in the title.** A title like *"Recipe ingredients"* is a topic; *"Nearly every cookie recipe contains eggs"* is a message.
2. **Use labels** on axes, legends and data points.
3. **Emphasize** the important information (§4).
4. **Use data tables** as supplementary or alternative information. That helps careful readers *and* screen-reader users (§8.4).

---

## 8. Accessibility

General web accessibility applies to visualizations too. Most of it is *"beyond the scope of this course"*, so the slides point to the [W3C WAI](https://www.w3.org/WAI/), [WAVE](https://wave.webaim.org/) (it checks a page automatically) and the [MDN accessibility guides](https://developer.mozilla.org/en-US/docs/Web/Accessibility). The visualization-specific parts follow.

### 8.1 Dyslexia

Dyslexia is characterized by a **lack of phonological awareness** — difficulty identifying syllables, the sounds within syllables, and rhymes. For text in and around a chart:
- Use **words with fewer syllables**.
- Keep text **left-aligned**, with **clear spacing**.
- Consider **dyslexia-friendly fonts** (e.g. *OpenDyslexic*).
- **Avoid** underlining, *italics* and ALL CAPS.

The HDI example (§5.2) uses CAPS for emphasis in its headings; under these guidelines, bold alone would be the safer choice.

### 8.2 Vision

- **Colour blindness** — covered in [Session 6 §9](session06-effective-communication.md): don't rely on hue alone, and test in Coblis.
- **High contrast** for people with low vision. The widely used WCAG thresholds are **4.5:1** for normal text, **3:1** for large text, and **3:1** for graphical elements such as bars, lines and legend swatches against their background.
- Make sure the visualization **works with screen readers** (§8.3–8.5).

### 8.3 Accommodating screen readers

| **Do** | **Don't** |
|---|---|
| **Describe** the visualization (what it shows *and* the main finding) | Let the visualization **stand alone** with no data or text |
| Follow a **structured layout** — headings in order, logical reading order | Show details **only** in a tooltip activated by **hovering** |
| Use **titles and descriptions** | |
| Use **standard HTML widgets** where possible — `<select>`, `<input>`, `<button>` | |

A screen reader can't hover, and a keyboard user can't either. A hover-only tooltip makes its information unreachable for both. The fix is to also offer the same data another way: a data table, a description, or marks that can receive keyboard focus.

### 8.4 ARIA — Accessible Rich Internet Applications

**First rule:** standard widgets like `<input/>` are *already* accessible — **use them when you can**. ARIA *"might make them worse."* MDN calls this *"the first rule of ARIA"*: if a native HTML element has the semantics and behaviour you need, use it instead of re-purposing another element with ARIA.

ARIA adds two things to elements:
- **Roles** — what an element *is*. These are roles *"of screen elements, not people"*: `img`, `list`, `presentation`, `progressbar`, … ([full list](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles)).
- **Attributes** — relationships and states: e.g. `aria-labelledby` (*"my name is in that element"*) and `aria-flowto` (*"read that element next"*) ([full list](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes)).

### 8.5 ARIA in SVG — the slide's example explained

```html
<rect x="0" y="0" width="20" height="20"
  fill="#7fc97f" stroke="black" stroke-width="1"
  role="radio"
  aria-labelledby="AfricaDescription"
  id="region0"
  aria-flowto="region1">
    <title id="AfricaDescription">
        Africa
    </title>
</rect>
```

- `role="radio"` — tells assistive technology this square is a **radio button** (choose one region of several), not decoration.
- `<title id="AfricaDescription">` — an SVG `<title>` is the element's **text name**. Browsers also show it as a native hover tooltip.
- `aria-labelledby="AfricaDescription"` — points to that title, so the radio is announced as *"Africa"*.
- `aria-flowto="region1"` — suggests *"read region1 next"*. Per MDN it **does not change the tab order**, and it only works with assistive technology that supports it.

**A role is a promise.** According to MDN, an element with `role="radio"` must also:
- carry `aria-checked="true"` or `"false"`, updated by JavaScript;
- be focusable — `tabindex="0"`;
- support the keyboard — **Space** to check, **arrow keys** to move between radios;
- sit in a `role="radiogroup"`.

None of that comes for free on a `<rect>`. The slides' own first rule applies: if a real `<input type="radio">` (or the `<select>` HandIn02 already uses) can do the job, prefer it.

### 8.6 The minimum for a D3 chart

The simplest useful pattern: make the whole SVG **one image with a name and a description**, and put the details somewhere a screen reader can reach.

```js
const svg = d3.select('#viz').append('svg')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .attr('role', 'img')
  .attr('aria-labelledby', 'chart-title chart-desc');

svg.append('title').attr('id', 'chart-title')
  .text('Nearly every cookie recipe contains eggs');
svg.append('desc').attr('id', 'chart-desc')
  .text('Bar chart of the share of 209 chocolate chip cookie recipes containing each ingredient. ' +
        'Egg is the most common at 98%, ahead of flour at 92%.');

// a native tooltip per mark costs one line, and screen readers can read it too
bars.append('title').text(d => `${d.ingredient}: ${d.share}%`);
```

Then add an HTML **data table** below or beside the chart (visible, or as a "show data" toggle). That covers the *"don't let the visualization stand alone"* rule completely.

> In React ([Session 9](session09-visualization-architecture.md)) the same markup is written directly in JSX: `<svg role='img' aria-labelledby='chart-title chart-desc'>`. `role` and `aria-*` keep their hyphens there. Session 9 §10 also makes a tooltip keyboard-reachable with `tabIndex`, `onFocus` and the arrow keys.

---

## 9. Worked example: Exercise 8.1 — cookies

**Data:** [the-pudding/data/cookies](https://github.com/the-pudding/data/tree/master/cookies), `choc_chip_cookie_ingredients.csv`, from The Pudding's [Baking the Most Average Chocolate Chip Cookie](https://pudding.cool/2018/05/cookies).
- One row per **ingredient in a recipe**: `Ingredient`, `Text`, `Recipe_Index`, `Rating`, `Quantity`, `Unit`.
- All recipes are scaled to 48 cookies.
- The README says 211 recipes; the CSV contains **209** distinct `Recipe_Index` values.
- **Every recipe is a chocolate chip cookie recipe.** Keep that in mind for conclusion 3.
- The file isn't UTF-8 — load it with Latin-1, or some characters break.

**The derived attribute all three conclusions need:** the *share of recipes containing an ingredient*. Group by `Ingredient`, then count distinct `Recipe_Index` values in each group (Session 3's `d3.rollup`):

```js
const shares = d3.rollup(data,
  rows => new Set(rows.map(r => r.Recipe_Index)).size / recipeCount,
  d => d.Ingredient);
```

**Data quality — step 2 of the process:** some hand-collected recipes are clearly incomplete.
- **21** recipes list **no fat at all** (no butter, shortening, margarine or oil). 18 of them are hand-collected (`Misc_…`), and they average **6.7** ingredients against **9.5** overall.
- **13** recipes list **no chocolate**, again all hand-collected — in a chocolate *chip* cookie dataset.

Excluding incomplete recipes is a legitimate **filter by relevance**, *provided the chart says so*.

### 9.1 "Nearly every cookie recipe contains eggs" — straight payoff ✅

| Step | Decision |
|---|---|
| 1. Conclusion | *Nearly every cookie recipe contains eggs* |
| 2. Data | Egg is in **204 of 209 recipes (97.6%)**. Supported. And egg is the **most** common ingredient of all — ahead of vanilla (93.8%) and even **flour (92.3%)** |
| 3. Action / target | **Present** a conclusion · **summarize / compare** · target: an **extreme** (the top of a ranking) |
| 4. Marks & channels | Horizontal bar chart of the ~10 most common ingredients, **sorted**. Line marks; **length** = share (aligned position, the top channel); **egg in full colour, the rest grey** (popout, figure–ground); value labels on the bars |
| Hierarchy | Title = the conclusion. Sub-header: *"Share of 209 chocolate chip cookie recipes containing each ingredient."* Egg on top, where reading starts |
| Story | Setup: the familiar ingredients. Payoff: straight — egg tops the list; small bonus surprise: it beats flour |

Showing eggs *among* the other staples, not alone, is what makes the "nearly every" claim meaningful. That's context, not padding.

### 9.2 "Butter is a must in cookies" — a twist payoff ⚠️

| Step | Decision |
|---|---|
| 1. Conclusion | *Butter is a must in cookies* |
| 2. Data | Butter is in 159 of 209 recipes (76.1%). But 21 of the 50 butterless recipes list *no fat at all* (incomplete — see above). **Of the 188 recipes that list a fat, 159 use butter (84.6%)**; the other 29 use shortening, margarine or oil instead. *Most* recipes use butter, but **"a must" is too strong** |
| Honest restatement | ***"Butter dominates — but about 1 in 6 recipes use shortening, margarine or oil instead."*** |
| 3. Action / target | **Present** · **summarize** · target: a **distribution** — a part-to-whole of which fat is used |
| 4. Marks & channels | A **single 100% stacked bar** or a short sorted bar chart of fats. Butter in the emphasis colour, the alternatives in a second colour, so the "1 in 6" reads as one block. A pie is defensible for 2–4 parts (Session 7), but a bar is more accurate |
| Hierarchy | The title carries the twist. The sub-header discloses the filter: *"188 recipes that list a fat; 21 incomplete recipes excluded."* |
| Story | Setup: *butter is a must* (what the reader expects). Payoff: a **twist** — it isn't, for 1 in 6 |

### 9.3 "Chocolate chips are far less common than people think" — the process stops at step 2 ❌

| Reading of "common" | What the data says |
|---|---|
| *How many recipes contain chips* | **196 of 209 (93.8%)**, and the 13 without are incomplete records. Every recipe is a chocolate chip cookie recipe |
| *How much of the dough is chips* | Chips are the **second-largest ingredient by volume**: a median of **2.34 cups** per 48 cookies, after flour (3.33) and ahead of butter (1.26) and both sugars. Around a quarter of the measured volume |

Under either reading, **the data contradicts the statement.** Visualizing it anyway would mean cherry-picking — e.g. charting only the 13 chip-less records — which is exactly the manipulative visualization the slides warn about.

The right move is to **restate the conclusion so it matches the data**. Options this dataset genuinely supports:
- *"Chocolate chips are the second-biggest ingredient in a chocolate chip cookie"* — by volume, after flour.
- *"Semisweet is the default chip — but 1 in 5 recipes use another kind"* — 40 of the 196 recipes with chips use no semisweet: milk, bittersweet, dark or white chips instead.

A good exam answer: *the process includes a check, and this conclusion fails it.*

---

## 10. Exercise 8.2 — accessibility review

*"Choose one of your visualizations. What would you improve in terms of accessibility? Why?"*

Running the §8 rules against **[HandIn02](../../../Rasmus/HandIn02/js/main.js)** (the love-song streamgraph) as an example:

| Area | Current state | Improvement | Why |
|---|---|---|---|
| **Text alternative** | The page has a `<title>`, but the SVG has no `role`, `<title>` or `<desc>` | Add `role="img"`, `aria-labelledby`, a `<title>` and a `<desc>` stating the main finding (§8.6) | A screen reader currently announces nothing meaningful for the chart |
| **Tooltip** | Details appear **only on hover** (`mousemove`) | Add a data table (per year, per category), or make years keyboard-focusable | Hover-only details are a *Don't* (§8.3) — unreachable for keyboard and screen-reader users |
| **Controls** | Category: native `<select>` ✅. Years: the rSlider library | Keep the `<select>`. Check the slider with the keyboard and in WAVE; if it isn't accessible, add two native number inputs for the years | Standard widgets are accessible by default (§8.4) |
| **Colour** | Okabe–Ito palette, checked in a colour-blindness simulation ✅ | Add **direct labels** on the bands as a redundant encoding | Don't rely on hue alone (Session 6) |
| **Contrast** | Tooltip text on white is about 11.6:1 ✅. But **every band colour is below 3:1** against the page background (`#FDF9F5`): from 2.90:1 (Heartache) down to 1.17:1 (Good Riddance) | Give the areas a thin **darker outline** (e.g. a darker shade of the same hue), so each band's edge reaches 3:1 while the fill stays pastel. Direct labels and a data table also mean no information depends on telling the bands apart | Low-vision readers. This is a genuine tension: Session 6's *"pastels for large areas"* conflicts with WCAG's 3:1 for graphics, and an outline satisfies both |
| **Message** | The title is a statement ✅ — *"The Love Song isn't Dead, it's Evolving"* | Repeat the finding in the SVG `<desc>` | Show *and* tell (§5.1, §7) |
| **Dyslexia** | Body text is left-aligned ✅ | Avoid italics and caps in labels; keep sentences short | §8.1 |

---

## 11. Checklist

**Message**
- [ ] I start from a **statement**, and it's in the **title**.
- [ ] The data **supports** it — checked, not assumed. If not, I changed the statement.
- [ ] Any filtering is **relevant** and **disclosed**.
- [ ] Action and target named (present / summarize / compare …).
- [ ] Setup → payoff is clear; a twist only if the data really reverses the expectation.

**Design**
- [ ] Visual hierarchy: header → sub-header → emphasized mark → legend → description.
- [ ] One emphasis colour; context greyed out.
- [ ] Labels on axes and data points.
- [ ] Reduced: only the items and attributes the message needs; aggregates don't hide the signal.
- [ ] Interaction only gives details or moves to the next visualization.

**Accessibility**
- [ ] The SVG has `role="img"`, a `<title>` and a `<desc>` with the finding.
- [ ] A data table or text alternative exists; nothing is hover-only.
- [ ] Native HTML controls where possible; no ARIA role without its keyboard behaviour.
- [ ] Contrast ≥ 4.5:1 for text, ≥ 3:1 for large text and graphics; colour-blind tested.
- [ ] Short words, left-aligned text; no underline, italics or ALL CAPS for emphasis.
- [ ] Run [WAVE](https://wave.webaim.org/) on the page.
