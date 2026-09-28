# VIZ1 – Session 4: Interactivity

Source: Tamara Munzner, *"Visualization – Analysis & Design"*.
Builds on the charts produced in [Session 3](session03-manipulating-data.md); this session makes them respond to the user.

---

## When to use interaction

Interaction is a design decision, not a default. Ask:

**What is the usage situation?**
- Repeated use or one-time?
- Quick overview or deep contemplation?
- Mobile phone or a large, mounted display? (A wall display nobody can touch cannot be interactive.)

**Who is the user?**
- Tech-savvy or casual?
- How strong is their domain knowledge?

---

## Kinds of interaction

**Selecting data** — via click/tap or hover
- To display more information (e.g. a tooltip)
- To change or add information

**Navigating data**
- **Filtering** — showing a subset
- **Zooming**
  - *Geometric* — literally scaling the picture up
  - *Semantic* — showing different/more detail at closer zoom, not just bigger marks
- **Aggregation** — changing the level at which data is grouped

---

## The Model-View-Update pattern

The state of the app consists of three elements:

| Part | Contents |
|---|---|
| **Model** | The data you need to visualize — pre-processed, aggregated, sorted, … |
| **DOM** | References to the (SVG) elements you visualize into, so you don't have to look them up by id or class every time |
| **Viz** | Scales, stacks, area generators, … |

### Creating the state

```js
const model = createModel(await loadData());
const dom = createDOM(model);
const viz = createViz(model);

const state = {
  model, dom, viz,
  update(patch) {
    state.model = { ...state.model, ...patch };
    view(state);
  }
};

view(state);
```

- You can also pass `model`, `dom`, `viz` around as individual variables.
- The `update` method ensures all functions work on the **same state**: it merges a patch into the model and re-runs the view.
- Note the use of `state.model` rather than `this.model` — so the method keeps working when it is destructured or passed as a callback.

### Code structure

- In this example, events are handled inside `view`. You could also write a separate `createEvents` function.
- Helper functions such as `drawLegend` are called from `view` and typically **destructure** the state they need.

---

## Event handlers

```js
legend
  .selectAll("rect")
  .data(d => d)
  .join("rect")
  /* attributes */
  .on('click', (e, d) => {
    update(/* patch */);
    e.stopPropagation();
  });
```

- `.on()` is not very different from `addEventListener` — but the handler also receives the **data bound to the element** as its second argument.
- D3 attaches a `__data__` property to all elements it binds data to; that's where `d` comes from.
- `e.stopPropagation()` prevents the event from also triggering a handler further up (e.g. a "click the background to deselect" handler).

### Tip: beware of duplicated elements

Calling `svg.append()` on every user interaction will **duplicate** elements each time the view re-runs. Either:
1. Create the element once in `createDOM`, or
2. Use a data join with a **singleton array**:

```js
svg.selectAll("#legend")
  .data([whoRegions])
  .join("g")
  .attr("id", "legend")
  .attr("transform", "translate(600, 100)");
```

The single-element array means the join creates the element on the first run and reuses it on every later run.

---

## Transitions

Small animations that carry the visualization from one state to the next — fade in/out, grow/shrink, move.

**Why:**
- Bringing attention to the change
- Helping the user track the change — *eyes beat memory*
- Giving a sleeker look

**But:** beware of distracting the user.

```js
dom.toolTip
  .attr('transform', `translate(${x}, ${y})`)
  .transition()
  .duration(150)
  .ease(d3.easeQuadOut)
  .style('opacity', 1);
```

- **`.transition()`** — the changes that come **after** this call are made gradually. In the example above the `transform` is applied instantly and only the `opacity` is animated (which is what you want: the tooltip should be repositioned before it fades in, not slide across the screen).
- **`.duration()`** — length of the transition in milliseconds (default 250).
- **`.ease()`** — how the transition moves through time.

### Ease functions

Easing describes how fast the transition moves at different points in time:

| Ease | Behaviour | Effect |
|---|---|---|
| `easeLinear` | Constant speed | Can seem abrupt |
| `easeQuadIn` / `easeCubicIn` | Slow first, then faster | Grabs attention, then shows the transition |
| `easeQuadOut` / `easeCubicOut` | Fast first, then slower | Shows the information quickly with a softer finish |
| `easeQuadInOut` / `easeCubicInOut` | Slow–fast–slow | A "softer" `easeLinear` |

Reference: <https://d3js.org/d3-ease>

> The slides list `easeLinear` as the default. D3's own documentation gives `easeCubicInOut` (`d3.easeCubic`) as the default for `transition.ease()` — worth knowing, but go with the course material if asked.

---

## Enter, update, exit

The one-argument `join` is shorthand for the three-argument form:

```js
// 1) shorthand
diagram.selectAll("circle")
  .data(d)
  .join("circle");

// 2) what it really does
diagram.selectAll("circle")
  .data(d)
  .join(
    enter  => enter.append("circle"),
    update => update,
    exit   => exit.remove());
```

The three selections, for finer control:
- **Enter** — the data added since the last update (no element exists for it yet)
- **Update** — the data that was already there (and may have changed)
- **Exit** — the data deleted since the last update (element exists, data doesn't)

### Combined with transitions

This is where enter/update/exit earns its keep — new elements can fade in and removed elements fade out instead of popping:

```js
diagram.selectAll("circle")
  .data(filteredData, d => d.key)
  .join(
    enter => enter.append("circle")
      .style('opacity', 0)
      .transition()
      .style('opacity', 1),
    update => update,
    exit => exit
      .transition()
      .style('opacity', 0)
      .remove());
```

Note that `.remove()` comes *after* the transition, so the element is only deleted once it has faded out.

### The importance of the key function

```js
.data(filteredData, d => d.key)
```

- In JavaScript, `{country: 'DK', age: 37} != {country: 'DK', age: 37}` — objects have no `equals()` method, so identity comparison fails.
- Without a key function, D3 matches old and new data **by array index**, which makes **no sense** when the data is filtered or reordered: the "same" circle would suddenly represent a different country.
- Adding a key function tells D3 how to identify a datum, so enter/update/exit sets are computed correctly.

---

## Exercises 4.1 – 4.3 (Exercises 4 document)

These exercises use the **RevenueStreamGraphMusicIndustry** project from [Session 3](session03-manipulating-data.md) (use the uploaded version if yours isn't complete):

1. **4.1 – Restructure the code**: reorganize the project into the Model-View-Update structure from the slides (`createModel` / `createDOM` / `createViz` / `view` / `update`).
2. **4.2 – Add event listeners**: attach handlers that, for now, just write the event and the bound data to the console. Test and inspect the output.
3. **4.3 – Add interaction**: add **filtering** and a **tooltip** to the project. Transitions may be used as you please.
