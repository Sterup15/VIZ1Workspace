# Handin 3: implementation plan

## Separate alternative: five comparison wheels

**Added for comparison, not as a replacement.** Open [comparison.html](comparison.html) beside the unchanged [original plot](index.html). The original application files and the Word reflection were not changed for this alternative. Both pages read the same CSV and reuse the original parsing, grouping and matching-pair summaries. All work stays in Marcus/Handin03.

### What this version makes easier to see

The original puts individual band positions first. The alternative puts **comparison between size groups and between garments** first: five equally sized wheels, each showing bottoms and shirts simultaneously. Individual bands remain selectable rather than disappearing into an average.

The centre means for the supplied data are:

| Band size | Bands | Bottoms | Shirts |
|---|---:|---:|---:|
| 3 | 12 | 66.7% | 41.7% |
| 4 | 21 | 80.2% | 58.7% |
| 5 | 19 | 73.2% | 50% |
| 6 | 2 | 100% | 56.7% |
| 7 | 1 | 19% | 19% |

Among the common 3/4/5-member groups, the four-member group has the highest mean for both garments. The page derives this reading cue from the values rather than displaying it regardless of data. It is a descriptive pattern, not proof that group size causes coordination. The 6/7-member results have only two bands and one band.

### Marks, channels and interaction

| Data / task | Encoding | Reason and limitation |
|---|---|---|
| Band-size group | Separate, labelled wheels in ascending spatial order | Small multiples make groups easy to locate; equal wheel size is not equal sample size |
| Individual band's score | Filled angular fraction within its equal-width band slot | 0% fills none, 100% fills the whole slot; inspect fractions, not absolute lengths across wheels |
| Garment | Outer/inner track position, redundant blue/orange hue and text | Both attributes appear together, with aligned band slots and no garment toggle |
| Group mean | Exact centre values | Arithmetic mean over available band scores; each band gets equal weight, not each known pair |
| Individual evidence | Selectable aligned slot, outline, native selector and member table | Both scores and their actual pair counts can be checked against the same member records |

Slots run alphabetically clockwise from the top within each wheel. Their total spans a full turn. The filled fraction uses the original matching-pair definition, not the proportion of members in the modal category. Fewer than two known colours gives a hatched unavailable track and is excluded from that garment's average; an incomplete but computable band remains in the mean and is flagged.

Three deliberate encodings remain even without pins: ordered group region, within-slot score angle and garment track position (plus redundant garment hue). The arcs organize individual bands and encode their scores; they are not decorative. The visible reading guide explains the tracks and fractions; the method disclosure explains equal weighting, missingness and the cost of radial comparison.

This is a trade-off, not a universal improvement: group averages are easier to compare and both garments are visible, but within-group spread is less directly readable than the original radial point positions. A curved fraction is harder to estimate than an aligned position, and the mean can hide different score distributions. Preserve the original while obtaining genuine reader feedback.

### Verification and next decision

- Node: **70/70 model tests** (54 original tests plus 16 new wheel tests). The new tests verify exact means, equal weighting versus pooling, missing/unavailable scores, full-circle slots, fill fractions and preservation of the original model.
- Original browser suite: **27/27 passed**. New wheel browser page: **33/33 passed**, comprising the 16 wheel model tests and 17 UI tests.
- The UI checks cover exact selected-band scores, both garments, incomplete evidence, keyboard/tooltip/clear behaviour, repeated selections, 1440/1200/1024/960/959/768/500/390 widths, 200% CSS magnification, contrast, malformed data, HTTP/library failures, invalid selection and literal display of CSV text.
- The new page requests only local assets. A browser-generated Enter key selected Shai and exposed 33.3% bottoms versus 0% shirts with visible focus and no captured console errors.
- These are implementation checks, not peer feedback or proof of universal accessibility. Native zoom, screen-reader/user testing and other browser engines remain manual checks.

Compare the two versions with a real reader before selecting the hand-in design. The original Word reflection remains current for the original only; revise it if choosing the alternative. Hand-in 3 still requires one justified visualization, not submission of both experiments.

## Current implementation record: full-circle redesign

**Implemented and checked on 6 November 2026.** The full-circle redesign is now the working version in [index.html](index.html), replacing the earlier 300-degree implementation. All changes remain inside Marcus/Handin03; the dataset and original Word brief/backups are unchanged.

- Contiguous 360-degree arcs, five stable group colours, fixed angular slots, fixed-size dots and a linear radial score. Three percentage guides replace the five decimal ticks. The zero label is offset from the top boundary to avoid the BBMak zero-score hit target and the inner group arc.
- Two native selectors plus a five-group focus key and All. Group emphasis keeps every scored band in view. Selecting a muted band moves group focus; All preserves garment/selection; Clear selection preserves garment/group focus and returns focus to the selector.
- No initial explanatory panel, large clothing legend or permanent stems. Following the user's layout revision, the circle stays on the left and selected-band evidence appears on the right at widths of 1160px and above; narrower screens stack the evidence below. The chart does not move when details open. Method and category summary use native disclosures. Actual clothing swatches are confined to member evidence.
- **54/54 model tests passed in Node and the browser; 27/27 browser tests passed after the layout update.** The preceding full-circle revision also passed the model and 26 browser tests in a fresh standalone copy, with all runtime requests confined to its own delivery directory.
- The browser suite checks actual full-circle geometry, colour consistency, percentage formatting, label/hit-target collisions for both garments, contrast thresholds, selection/focus recovery, twenty interaction cycles, unavailable scores and explicit startup/update failures.
- Layout checks cover 1440/1024/768/390 CSS-pixel widths and 200% CSS magnification. Desktop and mobile/touch-emulated layouts were inspected, including Son by Four's missing-shirt evidence. A browser-generated Enter key selected Shai with visible keyboard focus.
- Actual overview palette contrast ranges from 4.37:1 to 5.53:1 against the page; muted dots are 3.39:1 and muted text is 6.02:1. Local approximate deuteranopia/tritanopia simulations and greyscale were inspected. Some hues converge; group labels, regions and controls remain necessary rather than claiming universal hue discrimination.
- Clean desktop loading and interaction produced no captured console warnings/errors. Native browser zoom could not be verified through the browser shortcut tool: the attempted shortcut did not change viewport width or device pixel ratio. CSS magnification is not equivalent.

Updated [readme.txt](readme.txt) and the latest student appendix/reflection in [Handin3.docx](Handin3.docx). The previous specification and implementation results below remain **design history**, not descriptions of the current UI. No real peer feedback, screen-reader/user testing, other-engine testing, native browser zoom, visual Word pagination or instructor-specific submission approval is claimed.

