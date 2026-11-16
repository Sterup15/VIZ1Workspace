THE BOYBAND BLUEPRINT - MATCHING OUTFITS?

RUN
Open this folder in VS Code and use Live Server on index.html.
Use HTTP, not file://: the app fetches boys.csv and uses ES modules.
No build or package installation is required. D3 7.9.0 is bundled locally
with its ISC licence and provenance in js/vendor.

CURRENT DESIGN
Question: Which clothing colours do bands share, and how closely do their
outfits match?

- Choose Bottoms or Shirts. Each band has one pin, grouped by its most common
  colour. Ties belong to a separate striped mixed sector. Arc width counts bands.
- Filtering selects these same most-common-colour groups, not every colour a
  member happens to wear. It does not recalculate scores or move remaining pins.
- Read dots against the directly labelled 0%, 50% and 100% score guides.
  Spokes associate dots with colour sectors; their full length is not the score.
- The ring and vertical slider share a gamma-corrected colour blend. Intermediate
  shades are visual aids, not dataset categories. Patterned uses checks; mixed
  uses stripes and is a derived tie group, not a recorded clothing colour.
- Drag the pin to filter; arrow keys step between categories, Home/End select
  endpoints. The exact pin position persists within a category without restarting
  chart animation. All colours restores the overview. Arc clicks toggle a filter.
- Garment changes preserve available filters and clear incompatible selections.
  Band choices and the visible distinct-band count follow the filter.
- Select a pin with pointer, Enter or Space, or use the band selector. The right
  legend shows its pair score, matching colours, and each colour's percentage of
  known members. Member names are available in a compact disclosure.
  Hover/focus previews the name; Escape dismisses the tooltip.
  Clear selection preserves garment/filter and returns focus to the selector.
- Changes animate over 450ms and can be interrupted. Reduced-motion preferences
  render immediately. Static colour geometry and score labels rebuild only on
  garment changes, keeping slider interaction light and the scale stationary.
- Desktop places the filter left, circle in the middle and legend right. The
  chart and slider scale to viewport height. Narrow screens move the legend below.

DATA AND LIMITATIONS
234 member records in 55 bands, not necessarily 234 distinct people.
Matching score = matching known-colour member pairs / all known-member pairs.
Missing colours never match. Fewer than two known colours is unavailable,
not zero: such bands remain in colour counts when a colour is known and can
be inspected with the selector, but do not get a misleading zero-score dot.
Black and navy blue remain distinct. Patterned matches category names, not
necessarily actual patterns. Swatches are approximate named categories, not
measured shades. Recorded looks do not establish intention or causation.

The circle earns structure through proportional most-common-colour sectors and a
deliberate hue order, not a claim that clothing data is cyclic. A straight
common scale remains more accurate for numerical reading. The gradient bar is
a colour filter, not a frequency chart.

This is a visualization-only assignment. Test files and runners have been removed;
iteration uses brief visual inspection rather than an automated test workflow.

FILES
index.html          Current radial chart, colour slider, reading guide and errors.
css/main.css        Responsive layout, focus, chart and member-evidence styles.
js/model.js         Validated CSV, pair scores, colour counts/layout and state.
js/view.js          D3 colour flow, sectors, points, slider and member evidence.
js/main.js          Loading, interaction updates, announcements and tooltips.
boys.csv            Unchanged course dataset.
js/vendor/          Local D3 distribution, provenance and licence.
handin3-plan.md     Current revision record followed by historical designs.
Handin3.docx        Earlier reflection; not yet updated for this colour revision.

THEORY / HAND-IN
Reviewed the course description, all nine theory notes, text from all 224 lecture
slides, six exercise documents and both shared hand-in briefs. Embedded lecture
illustrations were not systematically inspected. Textbook reading covered relevant
excerpts on marks/channels, perception, colour, interaction and radial layouts,
not the entire book.
All edits remain inside Marcus/Handin03; shared course material is read-only.
At least three encodings: sector angle for band counts, radial position for
matching score, hue/texture for most-common-colour groups.
The gradient slider supports filtering without changing those radial encodings.
Handin3 requires meaningful arcs, deliberate encodings, a reading guide,
interaction, structured code and reflection; animation is an optional refinement.
Update the final reflection for this design before submission. No new peer
feedback, native browser zoom, screen-reader testing or other-engine testing
is claimed. Check itslearning for final submission requirements.
