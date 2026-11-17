# Video script: Superficial Boyband Visualizer 3000

About 2–2½ minutes. **[Do]** = what to do on screen. Say it in your own words, this is just a guide.

Before recording: *Overall outfit* selected, both *Colours* and *Greyscale* ticked, no band selected, whole chart visible.

---

**[Do]** Show the title.

> Hey! This is my Superficial Boyband Visualizer 3000. The question is basically: how matchy-matchy are boybands, and in which colour? The dataset has one row per member, so I aggregate it per band and derive two attributes: a signature colour, which is the most common colour in the band, and a uniformity score, which is the share of members wearing it.

**[Do]** Point at the ring, then a dot and its line.

> The marks are simple: each band is a point, and a line connects it back to the ring. The ring is a colour wheel, colours on one half, black-white-grey on the other. It works as a categorical axis, so the angle channel encodes the band's signature colour. I chose a wheel because hue is circular anyway, so similar colours end up next to each other and clusters pop out. The dot is also filled with its colour, which is a redundant encoding, so you can read it without a legend.

**[Do]** Point at the dashed rings.

> Uniformity is quantitative, so it gets the most effective channel: position on a common scale, here the distance out from the wheel. The dashed rings at 25, 50, 75 and 100% act as a radial axis. Out here at the edge, everyone's wearing the same colour.

**[Do]** Point at a wide block in the ring.

> The wheel stretches where there are lots of bands, so arc length encodes how many bands share a colour, and the dots get room so they don't overlap. That's why navy blue is so wide. The trade-off is that angle is no longer exactly proportional to hue.

**[Do]** Hover The Wanted, then IMx.

> The interaction follows Shneiderman's mantra: overview first, zoom and filter, then details on demand. If I hover, I get the details without cluttering the chart with 55 labels. The Wanted are only 30% matching… whereas IMx are all in yellow, 100%.

**[Do]** Click IMx, scroll to the details panel.

> Clicking a band shows all the members as little figures with their actual colours, so you can check the score against the raw data, plus other bands with the same signature colour.

**[Do]** Scroll back up. Switch the dropdown to Bottom, then Hair.

> I can switch between shirts, trousers, hair and so on. The layout stays the same, and the dots animate to their new position, so it's easy to compare attributes and keep track of a band. Trousers are the most uniform, almost everyone's in navy or black.

**[Do]** Back to Overall outfit, point at the greyscale half, then untick Greyscale.

> And here's the fun bit: look how crowded the greyscale half is. 41 of the 55 bands are over here. If I filter it out, almost everything disappears. So boybands mostly match in… no colour at all.

**[Do]** Tick Greyscale again. Drag the slider a bit, then reset.

> Finally, the slider lets you zoom into part of the wheel. That's it, thanks!