## Approved redesign: simpler, full-circle exploration

**Status: implemented; see the current record above for verified outcomes and remaining checks.** This section retains the approved design rationale and implementation sequence. It supersedes the earlier layout, overview colour and interaction specifications; the old 49/18 test counts below apply only to the historical version.

**User decisions:** use a complete 360-degree circle without the opening; simplify the page; make exploration more central; use five strong group colours in the overview and actual clothing colours only in selected-band details. Write only inside Marcus/Handin03; all shared material and other students' folders remain read-only.

### 1. Keep the question; improve the presentation

Keep solution B with A's member evidence, as one visualization:

> How does recorded clothing-colour matching vary between bands of different sizes?

The existing design addresses the formal brief, but its large introduction, four controls, many clothing-colour swatches, permanent example panel and lengthy visible method compete with the chart. More saturation cannot make 22 clothing categories reliably distinguishable. The redesign should reduce simultaneous demands, not add another dashboard or invent a finding.

Preserve the validated matching-pair measure and data contract. Display scores as percentages for readability: 0% = all known categories different; 100% = all known categories matching. This is a formatting change, not a new statistic or the percentage of members wearing one colour.

### 2. First-screen hierarchy

```text
Matching outfits?
How does clothing-colour matching vary with band size?

[Bottoms / Shirts]             [Choose a band...]

[All] [3 members: 12] [4: 21] [5: 19] [6: 2] [7: 1]
       Five labelled group keys, also usable as focus controls

ONE FULL-CIRCLE CHART (left)       SELECTED BAND (right)
centre: 55 bands / garment         Score and member evidence

One dot = one band. Further out = more matching pairs.
Arc width = number of bands. Select a dot to see the members.

[On narrow screens, selected-band details appear below the chart]
[How the score works and what it cannot tell us] (collapsed)
Source / run instructions
```

- Keep the title and one neutral question; remove competing overview headings and introductory paragraphs.
- Keep garment switching and a labelled native band selector visible. The selector is an accessible alternative to selecting small SVG marks, not an optional extra hidden with the method.
- Replace the size dropdown and separate reset button with the labelled group key, an "All" control and a clear-selection action when relevant.
- Hide the empty detail panel and its worked example. Put the example inside the collapsed method.
- Show selected-band details to the right of the circle on wide screens (1160px and above), and below it on narrower screens. Reserve the desktop columns so selection does not resize or move the chart. Start with band name, score, matching/possible pairs and coverage, followed by member names with named clothing swatches.
- Remove the separate mode summary and colour-count list from the main detail hierarchy; put them in an optional "Category summary" disclosure if retained. Member evidence is the essential content.
- Retain visible loading/error messages and assistive announcements, but avoid a prominent permanent status paragraph repeating the title and controls.
- Keep a short, visible limitation: "Recorded looks, not proof of deliberate coordination; only 2 six-member bands and 1 seven-member band." Put the fuller caveats and formula on demand.

### 3. Meaningful 360-degree geometry

The original brief explicitly allows both partial and full circles. The old opening was not a formal error; the new complete circle is an intentional design revision.

- The complete circle represents **all 55 bands**, not a cycle of band sizes.
- Start at 12 o'clock and place the size groups clockwise in labelled order 3, 4, 5, 6, 7. Mark the boundary between 7 and 3 with a thin separator, not an angular opening.
- Allocate every group's angle as `360 * groupBandCount / 55`: approximately 78.55, 137.45, 124.36, 13.09 and 6.55 degrees. Calculate with unrounded values; the total must be exactly one turn within floating-point tolerance.
- Use contiguous annular sectors with no angular padding. Fine boundary strokes distinguish groups without removing data angle. Arc width means number of bands, never the number of members in one band.
- Give every band an equal angular slot and a stable midpoint within its group, ordered by name. No sorting or reallocation when garment, focus group or selection changes.
- Preserve linear radial distance for the pair score and fixed-size dots. Do not use variable wedge areas or a square-root radius scale: score is encoded by point position, not area.
- Show only three default score-guide circles: 0%, 50%, 100%. These belong to a common radial scale, not an aligned Cartesian axis.
- Remove the 55 default stems. Show a temporary radial guide for the hovered, keyboard-focused or selected band to help connect its score to the scale.
- Move the old gap-dependent score labels to compact leader-linked labels near the top boundary. Prototype their placement before styling is final: labels must not cover points or hit targets, and label offsets must not change band angles. Keep labels horizontal and give the small 6/7-member groups external callouts if necessary.
- Do not imply that band sizes are cyclic, that angle measures uniformity, or that radial comparisons are as precise as an aligned dot plot. The part-to-whole arcs justify the circle; exact values remain available on selection.

### 4. Five strong colours with one clear meaning

**Colour in the overview identifies the labelled size group; it does not represent clothing colour, score or an ordered numerical gradient.** Numerical band size remains explicit in the labels and the ordered spatial grouping. Hue is only a redundant group-identity cue, not the sole encoding of this ordered attribute.

- Start with five distinct, saturated hues: blue, burnt orange, teal, purple and ochre. Choose final hex values after contrast and colour-deficiency checks rather than declaring a palette accessible by name.
- Use strong colour on small dots and thin group arcs, not five large filled wedges or coloured background panels. Keep the page neutral.
- Use matching group colours in the chart and group controls. Keep literal clothing-colour swatches exclusively in the member evidence/category summary, with category names always visible.
- The overview no longer needs a 10- or 22-item clothing legend, mode-tie stripes or a patterned-clothing symbol. Missing score status remains explicit; it is not a sixth hue.
- Distinguish selection by a dark outline/halo and a text label, not a new unexplained data colour. Keyboard focus must also be evident without hue.
- Preserve group labels, region boundaries and textual band-size information so the chart remains interpretable in greyscale and when hues become similar.
- The learning point is not "strong colour is always better": small marks need salience; large areas and secondary explanations should remain quiet.

### 5. Exploration contract

The main loop is **overview -> focus a group -> inspect a band -> change garment -> compare -> return to all**. Exploration means letting readers investigate, not adding more controls or hiding all explanations.

