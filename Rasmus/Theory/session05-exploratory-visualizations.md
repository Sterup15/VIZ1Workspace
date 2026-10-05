# VIZ1 – Session 5: Exploratory Visualizations

Slides: *VIZ1 (5) – Exploratory Visualizations* (Ole I Hougaard).
Book: Munzner, *Visualization Analysis & Design* — **chapter 2** (What: Data Abstraction), **chapter 3** (Why: Task Abstraction), **chapter 4** (Analysis: Four Levels for Validation).
Builds on the What/Why/How framework introduced in [Session 1](session01-introduction.md) and sketched in [Session 2](session02-visual-encodings.md); this session is the full version of the *What* and the *Why*.

**The one-sentence summary:** the previous sessions were about *how* to draw things; this one is about everything you are supposed to do **before** you draw. You describe what data you have (data abstraction), you work out what someone actually wants to find out (task abstraction), and only then do you pick a chart — and sessions 1–4 become the implementation step at the end.

---

## 1. The design process

The slides give four main steps:

1. **Explore dataset**
2. **Generate ideas**
3. **Select visualization type**
4. **Implement**

> **Always iterate over a design using outside feedback.** The steps are not a one-way pipeline — showing a sketch to somebody else is part of the process, which is why the workshop ends with groups swapping sketches.

Everything in sessions 1–4 lives in step 4. This session is steps 1–3.

---

## 2. The nested model: four levels of design (book ch. 4)

Munzner splits vis design into **four nested levels**. The output of each level is the input to the one below it:

| Level | What you decide | Identified or designed? |
|---|---|---|
| **Domain situation** | Who the users are, their domain, their questions, their data | *Identified* (by interview/observation/research) |
| **Data/task abstraction** | *What* data, translated out of domain language; *why* they want it | Task: *identified*. Data: **designed** |
| **Visual encoding / interaction idiom** | *How* it is shown and how the user manipulates it | **Designed** |
| **Algorithm** | How a computer computes that idiom efficiently | **Designed** |

The point of separating them is that you can check each one independently. The danger is that they are nested: **a wrong choice upstream cascades downstream.** Perfect idiom and algorithm work cannot save a wrong abstraction.

### Threats to validity

Each level fails in its own way. Munzner words the four threats from the user's point of view (*they* = target users, *you* = the designer):

| Level | Threat | Example validation |
|---|---|---|
| Domain situation | **Wrong problem** — "You misunderstood their needs" | Observe and interview target users; later, observe adoption rates |
| Data/task abstraction | **Wrong abstraction** — "You're showing them the wrong thing" | Test on target users, collect anecdotal evidence of utility; field study of a deployed system |
| Encoding/interaction idiom | **Wrong idiom** — "The way you show it doesn't work" | Justify the encoding against perceptual principles; lab study measuring time/errors |
| Algorithm | **Wrong algorithm** — "Your code is too slow" | Complexity analysis; measure system time/memory |

Note that most validation for the **outer** levels is *downstream*: you cannot test whether the abstraction was right until you have actually built something. That is exactly why the cheap upstream checks — interviewing, and swapping sketches with another group — are worth doing first.

### Angles of attack

- **Problem-driven** (top-down): start at the domain situation and work down. Known in the literature as a *design study*. Often solvable with existing idioms, and **most of the challenge is at the abstraction level**.
- **Technique-driven** (bottom-up): start at the idiom or algorithm level, inventing something new, then work *upward* to articulate which abstraction it serves.

> **The pitfall this session exists to prevent:** skipping the domain level entirely, assuming the first abstraction that comes to mind is correct, and jumping straight into chart design. Munzner is blunt that *"the abstraction stage is often the hardest to get right."*

---

## 3. The "What": data abstraction (book ch. 2)

### 3.1 Semantics is not the same as type

Two crosscutting pieces of information are needed before data means anything:

- **Semantics** — its real-world meaning. Is this word a person's first name, a company, a city, a fruit?
- **Type** — its structural/mathematical interpretation. Is it an item, a link, an attribute? Can you do arithmetic on it?

Munzner's two examples make the point that raw values are not self-describing:

```
14, 2.6, 30, 30, 15, 100001
```
Two points in 3D space? Or two 2D points, with 15 links between them, and a link weight of 100001?

```
Basil, 7, S, Pear
```
A produce shipment on the 7th? A neighbourhood that got 7 inches of snow cleared? A lab rat named Basil on his seventh run through the maze, lured by a pear?

The type matters because it decides which operations are meaningful: a number that counts boxes of detergent can be added; a number that is a **postal code** cannot, even though both are numbers.

### 3.2 The five data types

| Data type | What it is |
|---|---|
| **Items** | An individual discrete entity — a row in a table, a node in a network (people, stocks, genes, cities) |
| **Attributes** | A property that can be measured, observed or logged (salary, price, temperature) |
| **Links** | A relationship between two items, typically in a network |
| **Positions** | Spatial data — a location in 2D or 3D space (latitude/longitude, a point in a scanner's volume) |
| **Grids** | The sampling strategy for continuous data — the geometric and topological relationship between cells |

> *Synonyms worth knowing:* an attribute is also called a **variable** or a **data dimension**. A network node is a **vertex**; a link is an **edge**.

### 3.3 The four dataset types

A **dataset** is any collection of information that is the target of analysis. The four basic types are built out of combinations of the five data types above:

| Dataset type | Built from | Structure |
|---|---|---|
| **Tables** | Items + attributes | Rows are items, columns are attributes, each cell holds a value for that pair. A **multidimensional table** needs several keys to address a cell |
| **Networks & trees** | Items (nodes) + links + attributes | Nodes connected by links; both can carry attributes. A **tree** is a network with hierarchical structure and no cycles — each child has exactly one parent |
| **Fields** | Grids + positions + attributes | Cells sampled from a **continuous** domain — conceptually infinitely many values, so you must think about sampling and interpolation |
| **Geometry** | Items + positions | Shape information only. Notably, geometry **need not have attributes at all** |

Other ways of grouping items: a **set** (unordered), a **list** (ordered), a **cluster** (grouped by attribute similarity).

> **Why the table/field split matters so much:** historically the whole field divided along it. *Scientific visualization* (scivis) handles data where spatial position is **given**; *information visualization* (infovis) handles data where the designer **chooses** how to use space. Everything in this course so far has been infovis.

### 3.4 Attribute types

The major distinction is **categorical vs. ordered**, with ordered splitting again:

| Attribute type | Properties | Examples |
|---|---|---|
| **Categorical** (= nominal) | No implicit ordering; only same-or-different | Favourite fruit, movie genre, file type, city name |
| **Ordinal** | Ordered, but no meaningful arithmetic | Shirt size (large − medium is meaningless, but medium is between small and large), rankings, top-ten lists |
| **Quantitative** | A magnitude supporting arithmetic | Height, weight, temperature, stock price, 68 in − 42 in = 26 in |

Any external ordering *can* be imposed on categorical data (fruit by name, or by price) — but only if that extra information is available, and the ordering is not implicit in the attribute itself.

The slides present the same idea as a 2×2 — **discrete vs. continuous** crossed with **ordered vs. unordered**. Categorical data is discrete and unordered; ordinal is discrete and ordered; quantitative is continuous and ordered.

### 3.5 Ordering direction

For ordered data, *which way* does it run?

| Direction | Meaning | Example |
|---|---|---|
| **Sequential** | A homogeneous range from a minimum up to a maximum | Mountain heights measured from sea level up to Everest |
| **Diverging** | Two sequences running in opposite directions from a shared midpoint | A full elevation dataset: mountains up, undersea valleys down, meeting at sea level |
| **Cyclic** | Values wrap back round to the start | Hour of the day, day of the week, month of the year |

This is the attribute property that decides your colour scale — `scaleSequential` vs. `scaleDiverging` from [Session 2](session02-visual-encodings.md) map directly onto the first two.

### 3.6 Key vs. value semantics

- A **key** attribute acts as an index used to look up **value** attributes.
- A simple **flat table** has one key. It may be **implicit** (just the row number) or **explicit** (a column with no duplicate values).
- Keys may be categorical or ordinal; **quantitative attributes are usually unsuitable as keys**, since nothing stops two items sharing a value.
- A **multidimensional table** needs several keys, and the *combination* must be unique even if each individual key has duplicates (e.g. gene × time → activity level).

> Munzner's warning: *which* attributes are keys and which are values is often **not given to you** — working it out can be the goal of the analysis rather than its starting point. A successful outcome may be recasting a flat table into a meaningful multidimensional one.
>
> *Synonyms:* key = **independent** attribute = *dimension*; value = **dependent** attribute = *measure*.

### 3.7 Dataset availability

Crosscuts every dataset type:

- **Static** — the whole dataset is available at once, as a file. This is the default assumption.
- **Dynamic** — a stream that trickles in during the session; items get added or deleted, or values change.

### 3.8 Temporal semantics

Time is awkward because its hierarchy is deeply multiscale (nanoseconds → hours → decades) and does not nest cleanly — weeks do not fit into months. Two distinct things get called "dynamic", and it is worth keeping them apart:

- **Time-varying** semantics: time is a **key**. Example: a sensor network logging each animal's location every second.
- A temporal **value**: time is just an attribute. Example: a year of horse races with a start time and a run duration per horse — temporal data, but *not* time-varying.

A **time-series** is the common case: a table whose key is time, giving an ordered sequence of time–value pairs.

> And one important point for this course: *even when the data changes over time, showing it as an animation is only one option among many.*

---

## 4. The "Why": task abstraction (book ch. 3)

### 4.1 Why bother abstracting?

Because domain language hides similarities. Munzner's example — an epidemiologist says:

> *"contrast the prognosis of patients who were intubated in the ICU more than one month after exposure to patients hospitalized within the first week"*

and an immunologist says:

> *"see if the results for the tissue samples treated with LL-37 match up with the ones without the peptide"*

"Contrast" versus "match up", completely different vocabulary — but translated into generic terms both are **"compare values between two groups."** Same task, so the same idioms are candidates for both.

A second reason: **the task abstraction should guide the data abstraction.** Knowing what someone wants to find out tells you what to derive (see §4.4).

### 4.2 Actions — three independent levels

The three levels are independent, and it is usually useful to describe your task at **all three**.

**High level — Analyze**

| | Action | Meaning |
|---|---|---|
| *Consume* | **Discover** | Find new knowledge — generate a hypothesis, or verify/disconfirm an existing one |
| | **Present** | Communicate something **already understood** to an audience |
| | **Enjoy** | Casual encounters driven by curiosity rather than a pressing need |
| *Produce* | **Annotate** | Add graphical/textual annotation to existing elements (effectively a new attribute) |
| | **Record** | Save persistent artifacts — screenshots, bookmarks, parameter settings, a graphical history |
| | **Derive** | Produce new data from existing data (see §4.4) |

> The *Name Voyager* is the classic cautionary tale about designer intent: it was built for expectant parents choosing a baby name, and was then used mostly by people with no interest in having children, who analysed historical trends for their own **enjoyment**.

**Mid level — Search**, classified by whether you know *what* you are looking for and *where* it is:

| | **Target known** | **Target unknown** |
|---|---|---|
| **Location known** | **Lookup** | **Browse** |
| **Location unknown** | **Locate** | **Explore** |

**Low level — Query**, by how many targets are in scope:

| Query | Scope |
|---|---|
| **Identify** | One target |
| **Compare** | Some targets |
| **Summarize** | All targets (synonym: **overview**) |

So a full action description stacks all three — e.g. *"discover / explore / summarize"* or *"present / lookup / identify"*.

### 4.3 Targets

Actions are verbs; **targets are nouns** — the aspect of the data that is of interest.

| Scope | Targets |
|---|---|
| **All data** | **Trends** (a pattern: increase, decrease, peak, trough, plateau), **outliers** (what doesn't fit the trend), **features** (any task-dependent structure of interest) |
| **One attribute** | A single **value**; the **extremes** (min/max); the **distribution** of all values |
| **Multiple attributes** | **Dependency** (values of one directly depend on another), **correlation** (a tendency for one to be tied to the other), **similarity** (a computed measure letting attributes be ranked by how alike they are) |
| **Network data** | **Topology** (the structure of the interconnections), **paths** |
| **Spatial data** | **Shape** |

### 4.4 Derive — don't just draw what you were given

> *"Don't just draw what you're given; decide what the right thing to show is, create it with a series of transformations from the original dataset, and draw that!"*

Deriving is what makes the data abstraction an **active design choice** rather than something dictated by the user's file. Three flavours:

1. **Change of type.** A quantitative temperature becomes ordered (hot/warm/cold) for choosing a shower setting, or binary categorical (burned / not burned) for making toast. Detail is deliberately aggregated away.
2. **Requiring outside information.** A categorical city name becomes two quantitative attributes (latitude, longitude) via a lookup in an external database.
3. **Arithmetic/statistical combination.** Given `imports` and `exports`, derive `trade balance = exports − imports`. If the task is about the *difference*, plotting the derived attribute directly is better, because the user judges position against a common baseline instead of comparing the gap between two curves by eye.

A dataset can also be transformed into a **different dataset type** — e.g. a table of 6000 genes × 18 experimental conditions became a *network* by first deriving a pairwise similarity attribute and then creating links only for the top 20 similarity scores.

> This is the theory behind the practice in [Session 3](session03-manipulating-data.md): `d3.rollup` is a derive step, and so was the `flatMap` reshaping in Session 1's exercise 1.3.

---

## 5. Exploratory vs. expository visualization

| | **Exploratory** | **Expository** |
|---|---|---|
| Shape | Open-ended | Closed-ended |
| Purpose | Facilitates the user in drawing **their own** conclusions about the data | Communicates a **message** about the data |
| Outcome | Leads to further questions | Presents evidence for a given conclusion |
| Actions | Discover, lookup, browse, explore, compare | Present, summarize, compare |

### The classification exercise from the slides

For the "hipster summer reading" dataset:

| Question | Which? | Why |
|---|---|---|
| *"Which books are the most obscure and still highly rated on Goodreads?"* | **Exploratory** | Open-ended search for items matching a characteristic; the answer isn't known in advance |
| *"Why are the highly rated books often not the ones most frequently borrowed?"* | **Expository** | The "why" presupposes the pattern as an established finding — you are now presenting evidence for it |
| *"How does the number of borrows relate to a book's Goodreads score?"* | **Exploratory** | Asks about a relationship without asserting one |

A useful tell: if the question **asserts** the finding and asks you to explain or support it, it is expository. If it asks *whether* and *what*, it is exploratory.

---

## 6. From data to questions

> Jumping straight from data to visualization misses **the point of the visualization** and many ideas that could have been explored.

So before choosing a chart, generate questions the data could answer. The slides give keywords to drive this:

**Comparison · Distribution · Composition · Trend · Relationship · Ranking · Change · Outliers · Clusters**

The workshop target is ambitious on purpose: **you should be able to generate 15 questions** from a dataset. Treat the keyword list as a checklist and force at least one question per keyword.

---

## 7. From questions to tasks

Questions depend on the **domain**, the **form of expression**, and the **concrete data**. Tasks are the generic forms we can actually design against. All three of these:

- *Which music format generates the most revenue?*
- *What books are borrowed the most?*
- *Which country has the largest CO₂ footprint?*

…are the same task: **compare features**.

### Search tasks and the charts that serve them

| Task | Description | Hipster Books example | Possible visualizations |
|---|---|---|---|
| **Lookup** | Find the value of a specific item that is already known | What is the average rating of *The Goldfinch*? | Table, tooltip, annotated bar chart |
| **Locate** | Find one or more items satisfying known criteria | Find books with a rating above 4.5 | Scatter plot, sortable table, filtered bar chart |
| **Browse** | Examine a subset without knowing the exact target | Browse all Fantasy books to see if anything stands out | Interactive table, treemap, sortable bar chart |
| **Explore** | Search openly to discover patterns or hypotheses | Is there a relationship between book length, ratings and borrow count? | Scatter plot, dashboard |

### Query tasks and the charts that serve them

| Task | Description | Hipster Books example | Possible visualizations |
|---|---|---|---|
| **Identify** | Determine properties or membership of an item | Which books belong to the Science Fiction genre? | Coloured bar chart, treemap, highlighted table |
| **Compare** | Compare values between two or more items | Which genre has the highest average rating? | Bar chart, scatter plot |
| **Summarize** | Describe overall characteristics of a dataset or subset | How are book ratings distributed? | Histogram, heatmap |

---

## 8. Guide: how to run the "From Data to Visualization" analysis

This is the procedure from the uploaded exercise document, with a worked example at each step. The dataset it names:

**<https://github.com/the-pudding/data/tree/master/filmordigital>** — The Pudding's data on whether movies were shot on film or digitally.

The timings in brackets are the ones given in the exercise.

### Step 1 — Explore the dataset and generate ideas *(15 min)*

Browse the data, identify the available variables, and **write down observations**. Concretely: fill in the §3 vocabulary.

**Worked example** — `top_movies_data.csv` (1195 rows; the top ~100 US box-office movies per year, 2006–2017):

| Column | Data/attribute type | Notes |
|---|---|---|
| `id` | Categorical — **the key** | Unique for all 1195 rows |
| `title` | Categorical | Also unique here, but don't rely on titles as keys in general |
| `production_year` | **Ordered, quantitative, sequential** | 2006–2017; a natural second key for a multidimensional reading |
| `directors` | Categorical, **multi-valued** | Pipe-separated |
| `genres` | Categorical, **multi-valued** | Pipe-separated; 1114 of 1195 rows have more than one |
| `camera_format` | Categorical, multi-valued | Camera + lens strings from IMDb |
| `negative_format` | Categorical, multi-valued | e.g. `35 mm` (481), `Codex` (121), `Digital` (102) |
| `budget` | Ordered, quantitative, sequential | US$, nominal, **not** inflation-adjusted |
| `budget_source` | Categorical | `the-numbers` (1145), `imdb` (49), `wikipedia` (1) — provenance, not subject matter |
| `film_type` | Categorical | `D` digital (521), `F` film (507), `D|F` both (111), `U` unknown (54), `F|U` (2) |

**Data abstraction, written out:**
- **Dataset type:** a flat **table**, available as a **static** file.
- **Items:** movies. **Key:** `id` (explicit). **Values:** everything else.
- Could be read as a **multidimensional table** keyed by `production_year` × movie.
- **No links, no positions, no grids** — so this is not a network, field or geometry dataset.

**Observations worth writing down** (this is the step people skip):
- `film_type` is **not binary** — `D|F` and `U` exist, so any "film vs. digital" chart needs an explicit decision about what to do with 167 rows.
- `budget` has a minimum of **0**, which is a missing-value placeholder, not a real budget.
- "Top 100 per year" is approximate: years hold 98–102 rows. Counts per year are *not* directly comparable without normalising.
- `genres` and `camera_format` are many-to-many relations flattened into strings. To chart by genre you must **derive** a tidy table first (§4.4) — exactly the `flatMap` move from Session 1's exercise 1.3.
- Budgets are nominal, so comparing 2006 to 2017 money is comparing different things.

### Step 2 — Generate questions *(~10, aim for 15)*

Walk the keyword list from §6. Worked examples on this dataset:

| Keyword | Question |
|---|---|
| Trend | How has the share of digitally shot movies changed from 2006 to 2017? |
| Change | In which year did digital overtake film? |
| Comparison | Do big-budget movies stay on film longer than cheap ones? |
| Distribution | How are budgets distributed, and is the distribution different for film and digital? |
| Composition | What share of each year's top 100 is film / digital / both / unknown? |
| Relationship | Is there a relationship between budget and shooting medium? |
| Ranking | Which negative formats are the most used overall? |
| Outliers | Which movies were still shot on film after 2015? |
| Clusters | Do directors cluster into film loyalists and digital adopters? |
| Comparison | Which genres switched to digital earliest? |

### Step 3 — Choose the analytical task *(10 min)*

Pick the question you want to answer, then translate it into the generic vocabulary from §4.2–4.3: one **search** task, one **query** task, and a **target**.

**Worked example.** Question: *"How has the share of digitally shot movies changed from 2006 to 2017?"*

| Part of the abstraction | Choice |
|---|---|
| **Analyze** | Discover (exploratory — we don't know the answer yet) |
| **Search** | **Explore** — no specific target, no specific location; start from an overview |
| **Query** | **Summarize** — all years are in scope |
| **Target** | A **trend** over an ordered key, on a **derived** attribute |
| **Derive** | Per year, the *proportion* of digital — not the raw count, because the rows per year vary |

A second one, deliberately different. Question: *"Which movies were still shot on film after 2015?"*

| Part | Choice |
|---|---|
| **Search** | **Locate** — criteria are known (`film_type = F`, year > 2015), location is not |
| **Query** | **Identify** | 
| **Target** | **Outliers** |

### Step 4 — Select a visualization *(15 min)*

Use the tables in §7 to narrow candidates, then check the encoding against the attribute types from §3.4–3.5.

**Worked example** for the trend question:
- Ordered key (year) + quantitative value (share) + composition that sums to 100% → a **stacked area chart** or **100% stacked bar chart**.
- Since the question is about *composition over time*, the streamgraph machinery from [Session 3](session03-manipulating-data.md) applies directly — but with a **sequential**, non-centred baseline, because the reader needs to compare against 0% and 100%.
- Colour encodes `film_type`, which is **categorical** → a categorical palette, with a neutral grey for `U`/unknown.

For the outlier question, "locate + identify" points instead at a **filtered, sortable table** or an **annotated scatter plot** (year × budget, highlighting `F`) — not a stacked area chart. *Same dataset, different task, different chart.* That is the whole lesson.

> **Sanity check with the real numbers.** Digital's share of the film-or-digital movies in this data runs 17% (2006) → 25% (2010) → **56% (2012, the crossover)** → 92% (2017). If your sketch couldn't show that, it doesn't answer the question.

### Step 5 — Sketch it

The exercise requires each sketch to include **five things**:

1. The **question**
2. The **search task** (lookup / locate / browse / explore)
3. The **query task** (identify / compare / summarize)
4. The selected **visualization type**
5. A **hand-drawn sketch**

A fill-in template:

```
Question:       ________________________________________
Search task:    ________________   Query task: ___________
Target:         ________________________________________
Derived data:   ________________________________________
Visualization:  ________________________________________
Encodings:      x = ________  y = ________  colour = ________
                size = ________  (attribute type for each!)
[ sketch ]
```

### Step 6 — Swap and critique

Exchange sketches with another group and discuss the three questions from the exercise:

1. **Does the visualization answer the question?**
2. **Does the chosen chart fit the analytical task?**
3. **Can you suggest an alternative visualization?**

This is the cheap upstream validation from §2 — catching a *wrong abstraction* on paper, before any D3 gets written.

---

## 9. Checklist

Before implementing anything:

- [ ] **Dataset type** named — table / network / field / geometry (+ static or dynamic)
- [ ] **Data types** named — items, attributes, links, positions, grids
- [ ] **Keys and values** separated
- [ ] Every attribute typed — categorical / ordinal / quantitative
- [ ] Ordering direction noted for ordered attributes — sequential / diverging / cyclic
- [ ] Observations and **data quality problems** written down
- [ ] At least 10 questions generated, using the keyword list
- [ ] Question chosen and translated into **action (analyze / search / query) + target**
- [ ] Decided what to **derive** rather than drawing the raw data
- [ ] Exploratory or expository decided
- [ ] Chart chosen **from the task**, not from habit
- [ ] Sketch shown to somebody else

## Workshop summary

| Workshop | Activity |
|---|---|
| **(1) Data exploration** | In groups, find the datasets on itslearning. Determine the dataset type, the data types, the attribute types (including keys and values) and the ordering directions. Compare with another group. |
| **(2) Generate questions** | Each group picks 1 of the 3 datasets and generates as many exploratory questions as possible — 15 should be achievable. Groups with the same dataset compare and discuss. |
| **(3) From data to visualization** | Same groups, following the procedure in §8 on the film-or-digital dataset, ending in sketches that get swapped and critiqued. |
