# Superficial Boyband Visualizer 3000: Reflection

Hand-in 3, *The Boyband Blueprint*. Rasmus Sterup.

## How to run

Open the index.html file with something like VS Code's Live Server.

Files:
- `index.html`: page structure and reading guide
- `js/data.js`: turns the 234 member rows into 55 bands, each with a signature colour and a uniformity score per attribute
- `js/colors.js`: colour names to hex values, and where each colour sits on the wheel
- `js/main.js`: the visualization (model, update and view functions)
- `css/main.css`: styling

---

## Step 1: Visualization question

**My visualization will investigate** how alike the members of each boyband look, and in which colour. For each band I find its *signature colour* (the colour most members wear or have) and its *uniformity* (the share of members with that colour).

**The most important data attributes are** `band`, `shirt_color`, `jacket_color` and `bottom_color` (combined into *overall outfit*), and `hair_color`, `eyes` and `skin`.

**The reader should first notice** where the bands cluster on the colour wheel (which colours bands choose) and how far out the dots are (how uniformly they dress).

**The reader should then be able to explore** each attribute on its own, a part of the colour wheel, and a single band's members and its "colour neighbours".

## Step 2: Marks and channels

| Data attribute | Mark | Channel | Why this choice? |
|---|---|---|---|
| Signature colour (per band) | Dot (circle) | Angle around the wheel | The colour wheel is the natural, familiar layout for colour. Similar colours end up next to each other, so clusters are visible. |
| Signature colour (per band) | Dot, stem | Colour hue (fill) | The dot is filled with the colour it stands for, so the reader can read it without a legend. The stem links it back to its place on the wheel. |
| Uniformity (0–100%) | Dot | Distance from the wheel (radius) | Position along a common scale is the most accurate channel for a quantitative value. The dashed 25/50/75/100% rings work as a radial axis. |
| Number of bands per signature colour | Arc block in the ring | Arc length | Colours chosen by many bands get a wider block, so popularity can be read from the ring itself, and the dots of that colour get room to spread out. |
| Selected band | Dot and label | Size, text | A larger dot and its name make the selection easy to find again after changing attribute. |
| Member colours (in the details panel) | Small figure built from rectangles | Colour, position on the body | Shows the actual outfit and looks of each member, so the reader can check the score against the raw data. |

## Reading order (visual hierarchy)

1. **First**, the coloured ring and the colour labels with counts, e.g. "navy blue (11)", show which signature colours exist and how common they are.
2. **Second**, the dots' distance from the ring shows how uniform each band is. The guide rings give the scale.
3. **Third**, hover or click a single dot for the details: the tooltip, the details panel with member figures, and other bands with the same signature colour.

The guide text above the chart, the centre label (attribute and "x of 55 bands") and the note about hidden bands support this order.

---

## Reflection

**What question or insight did your visualization communicate?**
How uniform boybands are, and in which colours. The overall outfit is on average 71% uniform, and 14 of the 55 bands dress completely alike. Bottoms are the most uniform garment (84% on average, 35 bands at 100%, mostly navy blue or black), and jackets the least (59%). The most important finding is that boybands mostly coordinate in *non-colours*: for the overall outfit, 41 of the 55 bands have white, grey or black as their signature colour.

**Which marks did you choose, and why?**
Points (dots) for bands, because a band is a single item and a point can be placed exactly in two dimensions (angle and radius). Lines (stems) connect each dot to its colour on the wheel, so the dot can move outward without losing its colour position. Arcs form the colour wheel, which acts as the axis for colour. In the details panel, a small figure made of rectangles shows each member, because the clothing attributes map naturally to body parts.

**Which channels did you choose, and why?**
- **Angle** for signature colour, because hue is itself circular, so a wheel is the expected way to show it.
- **Radius** (distance from the wheel) for uniformity, because position on a common scale is the most accurate channel for a number.
- **Colour hue** for the colour itself, because it is redundant with the angle but makes the chart readable without a legend.
- **Arc length** for the number of bands per colour.
- **Size** to highlight the selected band.

**What does the arc structure represent in your design?**
The ring is a colour wheel and works as the categorical axis of the chart: angle = colour. It is *stretched* where there are bands: each shown band gets an equal share of the circle at its colour, so a colour with many bands gets a wide block and unused colours shrink to a thin strip. The arc length therefore encodes how many bands share a signature colour, and the dots get room so they don't overlap. White, grey and black have no hue, so they have their own white-to-black wheel. Both wheels are shown by default, each on half of the circle, because 41 of the 55 bands have a greyscale overall signature colour; either wheel can be turned off to give the other the whole circle.

**Which attributes from the dataset did you choose to visualize, and why?**
`shirt_color`, `jacket_color` and `bottom_color` (alone and as *overall outfit*), and `hair_color`, `eyes` and `skin`. They are all colour attributes, so they share one encoding (the colour wheel) and can be compared by switching the dropdown. Matching outfits are a key part of the boyband "blueprint", so uniformity is a natural question to ask.

**Which attributes did you choose not to visualize, and why?**
- `height` and `dob`: quantitative attributes that need a different encoding than the colour wheel, and would answer a different question.
- `hair_frosted`, `hair_length`, `hair_style`, `facial_hair`, `accessories`, `top_style`, `bottom_style`, `instrument`: style categories, not colours. Adding them would take a second categorical channel (e.g. shape) and make a dense radial chart harder to read.
- `name` is only shown in the details panel, as a label.

**What interaction did you implement, and how does it support the reader?**
- **Hover/focus tooltip:** shows the band's name, signature colour and how the score is calculated (e.g. "4 of 5 members wear it"), without cluttering the chart with 55 labels.
- **Click a dot:** opens a details panel with a table of all attributes, a figure per member, and other bands with the same signature colour. This is *details on demand*, and lets the reader check the score against the raw data.
- **Attribute dropdown:** the same layout for every attribute, so the reader can compare e.g. how uniform shirts are compared to hair. Dots animate to their new position, so the selected band can be followed.
- **Colours / Greyscale toggles and the range slider:** filter and zoom into part of the wheel. A note tells the reader how many bands are hidden and why.
- All dots and slider handles can also be used with the keyboard.

**What would you improve if you had more time?**
- Treat closely related colours (e.g. navy blue and dark blue) as partial matches. Today they count as completely different, which lowers some uniformity scores.
- Show two attributes side by side instead of switching, to compare them directly.
- Include D3 in the project folder, so the page also works offline.
- The stretched wheel makes angle no longer proportional to hue, which can be confusing. Test with readers whether the extra space is worth that.
- Add a measure of each band's success, for example chart positions, record sales or streams, from another source. That would make it possible to test hypotheses about whether a band's colours or uniformity correlate with how successful it was.