| Action | Planned result | Invariant / accessibility |
|---|---|---|
| Switch Bottoms / Shirts | Update radial scores and selected-band evidence | Preserve angles, group colours, radial scale and selection; show the garment explicitly |
| Activate a labelled group key | Emphasise that group's dots; render other dots in a quieter neutral style | Keep all 55 bands and all arcs in place; report how many are emphasised; native button semantics and `aria-pressed` |
| Activate All | Restore all group colours | Restore emphasis only; do not unexpectedly change garment or selected band |
| Hover or keyboard-focus a dot | Brief name, size, exact score, pair counts and any missing-data caveat | No hover-only essential information; no automatic persistent selection |
| Select a dot or use the band selector | Reveal persistent member evidence and a selection halo | Pointer, touch, Enter and Space; selector includes all bands |
| Select a band outside the focused group | Move group focus to that band and show its details | Do not leave the selected band visually suppressed; announce the change |
| Clear selection | Hide the details and restore the short selection prompt | Preserve garment and group focus; return focus to a stable control if the clear button disappears |
| Open the method | Reveal formula, worked example and fuller limitations | Native disclosure; essential chart key remains visible when closed |

Group focus replaces the previous hide-other-groups filter. This intentional change preserves the full-circle context and comparison opportunities; update state/UI tests accordingly rather than retaining the old filtering assertions.

Do not add rotation, zoom, multiple selection, a second comparison chart or autoplay. Garment switching at stable positions already supports a meaningful comparison. No decorative animation is required.

### 6. Assignment coverage and theory

| Brief requirement | Redesign response |
|---|---|
| One original D3 radial visualization | Existing question and validated data model, revised full-circle overview |
| Meaningful arcs | Five band-size regions; each angle encodes its share of the 55 bands |
| At least three deliberate visual encodings | (1) band-count angle/arc length, (2) uniformity through radial position, (3) labelled group membership through hue; ordered angular regions additionally organize band size |
| Reading support and hierarchy | Direct group/count labels, three score guides, a two-line reading key; full method on demand |
| Meaningful interaction | Group emphasis, selection revealing member evidence, stable-position garment comparison |
| Readable functional code | Reuse the current model/view/orchestration separation; no new framework or dependency needed |
| Eight-question reflection | Revise the student reflection only after the final behaviour is implemented and checked |

Theory and slide anchors reviewed for this revision:

- [Interactivity slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%284%29%20-%20Interactivity.pptx), slide 4: selection can display more information; navigation/filtering should serve a task.
- [Exploratory visualization slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%285%29%20-%20Exploratory%20Visualizations.pptx), slides 9-10, and [Session 5 theory](../../Samlet/CourseMaterials/Theory/session05-exploratory-visualizations.md), section 5: ask an open relationship question rather than assert a result.
- [Effective communication slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%286%29%20-%20Effective%20Communication.pptx), slides 6-7, and [Session 6 theory](../../Samlet/CourseMaterials/Theory/session06-effective-communication.md), sections 4-5 and 7-9: match channels to attribute types, prioritize position, limit colour categories and test discriminability. Do not mistake distinct hues for an ordered scale.
- [Workshop slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%287%29%20-%20Visualization%20Workshop.pptx), slides 5 and 7: explain the layout, marks, channels, radial geometry and interaction, rather than simply decorate a circle.
- [Session 7 theory](../../Samlet/CourseMaterials/Theory/session07-radial-visualizations.md), sections 2-3: acknowledge radial accuracy/cyclic costs and justify the complete circle through part-to-whole structure.

For the exam, explain both the benefit and the cost: fewer simultaneous encodings make exploration clearer, but moving clothing colour into details removes immediate comparison of modal clothing colours across bands. That trade-off fits the main band-size/uniformity question. The stronger design argument is the documented revision and evidence, not a claim that the circular layout is universally optimal.

### 7. Implementation order and acceptance checks

1. **Prototype geometry and hierarchy first.** Change the circle and label layout, remove default stems and collapse secondary content. Check the crowded 6/7 boundary, 0% dots and the many 100% dots before final palette work.
2. **Wire the new encodings.** Add one size-group colour mapping shared by arcs, dots and controls. Keep the existing clothing mapping for member evidence. Change displayed score formatting consistently to percentages.
3. **Update the exploration state.** Implement group emphasis instead of hiding, retain the accessible band selector, preserve stable angles/selection on garment changes, and handle focus recovery and explicit errors.
4. **Validate model and UI.** Adapt the existing suites and run them; retain all data-contract/reference tests. Check sum of angles = 2*pi, no angular gaps, proportional group widths, unique midpoint slots and stable geometry across every action. Do not rely only on a screenshot.
5. **Inspect usability and visual accessibility.** Check 1440/1024/768/390-pixel layouts, keyboard and touch, colour-deficiency simulations, greyscale and native 200% zoom. Require no page-wide horizontal overflow, clipped labels or overlapping small-group callouts. Preserve chart-only scrolling if shrinking would make targets unusable; keep selector/disclosures usable without chart scrolling. Aim for at least 4.5:1 normal text contrast and 3:1 essential graphical/control contrast. Validate the actual chosen colours, not just their nominal palette.
6. **Recheck exact data examples.** Shai bottoms = 2/6 = 33.3%; Ideal bottoms = 3/6 = 50%; The Click Five bottoms = 100%; Son by Four shirts = 100% among 3 known of 4. Keep missing values distinct from zero and never count missing categories as matching pairs.
7. **Get real feedback.** Without coaching, ask a reader what one dot, its colour, its distance and arc width mean; ask them to find a band and explain a garment change. Record actual misunderstandings and revise. Do not fabricate feedback or pre-fill a successful result.
8. **Synchronize documentation after implementation.** Update this plan's current status, reading instructions, readme and the student appendix/reflection in [Handin3.docx](Handin3.docx). Preserve the original brief and original sketches; record the redesign as an iteration rather than rewriting its history. Recheck standalone delivery after changes.

**Non-negotiable acceptance:** one working full-circle chart; five stable overview group colours; no large clothing legend or empty explanatory sidebar on initial load; at least three explained data encodings; member evidence accessible without hover; no silent data/score changes; no files written outside Marcus/Handin03.

**Planning/implementation distinction:** the initial planning revision changed no application code or Word documents. The subsequent implementation updated both, with its actual verification recorded at the top of this file.

---

## 1. Earlier implementation: decision, status and boundaries

**Selected solution: B, band size versus clothing-colour uniformity, with A's member-detail panel.** Build one coherent visualization, not three dashboards. A and C remain documented alternatives in the [design workshop](Handin03%20design%20workshop.docx).

