# Matching Outfits? - Exam video manuscript

Hand-in 3, *The Boyband Blueprint*. Marcus.

**Before recording:** Open [index.html](./index.html) with Live Server. Start on **Bottoms**, with **All colours** and no band selected. Read the block quotes aloud; **[Do]** lines are screen actions. Allow roughly four minutes, including clicks and pauses.

## 1. What and why: data and task abstraction

**[Do]** Show the full page and point to the title.

> My question is: Which clothing colours do boybands share, and how closely do their outfits match? The dataset is a table with 234 member records. I aggregate those rows into 55 bands and derive two attributes for each garment: a categorical attribute, the most common recorded colour, and a quantitative attribute, the share of matching member pairs. This is exploratory: the reader can browse colour groups, compare shirts and bottoms, and look up a specific band. Hair, height and birthdays would answer a different question.

## 2. How: marks, channels and radial geometry

**[Do]** Point to the ring, the striped Mixed sector, then a pin and the score guides.

> My marks are arcs, points and connecting lines. Angular region identifies the colour group, and arc angle encodes how many bands it contains. The full circle represents all 55 bands, so this is a part-to-whole layout, not a cyclic dataset. Hue reinforces the labels and grouping; stripes identify ties without picking an arbitrary winner.
>
> The point's radial position encodes the matching-pair score on a linear scale. The zero, fifty and one hundred percent guides are direct annotations. The line links the point back to its group; its full length is not the score. The reading order is group sizes first, the distribution of scores second, and exact values in the legend when I select a band.

## 3. Overview, filtering and details on demand

**[Do]** Drag the slider until the status says **navy blue: 20 of 55 bands**. Pause, then click **All colours**.

> This follows the overview, filter, then details-on-demand part of Shneiderman's mantra. The slider filters by most common colour; it doesn't zoom, rescale or move the remaining pins. Twenty bands have navy blue as their most common bottom colour, followed by nineteen with black.

**[Do]** Choose **Shai** in **Look inside a band**. Point to the score and swatches. Open **Member records** briefly, then close it.

> Shai shows why the two derived attributes are separate. Two members wear black and two wear navy blue, so the mode is tied and the band appears in Mixed. Each colour accounts for fifty percent of the members, but only two of the six possible pairs match, giving thirty-three point three percent. The right-hand legend lets me check that aggregate against the member records.

## 4. Compare garments and reflect on the design

**[Do]** Switch **Choose clothing** to **Shirts**, leaving Shai selected. Point to its updated score, then click **Clear**.

> Shai still belongs to Mixed, but its four shirt colours are all different, so no pairs match. Across the dataset, thirty-five bands reach a hundred percent for bottoms, compared with twenty-one for shirts. Missing colours are excluded from the denominator, so a perfect score only describes the known records.
>
> In the workshop I started with band-size groups, but colour groups better fit my final question. An intermediate version gave a band a pin in every colour it wore. That showed colour membership, but the arcs represented shares of appearances, not shares of distinct bands. One pin per band makes the arc counts add up to 55, and the legend still shows every recorded colour for the selected band. The wheel makes the groups easy to browse, but an aligned dot plot would make precise score comparisons easier. I'd compare the two designs with readers.

## Exam follow-up notes (not read aloud)

- **Workshop progression:** The [Session 7 workshop](./workshop-session07.md) goes from data exploration and a question to sketching alternatives, choosing marks and channels, justifying radial geometry, and designing interaction. The [design record](./handin3-plan.md) traces the move from band-size sectors to colour sectors, and from repeated pins to one per band. A straight dot plot is a comparison alternative, not a feature in the final page.
- **Expressiveness vs. effectiveness:** Use hue and texture for categorical identity, not quantitative magnitude. Arc angle is meaningful for composition but harder to judge than aligned position. Use the same linear radial scale for both garments, then exact values for lookup.
- **D3 implementation:** The [model](./js/model.js) allocates each sector `2π × group count / total grouped bands` radians. The [view](./js/view.js) uses `d3.arc()` for the sectors and `d3.pointRadial()` to turn angle and radius into coordinates. In the **Model–View–Update** pattern, [interaction handlers](./js/main.js) update garment, filter or selection state, and the view redraws from it.
- **Score formula:** If `n` members have known colours, there are `n(n−1)/2` unordered pairs. Sum that same calculation within each category for the numerator. Fewer than two known colours means unavailable, not zero; a match is an exact category match, not perceptual colour similarity.
- **Course references:** [Session 3: aggregation](../../Samlet/CourseMaterials/Theory/session03-manipulating-data.md), [Session 4: interactivity](../../Samlet/CourseMaterials/Theory/session04-interactivity.md), [Session 5: what/why and exploratory tasks](../../Samlet/CourseMaterials/Theory/session05-exploratory-visualizations.md), [Session 6: marks and channels](../../Samlet/CourseMaterials/Theory/session06-effective-communication.md), [Session 7: radial geometry](../../Samlet/CourseMaterials/Theory/session07-radial-visualizations.md), and [Session 8: visual hierarchy](../../Samlet/CourseMaterials/Theory/session08-explanatory-approach.md).
