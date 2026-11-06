THE BOYBAND BLUEPRINT - MATCHING OUTFITS?

TWO DESIGNS TO COMPARE
- index.html: the original full-circle point plot, kept unchanged.
- comparison.html: the separate five-wheel alternative. Its navigation links
  back to the original; open the two pages in separate tabs to compare.
Both use the same boys.csv and matching-pair calculation. The alternative is
not yet a replacement for the design described in the current Word reflection.

RUN
Open this folder in VS Code and use Live Server on index.html or comparison.html.
Use an HTTP URL, not file://: the app fetches boys.csv and uses ES modules.
No build, package install, account or network access beyond the local server is
required. D3 7.9.0 and its ISC licence are included in js/vendor.
Use a current Chrome, Edge, Firefox or Safari browser.

ORIGINAL INTERACTIONS
- Bottoms/Shirts changes the recorded clothing attribute.
- A labelled group key or inner arc emphasises one band-size group. Other bands
  remain visible in neutral grey; all arcs retain their original colours/widths.
  Activate the same group again, or All, to restore all group colours.
- Choose a band with the native selector, or click/keyboard-activate its point.
- Hover/focus shows a tooltip; Escape dismisses it. Selection persists.
- Selecting a muted band moves group focus to it. Focusing a different group
  clears an incompatible selection and announces the change.
- All preserves clothing and selection. Clear selection hides member details
  without changing clothing or group focus, and restores focus to the selector.
- On wide screens (1160px and above), the circle is on the left and selected-band
  information is on the right. Narrow screens stack details below the chart.
  The chart does not move when details open. Formula/limitations and the optional
  category summary use native disclosures; essential reading help stays visible.
- On narrow screens only the chart scrolls horizontally. The selector gives a
  keyboard/touch alternative to small points.

COMPARISON WHEELS
- One wheel for each band size. Outer blue track = bottoms; inner orange = shirts.
- Each band gets one aligned slot on both tracks. Within that slot, the filled
  angular fraction is its matching-pair score. Unfilled means non-matching.
- Centre values are arithmetic means of available band scores, with each band
  equally weighted. They are not pooled member-pair percentages.
- Sample sizes are explicit. Hatched slots mean unavailable, not zero.
  Incomplete colours are flagged in the group notes and selected-band evidence.
- Select a slot with pointer or Enter/Space, or use the native band selector.
  Both garment scores, pair counts and member categories appear together.
  Hover/focus previews scores; Escape dismisses; Clear restores selector focus.
- Wheels and evidence are side by side when there is room and stack on narrow
  screens. Compare proportions within slots, not raw lengths across wheels:
  more bands produce narrower slots, and the outer track has a larger radius.
- The original page and its model/view/style files were not changed to add this
  alternative. Both use the existing validated parsing and band summaries.

TEST
1. Open tests/model.test.html through the same HTTP server.
2. Open tests/ui.test.html through the same server for interaction/error tests.
   Open tests/wheels-ui.test.html for the alternative's model and browser checks.
3. Or, from the repository root with Node 22.7+ (verified with Node 25.5.0):
   node Marcus/Handin03/tests/run.mjs
   (Inside this folder: node tests/run.mjs)
The Node runner covers both designs' model/geometry tests; UI tests need a browser.
No test framework is required.
Verified on 6 November 2026: 70 model tests (54 original + 16 wheel tests) passed.
The original browser suite passed 27/27; the alternative browser page passed
33/33 (16 wheel model tests + 17 UI tests). The earlier full-circle revision
also passed a standalone-copy check; no new standalone-copy check is claimed
for the comparison-wheel alternative. See handin3-plan.md for the scope.

FILES
index.html            Semantic UI and explicit startup error boundary.
css/main.css          Layout, chart, legend, details, focus and responsive styles.
js/model.js           Strict CSV validation, grouping, pair counts, modes,
                      deterministic angles, group colours and state/focus rules.
js/view.js            D3 SVG marks and keyed DOM updates.
js/main.js            Loading, central state updates, controls and tooltips.
comparison.html       Separate comparison-wheel page and reading support.
css/comparison.css    Independent wheel-page layout and responsive styling.
js/wheels-model.js    Equal-weight group means and within-band arc geometry.
js/wheels.js          Five wheels, selection, previews and two-garment evidence.
boys.csv              Original course-provided dataset, unchanged.
js/vendor/            Pinned D3 distribution, provenance manifest and licence.
tests/                Fixture, supplied-data, geometry and browser checks.
Handin3.docx          Original brief, student plan and implementation reflection.
handin3-plan.md       Detailed design specification and current implementation status.

DATA AND READING
234 member records in 55 bands; repeated artists may appear in different entries.
Uniformity = matching known-member pairs / all known-member pairs.
Band size counts all records; missing colours are excluded only from pair counts.
Fewer than two known colours means unavailable, never zero.
Scores display as percentages of matching pairs, not matching members.
Five strong overview colours identify labelled band-size groups; hue does not
encode numerical order. Actual clothing colours appear only in member details,
with names. Tied modes are listed in the optional category summary rather than
arbitrarily choosing one. "Patterned" uses a checker; missing uses a slashed swatch.
The contiguous 360-degree circle represents all 55 bands. Group widths equal
360 * group band count / 55, with no angular padding or opening. Starting at the
top, groups run clockwise from 3 to 7 members. Band size is not cyclic.
Uniformity maps linearly from radius 210 to 390, with guides at 0%, 50% and 100%.
Dots keep fixed sizes and angular positions. A radial guide appears only during
inspection/selection, rather than adding 55 default stems.
Overview colours exceed 4.3:1 contrast against the page; muted dots exceed 3.3:1.
Some hues converge under colour-deficiency simulations: use group labels,
spatial regions, focus controls and member evidence, not hue alone.
The chart does not establish causation, exact colour distance or intentional styling.

SOURCE / DEPENDENCY
Data: the boyband CSV supplied with the VIZ1 assignment. No external enrichment.
D3: https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js
Licence: js/vendor/D3-LICENSE. Provenance: js/vendor/manifest.json.
No other student's project or shared-folder asset is a runtime dependency.

HAND-IN
Choose the design before finalizing the reflection. Handin3.docx still describes
the original, not the comparison-wheel alternative. If choosing the alternative,
revise the reflection and include comparison.html, css/comparison.css,
js/wheels.js, js/wheels-model.js, js/model.js, the vendor library/licence and CSV.
For the original, submit index.html, css/, js/ (including the vendor licence), boys.csv,
run instructions and the final reflection in the instructor's required format.
Check itslearning for deadline, submission format and any extra requirements.
Keep original Word backups locally; do not automatically upload backups or
temporary test output. Workshop evidence and test files can accompany the
submission if permitted. The app runs independently of the workshop/plan files.
Real peer feedback and instructor-specific submission checks are still pending.
Native browser zoom, screen-reader/user testing, other browser engines and visual
Word pagination remain unverified. CSS 200% magnification is tested separately;
it must not be described as native browser zoom.