**Earlier approved refinement (implemented; superseded for the next revision above):** a 300-degree open ring, ordered by band size 3-7, with sector widths proportional to the number of bands in each size group. The opening separates sizes 7 and 3. This superseded the equal-sector/full-circle proposal in the workshop; its sketches remain a record of the earlier design.

**Status, updated 6 November 2026:** the selected visualization is implemented in [index.html](index.html). The numbered sections below retain the original specification; the implementation record here states what has actually been completed. A draft reflection based on the implementation is appended to [Handin3.docx](Handin3.docx). Real peer feedback and instructor-specific submission checks remain pending.

### Implementation record

- Implemented the 300-degree open ring, proportional band-count arcs, fixed score scale, shared colour mapping, tie patterns and explicit missing/unavailable values.
- Implemented garment switching, band-size filtering, keyboard/pointer band selection, transient tooltips, persistent member evidence and reset through one state-update path.
- Kept all runtime assets inside this hand-in, including a local pinned D3 7.9.0 distribution and its ISC licence. No npm install, framework, CDN request or other student's code is needed at runtime.
- Model tests: **49/49 passed** in Node and the browser, including all supplied-data reference values, malformed CSV, missing data, ties, geometry and state rules.
- Browser tests: **18/18 passed**, including twenty repeated interaction cycles, keyboard activation, unavailable scores, HTTP failure, invalid data and missing D3.
- A fresh standalone copy also passed the model and browser suites. Its clean page made zero requests outside its own delivery directory and produced no console errors or warnings.
- Checked widths of 1440, 1024, 768 and 390 CSS pixels, mobile/touch emulation, keyboard focus and Enter activation. Checked 200% CSS magnification at desktop width; a manual check of native browser zoom remains advisable.
- Text contrast checked on the actual styles: the tested normal/muted text combinations exceed 5.8:1. Default structural arcs exceed 3.1:1 and stems exceed 3.6:1 against the page.
- Inspected local approximate deuteranopia/tritanopia simulations and greyscale. Exact colour identification still relies on names and details, not reliable discrimination of every shade.
- Prototype refinements: point radius is 5 rather than 4 viewBox units; radial tick labels are numeric to avoid colliding with points; a native band selector provides a reliable alternative to small SVG targets. No animation or secondary dashboard was added.

Run instructions: [readme.txt](readme.txt). Re-run [model tests](tests/model.test.html) and [browser tests](tests/ui.test.html) over HTTP, or run `node Marcus/Handin03/tests/run.mjs` from the repository root for the model suite.

**Not claimed as complete:** real peer review, screen-reader/user testing, testing in every browser engine, instructor-specific packaging/AI requirements, and visual pagination of the Word document. This is a working implementation with automated and visual checks, not a claim of universal accessibility or a completed submission.

**File boundaries:** all new or changed files must be under Marcus/Handin03. Shared course material and other students' folders are read-only. Do not modify workspace settings, root configuration, earlier hand-ins or other students' dependencies. Preserve unrelated changes already in the worktree.

The original requirements remain intact in [Handin3.docx](Handin3.docx); the plan and subsequent implementation/reflection record are clearly separate student sections. The [original-brief backup](Handin3%20-%20original%20brief.docx) is preserved. The separate Markdown workshop template and workshop Word document have not been revised during implementation.

### Required by the brief versus our design choices

| Assignment requirement | Planned response | Evidence before submission |
|---|---|---|
| Own question and justified design | Explore band size versus recorded clothing uniformity | Question, definitions and comparison with A/C |
| Radial visualization | Open-ring point-and-stem plot | Working radial SVG |
| Meaningful arc structure | Arcs group band sizes; angular width represents band count | Labels and validated angular proportions |
| At least three deliberate encodings | Group position, score distance and modal-colour fill; also band-count angle | Marks/channels table and visible legend |
| Reading support | Fixed score guides, colour key, group counts, reading instructions | Reader can interpret the chart without verbal coaching |
| At least one meaningful interaction | Band selection reveals evidence; garment switching and size filtering support comparison | Pointer and keyboard checks |
| Short reflection | Answer all eight brief questions after implementation | Honest account of the final result and limitations |
| Readable code in functions | Small data, view and orchestration modules | Code walkthrough and passing tests |

The brief does not require three dashboards, React, a backend, a database or an invented significant result. Submission method, deadline, permitted AI use, any extra React requirement and whether to upload the workshop are administrative checks for itslearning/the instructor, not assumptions to insert into the brief.

## 2. Question, audience and scope

**Working title:** The Boyband Blueprint: Matching Outfits?

**Main question:** How does band size relate to the share of member pairs with the same recorded clothing-colour category?

- My visualization will investigate the distribution of uniformity within and between band-size groups, starting with bottom colour.
- The most important attributes are band, name, bottom_color and shirt_color; derive band size, category counts, uniformity and the most frequent category.
- The reader should first notice where bands sit on the uniformity scale and how the score distributions differ across size groups, alongside each group's sample size.
- The reader should then be able to inspect a band's actual records and compare bottoms with shirts.

**Audience:** a curious music reader on a laptop, with no assumed statistics or D3 knowledge. The page must explain the score in ordinary language and support touch/keyboard access.

**Task abstraction:** discover / explore / compare distributions; then lookup / identify a band. The purpose is exploratory, with enjoyment as a secondary goal. Do not assert that larger bands coordinate more before examining the result.

**Core scope:** one radial overview, bottom/shirt selector, size-group filter, band selector, persistent evidence panel, reading guide, legend, reset and error/status messages.

**Not in scope:** zodiac view, signature-colour dashboard, skin-tone coordination, jacket analysis, recommendations, date sliders, regression/significance claims, photographs, geographic features, elaborate animation, a second production chart or new external datasets.

## 3. Data contract and verified reference values

Use [boys.csv](boys.csv) as the single source. Keep its location and original contents unchanged.

| Property | Verified value | Consequence |
|---|---|---|
| Records / bands | 234 member records / 55 bands | Never describe these as 234 guaranteed distinct people |
| Identity | band + name is unique; name alone is not | Composite member key; band key for band marks |
| Band sizes | 3: 12 bands; 4: 21; 5: 19; 6: 2; 7: 1 | Show band counts; very small large-band samples |
| Bottom colour | 234 known, 10 categories | Default; no colour-related exclusions |
| Shirt colour | 233 known, 22 categories | One incomplete band; keep patterned as a category |
| Bottom-colour score | 35 bands have U = 1; six tied modes | Keep equal-score points separate; handle ties explicitly |
| Shirt-colour score | 21 bands have U = 1; 13 tied modes | A garment change affects both position and signature |
| Unavailable band scores | None for either garment in this file | Still test unavailable-score behaviour with fixtures |

The dataset is a static table with a composite band/member key, not a network or a time series of outfits. The same artist may appear under different band entries; do not merge those records without a separately justified identity model.

### Parsing and validation

1. Load the CSV with D3's CSV parser. Never split on commas: quoted fields contain commas and escaped quotes.
2. Check non-empty data and required headers: band, name, bottom_color, shirt_color.
3. Trim surrounding whitespace. Convert blank clothing cells to null, not "unknown", black, zero or false. Preserve category distinctions, original records and source row numbers.
4. Require a band and name and reject duplicate composite keys. Use a structured key such as a serialized [band, name] pair rather than an ambiguous joined string.
5. Group by band. Count every member record for band size, including missing-colour records.
6. Validate colour values against the documented labels supported by the selected garment and swatch map. An unfamiliar category requires an explicit data-contract update; do not silently hide or recolour it.
7. Do not parse unused birth dates, heights or appearance attributes merely to draw this chart.
8. Surface invalid/empty data, fetch failures and missing D3 through a visible error state and a diagnostic console error. Never leave a loading indicator indefinitely or draw a success-shaped empty chart.

The counts above are regression expectations for this supplied file, not constants to substitute for calculations. An unexpected file change should fail the reference checks and trigger review, not silently drop records.

## 4. Derived measures

### Uniformity

For a selected garment, let n be the number of known colour records in one band and n_c the count of colour category c.

```text
matchingPairs = sum(n_c * (n_c - 1) / 2)
totalPairs = n * (n - 1) / 2
U = matchingPairs / totalPairs, when n >= 2
```

Interpretation: the fraction of distinct member pairs sharing the exact same recorded category.

- All categories different: U = 0.
- All known categories the same: U = 1.
- Fewer than two known values: U = null, displayed as "Not enough known colours".
- Compute at full precision. Display a score to two decimal places, with the integer pair counts beside it.
- Keep totalMembers, knownColourCount and missingColourCount separately. Size grouping uses totalMembers; the score denominator uses knownColourCount.
- Unknown values must never match one another.
- Two entries labelled patterned count as a category match, not proof of identical patterns or outfits. State that scores measure category agreement, not physical colour distance or overall fashion similarity.
- Do not convert named colours into ordered numbers or average RGB values to define uniformity.

### Signature colour

Use the label **Most common recorded colour** in the UI; "signature" is only a shorthand.

- One maximum category count: show that category.
- Several categories tie: show "Tied most common colours", list all tied names and counts, and use a distinct tie pattern on the band point.
- No known colours: no mode; show "No known colour".
- One known colour: its mode is defined, but pairwise uniformity is not.
- Do not choose an arbitrary winner, compute an average colour or claim official band branding.

### Reference examples

| Band / attribute | Category counts | Matching / all pairs | Expected score and mode |
|---|---|---|---|
| The Click Five / bottoms | black: 5 | 10 / 10 | U = 1; black |
| Ideal / bottoms | white: 3, gray: 1 | 3 / 6 | U = 0.5; white |
| Shai / bottoms | black: 2, navy blue: 2 | 2 / 6 | U = 1/3; tied black/navy blue |
| Hanson / bottoms | navy blue: 2, tan: 1 | 1 / 3 | U = 1/3; navy blue |
| Ideal / shirts | white: 4 | 6 / 6 | U = 1; white |
| Shai / shirts | four distinct categories | 0 / 6 | U = 0; four-way tie |
| Son by Four / shirts | white: 3, missing: 1 | 3 / 3 | U = 1 among 3 known of 4; group size remains 4 |

Son by Four must not be described as all four members matching. Its detail text should say "3 known colours out of 4 members; 3 of 3 known-member pairs match."

## 5. Marks, channels and reading order

| Attribute or purpose | Mark | Channel | Reason and limitation |
|---|---|---|---|
| Band-size group, ordered count 3-7 | Labelled structural arc | Angular region, in ascending group order | Organizes bands; gaps identify groups, not a cyclic size scale |
| Number of bands in a group | Same arc | Angular extent at fixed radii | More bands get proportionally more angular space |
| Uniformity, quantitative 0-1 | Equal-sized point and thin stem | Linear radial position and stem length | Makes score comparison primary; radial comparisons remain weaker than aligned Cartesian positions |
| Most common colour, categorical | Band point and labelled swatch | Fill appearance: hue/lightness or pattern | Familiar category appearance, never an ordered score scale |
| Identity and exact values | Text labels/details | Text | Lookup without guessing colour or radial distance |
| Selection | Outline and focus indicator | Stroke/outline, not colour alone | Clear feedback independent of clothing colours |

Do not count a tooltip or a title as a substitute for three data encodings. The first four rows provide deliberate data mappings.

**Reading order:** question and garment -> group/count structure -> band score distribution -> exact selected-band evidence.

**Minimum reading guide:** "Each point is one band. Groups run from 3 to 7 members. Wider group arcs contain more bands, not larger individual bands. Further out means more recorded colour agreement. Point fill shows the most common colour; patterned tie symbols mean no single winner. Select a band to inspect its members."

**Gestalt choices:** proximity and bounded arc regions group bands; repeated point/stem treatment creates similarity; muted guides and stronger data marks establish figure-ground. Do not connect bands with a polygon or trend line that implies continuity.

## 6. Exact radial layout

The open-ring design is an intentional refinement of the workshop. It reduces the false suggestion that sizes 7 and 3 are neighbours on a natural cycle and gives arc width an explicit meaning.

### Angular allocation

- Use D3's convention: zero at 12 o'clock; increasing angles clockwise.
- Start at -150 degrees and end at +150 degrees, leaving a 60-degree opening at the bottom.
- Order groups by total member count: 3, 4, 5, 6, 7.
- Reserve four inter-group gaps of 3 degrees. The drawable group span is 300 - 12 = 288 degrees.
- Let N_g be the full-dataset number of bands in group g, and N = 55. Group width is 288 * N_g / N degrees.
- Accumulate each group's start/end angles, inserting a gap between groups. Widths are approximately 62.836, 109.964, 99.491, 10.473 and 5.236 degrees.
- Each band gets one angular slot inside its group: step = groupWidth / N_g. Put its point at start + (index + 0.5) * step.
- Sort bands alphabetically once within each group, using a consistent comparator. Do not sort by uniformity when changing garment.
- Convert degrees to radians at the geometry boundary. Use d3.arc for the structural bands and d3.pointRadial, or the equivalent x = r * sin(a), y = -r * cos(a), for points.
- Calculate the four gaps explicitly. Avoid adding pie/arc padding that silently changes the specified proportions. A pie generator is optional, not an assignment requirement.

Every band then has approximately 5.236 degrees of angular space. The arcs represent shares of the available 288-degree data span, not percentages of the full 360-degree circle. Label them with counts rather than implying the gaps are data.

### Radial allocation and overlap

- Initial prototype: viewBox 0 0 1000 1000; centre at (500, 500).
- Structural group arcs occupy radii 165-185; the score baseline is radius 210 and U = 1 is radius 390.
- Use r(U) = 210 + 180 * U. Draw guide arcs at U = 0, 0.25, 0.5, 0.75 and 1. Put guide labels beside the bottom opening.
- One constant-sized point per band; initial radius 4 viewBox units. A thin stem starts at the inner score baseline and ends at the point. At U = 0 the point remains visible even though the stem has zero length.
- Use a linear scale, not scaleRadial: this design encodes point distance/stem length, not variable filled-wedge area. Do not draw filled score wedges or radar polygons.
- Keep angle slots and the 0-1 radial domain fixed during filtering and garment switching. Equal scores remain at distinct angles; never jitter a point's radius or change its score to avoid overlap.
- At radius 210, adjacent slots have approximately 19.19 viewBox units of separation before display scaling. Validate the rendered size rather than assuming this guarantees touch targets.
- A null score produces no numeric point or stem. List that band in an explicit unavailable-score notice and keep it selectable in the band control. Do not plot null at zero.
- Label all five groups outside the chart with leader lines where necessary, especially the small 6- and 7-member groups. Keep text horizontal and separately show their counts. Do not try to label every band in the overview.

These dimensions are prototype values, not a claim of validated layout. Change spacing/radii if the readability checks fail, while preserving the encoding and fixed-scale rules. More precise comparison would be possible in an aligned dot plot; the open ring reduces one weakness but does not remove radial perceptual costs.

## 7. Page layout, colour and accessibility

### Page structure

1. Title, neutral question and one-sentence explanation of pair agreement.
2. Native labelled controls: garment, size filter, band selector, reset.
3. Visible loading/error/status region; when loaded show visible band count and garment coverage.
4. Radial overview with scale labels and group labels.
5. Concise reading guide and labelled colour legend.
6. Persistent selected-band panel, beside the chart if space permits or below it otherwise.
7. Source note, limitations and short methodology.

### Detail panel

Show band name, total members, selected garment, known/missing coverage, U, matchingPairs / totalPairs, all modal categories, a colour-count summary and all member records with name plus recorded colour swatch and text. Include missing rows rather than removing them. The panel exposes the evidence behind the score; it is not a recommendation engine.

### Colour rules

- Use one explicit named-category-to-swatch mapping across both garments. Blue, navy blue and light blue stay distinct. Colours are representative swatches, not calibrated samples from photographs.
- Reuse the same mapping in points, legend and member details. Keep legend order stable; do not reassign colours after filtering.
- Show the categories observed for the selected garment, even when a size filter hides some bands. Wrap the legend into labelled rows; do not invent 22 easily distinguishable hues.
- White and light swatches need dark outlines. Provide text for every category; black/navy and other close shades cannot be decoded reliably by hue alone.
- Use different treatments for the actual patterned category, a tied mode and missing data, with explicit labels. A tie must not look like a data value called patterned.
- Treat exact signature-colour lookup as a text/detail task. Do not use colour as the only way to identify a band or interpret the primary size/uniformity question.
- No decorative gradients, 3D, large background colour fields or unnecessary KPI cards.

### Accessible and responsive behaviour

- Native controls must work by keyboard and have visible labels. The band selector provides a non-pointer route to every visible band, including unscored bands.
- Give band marks meaningful accessible names and keyboard activation where practical; do not put interactive descendants under an SVG role that exposes the whole chart only as one static image.
- Mirror hover information on focus. Enter/Space selects; Escape dismisses transient tooltip content. Selection is persistent until changed or cleared.
- Selected and focused states use outlines, not only fill/opacity. Native buttons/selects should have comfortable touch targets (aim for at least 44 CSS pixels in height).
- Do not solve dense points with overlapping giant hit areas. Use the band selector/details as the reliable touch alternative.
- Maintain readable controls and body text, with normal text contrast at least 4.5:1. Keep SVG labels legible; at narrow widths use a bounded horizontally scrollable chart region rather than shrinking every label to unreadable size. Explain that the chart can scroll.
- Test at 1440, 1024, 768 and 390 CSS-pixel viewport widths and at 200% zoom. Controls/details must not require page-wide horizontal scrolling; chart-only scrolling is allowed.
- Start without animations. If later adding short emphasis transitions, respect reduced-motion preferences and avoid decorative rotation or path-string morphing.

## 8. Interaction/state contract

State needs only activeGarment, sizeFilter, selectedBandId and transient hovered/focusedBandId, plus data/derived model and load status. Default is bottoms, all sizes, no selected band, no tooltip.

| Action | Required result |
|---|---|
| Select a band by click, keyboard or native selector | Outline its mark and populate the same persistent detail panel; keep other marks in place |
| Hover/focus a band | Show name, size, U, coverage and mode/tie text; do not replace a different persistent selection |
| Leave the mark or dismiss tooltip | Clear only transient information; preserve the selected band |
| Change bottoms to shirts or back | Recompute/swap band summaries; preserve band size, angular positions and selected band; refresh details, legend, coverage and accessible text together |
| Select a size group with a labelled control or arc | Show only that group's band marks but retain all structural arcs, their original counts and geometry for context |
| Filter away the selected band | Clear its selection/details and announce why; band selector contains only visible bands |
| Choose a band with unavailable score | Show its coverage and explanation in details; do not invent a radial position |
| Reset | Bottoms, all sizes, no selection/tooltip; restore controls and status |
| A load/validation error occurs | Visible error message and diagnostic; disable unavailable interactions; no invented chart |

Size filtering does not recompute uniformity from a subset of members. Structural arc counts always refer to the full dataset. The status must distinguish "21 of 55 bands shown" from member counts or known-colour counts.

When a DOM update removes a focused mark, move focus to the initiating control or another sensible visible control; never leave focus on a removed element. Do not announce every mouse movement through a live region.

## 9. Implementation structure and tooling

Use plain HTML/CSS/JavaScript with D3, following the prior hand-in's small static-page approach. No React or build framework is assumed necessary by this brief. Confirm any separate instructor requirement before coding.

Planned files, all relative to Marcus/Handin03:

| File | Responsibility |
|---|---|
| index.html | Semantic page, controls, chart/panel containers, reading support and status |
| css/main.css | Layout, responsive chart region, typography, focus, legend and tooltip styles |
| js/model.js | Pure parsing/validation, grouping, pair counts, modes and angular-layout helpers |
| js/view.js | Create SVG/HTML once; keyed updates for arcs, guides, marks, legend and details |
| js/main.js | Load data, build model/DOM/viz, wire controls and central update function |
| tests/model.test.html | Browser test entry using the same D3 distribution and model module |
| tests/model.test.js | Small assertion-based fixture and supplied-data tests |
| readme.txt | Run/test instructions, D3 dependency, source and hand-in contents |

These are planned files, not files to create during the planning task. Keep the existing CSV and documents in place. Use ES modules for the app/model boundaries; do not introduce a package manager merely to organize three modules.

### Functions and flow

Load -> normalize/validate -> group bands -> derive both garment summaries -> allocate immutable angles -> create DOM/viz -> render -> handle updates.

Suggested responsibilities: normalizeMembers, summarizeBand, createModel, allocateBandAngles, createDOM, createViz, view and update. Extract shared colour/label helpers only when needed; avoid duplicate score or mode logic in tooltips and details.

Store each band with its stable id/name, members, total size, angular slot and garment summaries containing counts, coverage, pairs, U and modes. UI filtering uses this model, not ad hoc CSV scans. With only 234 records, no elaborate caching or backend is justified.

Follow Session 4's Model-View-Update pattern: one state update path refreshes chart, native controls, status, legend and selected details coherently. Create persistent containers once. Use keyed D3 joins (band id, size-group key, composite member key) so repeated changes do not append duplicate marks or show stale data.

Load a pinned D3 v7 distribution, preferably the verified 7.9.0 release, rather than an unversioned latest URL. If using a CDN, document the internet dependency and handle library-load failure visibly. If an offline exam/demo is required, package a permitted local D3 distribution with its licence inside this folder before delivery; do not assume a network connection.

Serve over HTTP using the existing Live Server workflow; file:// is not a valid run method for CSV fetches/modules. No changes to workspace configuration are necessary. Prior patterns for explicit input validation and status messages can be studied in [the earlier hand-in](../Handin02/js/main.js), but do not copy unrelated slider/streamgraph machinery.

## 10. Build sequence and completion gates

| Stage | Work | Depends on | Stop/go evidence |
|---|---|---|---|
| 0. Confirm constraints | Check submission/admin requirements and framework expectations; confirm source provenance from supplied materials | None | Requirements recorded; no invented deadline or format |
| 1. Data model and tests | Parse supplied CSV, validate identities, derive both garment summaries and fixtures | Stage 0 | All supplied-data and edge-case assertions pass before rendering |
| 2. Geometry prototype | Implement the approved open ring, fixed slots, score guides and minimal labels | Stage 1 | Correct 55 slots, 5 arcs, angular ratios and readable zero/equal-score cases |
| 3. Static communication | Add the three-plus encodings, labelled legend, reading order and data caveats | Stage 2 | A reader can explain a point, arc width and score without help |
| 4. Interaction | Add garment switch, group filtering, band selection, details and reset through one state path | Stage 3 | Pointer/keyboard produce identical selected-band evidence; no stale or duplicate DOM |
| 5. Evaluation and refinement | Run browser checks, colour/contrast checks, real peer tasks, narrow-screen tests | Stage 4 | Record failures and fix them; rerun tests after changes |
| 6. Reflection and package | Write what was actually built, record trade-offs, verify delivery folder | Stage 5 | Brief checklist satisfied; visualization works from a fresh served copy |

Do not polish animations or add another chart while earlier gates fail. No specific duration is promised; each stage is complete when its evidence passes.

## 11. Validation plan

The following are future acceptance tests, not claims that application tests have already passed.

### Data/model assertions

- Supplied CSV: exactly 234 records and 55 bands; size-group band counts 12, 21, 19, 2, 1; group counts sum to 55 and member counts sum to 234.
- Bottoms: 234 known values, 35 scores equal to 1, six modal ties. Shirts: 233 known, 21 scores equal to 1, 13 modal ties.
- Assert every reference example in section 4. For fractions, compare within 1e-12, not rounded display strings.
- All valid U values are finite and within [0,1]; sum of category counts equals knownColourCount; known + missing equals totalMembers.
- Fixtures: two same -> 1; two different -> 0; three same and one different -> 0.5; two-and-two -> 1/3 and a mode tie; four different -> 0 and a four-way tie.
- Fixtures: zero/one known -> null score; missing + missing must not produce a match; patterned + patterned is a category match; ties list every winner.
- Missing required header, empty dataset, empty identity, duplicate composite key and unsupported colour produce explicit errors.
- Quoted commas/quotes parse correctly; whitespace normalizes; malformed input does not disappear silently.
- Reordering input rows does not change scores or deterministic band slots. Changing a size filter does not change any band's size or score.

### Geometry assertions

- Exactly five non-overlapping structural arcs and 55 distinct band angles for the supplied data.
- Arc widths sum to 288 degrees; inter-group gaps sum to 12; extent spans -150 to +150 degrees. Compare with floating-point tolerance.
- Width / band count is equal across groups; each band's angle lies strictly within its own group.
- Check r(0) = 210, r(0.5) = 300 and r(1) = 390 for the initial dimensions.
- Check D3 angle convention: angle 0 points up, pi/2 points right; all SVG coordinates are finite.
- Every point with U = 1 remains individually represented; zero stems retain visible points; null is not mapped to a radius.
- Garment switching and filtering preserve the full-dataset angles and scale.

### Browser and interaction checks

- Fresh HTTP load shows 55 bands and five group arcs. No unexpected console errors, failed resource requests or NaN paths.
- Select Shai: bottom score 0.33, 2/6 pairs and tied black/navy mode. Switch to shirts: same selected band and angle, score 0.00, 0/6 and four-way tie.
- Select Son by Four on shirts: group size 4, 3/4 known coverage, score 1.00 explicitly qualified.
- Filter size 4: 21 band marks shown, five structural arcs retained with original counts. Selecting another group clears an incompatible selected band.
- Repeat garment changes, filters and reset at least 20 times; mark/container counts remain correct and no stale selected-member rows remain.
- Mouse, keyboard and touch-compatible band control reveal the same evidence. Focus is visible and survives updates appropriately.
- Tooltip does not cover the selected point unnecessarily or run offscreen. Persistent detail remains after hover ends.
- Check loading, simulated missing CSV/library, invalid fixture and unavailable-score states; no silent success fallback.
- Test the widths/zoom specified in section 7; no clipped group labels, unreadable small text, upside-down labels or page-wide overflow.
- Test red/green and blue/yellow deficiency simulations and greyscale; labels and score positions must remain usable. If any tool uploads a screenshot, use only permitted content or choose a local simulation.

### Real peer tasks

Ask a classmate to explain what a point and a wide arc mean; find a fully matching band; explain Shai's 0.33; switch garments; identify the incomplete shirt record coverage; and reset. Record whether they succeed, where they hesitate, their actual feedback and at least one resulting revision. Do not fabricate timings, quotes or completed feedback.

## 12. Interpretation limits and exam argument

- Uniformity describes equality of recorded categories, not deliberate styling, brand identity, exact colour distance or overall outfit similarity.
- Small groups permit only a few possible score values. The normalization bounds the score but does not remove sampling variability or make unequal groups equally reliable.
- Black and navy dominate the supplied bottom-colour counts. A high U may reflect common clothing categories, not special coordination. The score is not adjusted for background category frequencies.
- Only three bands have more than five members. Show every band and sample sizes; do not infer a general trend from those groups.
- Missing values are excluded only from that garment's pair denominator and disclosed. The repeated-artist structure also limits independent-person interpretations.
- A weak/no relationship is an acceptable exploratory outcome. Do not cherry-pick the garment or alter the score to manufacture a conclusion.
- The radial layout trades comparison precision for compact grouping, engagement and the assignment's arc requirement. Proportional widths and an open boundary improve the justification but do not make it more accurate than an aligned plot.

### Exam discussion mapped to course material

| Topic | Explain using this implementation |
|---|---|
| Sessions 1-2: What/Why/How | Table and keys; exploratory comparison task; why each attribute gets its channel |
| Session 3: Data manipulation | Group records by band; count categories; derive pair agreement rather than drawing raw strings |
| Session 4: Interaction | One state/update path, keyed joins, selection versus filtering, evidence revealed by details |
| Session 5: Nested model and validation | Right question, defensible measure, readable idiom, correct implementation; evidence at each level |
| Session 6: Communication | Identity versus magnitude, hue limitations, common-region grouping, aligned-position advantage |
| Session 7: Radial geometry | Angles/radians, meaningful group width, fixed radius scale, open-ring rationale and linear-versus-area scaling |

Be able to calculate U by hand, trace one record into a plotted band, explain each interaction's state change, and identify a real limitation. Keep the original sketches and actual revision history. The course slides recommend AI mainly for reviewing students' work; follow instructor rules and any disclosure requirements rather than trying to hide assistance.

## 13. Reflection and submission checklist

After implementation, append a clearly labelled final reflection to the student section of Handin3.docx, answering the brief's eight questions:

1. What question or insight did the implemented visualization communicate? State observed results and limits; do not substitute the original intention for findings.
2. Which marks did you choose, and why?
3. Which channels did you choose, and why?
4. What does the arc structure represent?
5. Which dataset attributes did you include, and why?
6. Which did you exclude, and why?
7. What interaction did you implement, and how does it support the reader?
8. What would you improve with more time?

Keep that reflection short relative to this implementation plan. Record any deviations from the plan and why. Do not present future improvements or unimplemented behaviour as existing features.

Deliver the runnable page, CSS/JavaScript, CSV, required library assets or documented network dependency, run instructions and final reflection in the format specified by the instructor. Include workshop evidence only if requested or permitted. Keep original backups locally; do not automatically include them or transient test outputs in the upload.

Before handing in: serve a fresh copy of the intended delivery folder, open the visualization, run its test page, exercise each interaction, confirm no dependency on another student's folder, and check every completion criterion in section 1. Verify permitted packaging for an offline demo if needed. No commit or submission is part of this planning task.

## 14. Sources and prior work

- [Handin3.docx](Handin3.docx): original assignment requirements, followed by this student plan.
- [Design workshop](Handin03%20design%20workshop.docx): original three alternatives and their marks/channels discussion.
- [Dataset](boys.csv): reference counts and score calculations above, checked directly.
- [Session 1: Introduction](../../Samlet/CourseMaterials/Theory/session01-introduction.md) and [Session 1 slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%281%29%20-%20Introduction.pptx).
- [Session 2: Visual encodings](../../Samlet/CourseMaterials/Theory/session02-visual-encodings.md) and [Session 2 slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%282%29%20-%20Visual%20Encodings%20of%20Data.pptx).
- [Session 3: Data manipulation](../../Samlet/CourseMaterials/Theory/session03-manipulating-data.md) and [Session 3 slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%283%29%20-%20Manipulating%20data.pptx).
- [Session 4: Interaction](../../Samlet/CourseMaterials/Theory/session04-interactivity.md) and [Session 4 slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%284%29%20-%20Interactivity.pptx).
- [Session 5: Exploratory visualization](../../Samlet/CourseMaterials/Theory/session05-exploratory-visualizations.md) and [Session 5 slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%285%29%20-%20Exploratory%20Visualizations.pptx).
- [Session 6: Communication](../../Samlet/CourseMaterials/Theory/session06-effective-communication.md) and [Session 6 slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%286%29%20-%20Effective%20Communication.pptx).
- [Session 7: Radial theory](../../Samlet/CourseMaterials/Theory/session07-radial-visualizations.md) and [Session 7 workshop slides](../../Samlet/CourseMaterials/PowerPoints/VIZ1%20%287%29%20-%20Visualization%20Workshop.pptx).
- [Official D3 arc reference](https://d3js.org/d3-shape/arc), [pointRadial reference](https://d3js.org/d3-shape/symbol#pointRadial) and [linear/radial scales](https://d3js.org/d3-scale/linear): API behaviour checked against official documentation through Context7.

Source caution: Session 6 slide 15 contains a conflicting statement about hue and sequential data. Follow the course's expressiveness distinction: named colours are categorical; ordered magnitude is carried by position/length, not an arbitrary hue sequence. Similarly, scaleRadial is for area-proportional radius, not a universal requirement for every radial chart.
