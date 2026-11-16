# VIZ1 – Session 9: Visualization Architecture (D3 + React)

Slides: *VIZ1 (9) – Visualizations and Frameworks* (Ole I Hougaard). The title slide calls the session **Visualization Architecture**.
There is no book chapter this time. Munzner's framework is about *what* to show and *why*, and it doesn't care which library draws it. This session is about how the code is organized.
Reference: the React docs on [`useState`](https://react.dev/reference/react/useState), [`useEffect`](https://react.dev/reference/react/useEffect), [`createContext`](https://react.dev/reference/react/createContext) / [`useContext`](https://react.dev/reference/react/useContext), [custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) and [rendering lists](https://react.dev/learn/rendering-lists) (the `key` prop), plus the [Vite guide](https://vite.dev/guide/).

**The one-sentence summary:** in Sessions 4–8 we built the Model-View-Update pattern by hand. React gives us that pattern ready-made: **state** (`useState`), **components**, and **automatic re-rendering**. D3 keeps doing what it's best at: **data, scales, shapes, axes and transitions**. The recommended split is the **hybrid** approach: React owns the state and the component tree, and each component is drawn either by React (JSX) or by D3 (inside `useEffect`).

---

## 1. Problems with pure D3 (slide 2)

| Problem | What it means in practice — e.g. in HandIn02 |
|---|---|
| **You need to link to the full library.** Hosted where? Or downloaded? | HandIn02 has `<script src="https://d3js.org/d3.v7.min.js">`. That's the whole library (about 280 kB minified), even though we use a fraction of it. A CDN link breaks offline; a downloaded copy has to be updated by hand. |
| **You can't manage libraries with npm or yarn** | No `package.json`, so no version numbers, no `npm update`, and every third-party script (rSlider, `tooltip.js`) is another `<script>` tag in the right order. |
| **It is hard to create reusable components** | HandIn02's `tooltip.js` only works because `margin` and `innerHeight` happen to be **global variables** in `main.js`. You can't drop it into another project, or use two tooltips on one page. |
| **You must handle state management manually** | `let model`, `update(patch)`, `view()` — all hand-written. That includes the stale-closure bug (the tooltip handler reading an old `model`). |
| **It doesn't scale well** inside a larger application | Fine for one chart on one page; messy when the chart is one part of an app with menus, routing, forms and several charts sharing a filter. |

---

## 2. What a framework does for us (slide 3)

Every row is something we already did **by hand** in [Session 4](session04-interactivity.md):

| Framework job | By hand (Session 4, HandIn02) | In React |
|---|---|---|
| **State management** | `let model = {...}`, `update(patch)` merges a patch | `const [state, setState] = useState(...)` |
| **Component structure** | Functions: `initLegend`, `initSlider`, `initViz`, … | Components: `<Legend>`, `<Filters>`, `<Streams>`, … |
| **DOM element creation** | `append` / `join` | JSX: `<rect width={…} />` |
| **When to re-render** | We call `view()` at the end of `update()` | Automatically, every time state is set |
| **What happens on re-render** | `view()` redraws what changed | The component function runs again and returns new JSX |
| **Computing diffs for efficiency** | Enter/update/exit with a **key function** | React compares old and new JSX, using the **`key` prop** |

> **The big idea:** React *is* Model-View-Update. The **model** is state, **update** is the setter, and the **view** is the component function. So everything in Session 4 still applies; React just does the plumbing.

---

## 3. Frameworks and bundlers (slides 4–5)

**Application frameworks:** Angular, Vue, Svelte, **React** ← the course uses this.
**Bundlers:** Webpack, **Vite** ← the teacher's example uses this.

### What a bundler does
- **Bundles** your code and all its libraries into one (or a few) files.
- **Comes with a web server** for development (`npm run dev`), which reloads the page when you save.
- **Optimizes file size with tree-shaking**: anything you never use is left out of the final file. So `import * as d3 from 'd3'` doesn't cost the full 280 kB if you only use a few modules.

### Creating a React project

```sh
npm create vite@latest my-viz -- --template react      # JavaScript
npm create vite@latest my-viz -- --template react-ts   # TypeScript (the slide's version)
cd my-viz
npm install          # the packages listed in package.json
npm install d3       # adds D3, with its version saved in package.json
npm run dev          # development server
npm run build        # production build in dist/
```

- The slide also shows the Webpack route, `create-react-app`. The React team **deprecated Create React App in February 2025**, so use Vite.
- D3 is now **imported** instead of loaded with a `<script>` tag: `import * as d3 from 'd3'`.
- Data files go in the **`public/`** folder. `public/data/songs.csv` is served as `./data/songs.csv`, so `d3.csv('./data/songs.csv')` works unchanged.

### ⚠️ The tree-shaking trap: transitions vanish in the production build

I found this while testing the worked example in §10 (Vite 8, D3 7.9). Everything worked in `npm run dev`. After `npm run build`, the chart was **blank**, and the console said:

```
TypeError: selection.transition is not a function
```

**Why:**
- `.transition()` isn't part of `d3-selection`. The `d3-transition` module **adds** it to every selection as a side effect when it loads.
- The `d3` package tells bundlers it has no side effects.
- So when nothing is imported from `d3-transition` *by name*, tree-shaking removes the whole module, and the method is never added.

The dev server doesn't tree-shake, which is why it worked there.

**Fix:** one line in `src/main.jsx`:

```js
import 'd3-transition'   // adds .transition() to D3 selections
```

**Lesson:** run `npm run build` and test the built version (`npm run preview`) before you hand anything in.

---

## 4. React state management (slides 6–9)

You need four functions: `useState`, `useEffect`, `createContext` and `useContext`.

### 4.1 How does `useState` work? (the slide's question)

```js
const [state, setState] = useState(emptyState)
```

- `useState` returns a pair: the **current value** and a **setter**. `emptyState` is only used on the very first render.
- A component is just a function, and React calls it again on every render. A normal `let` variable would start over each time; `useState` **remembers** the value between calls.
  - React stores the value per component *instance*, in the order the hooks are called.
  - That's why hooks must be called at the **top level** of the component, never inside an `if` or a loop.
- Calling `setState(newValue)` doesn't change `state` right away. It **asks React to re-render**. React calls the component function again, and *that* call's `useState` returns the new value.
  - Within one render, `state` is a fixed **snapshot**.
- **Never mutate the state.** `state.model.selectedCategory = 'Pursuit'` changes the object, but React isn't told, so nothing re-renders. Always build a **new** object:

  ```js
  setState({ ...state, model: { ...state.model, selectedCategory: 'Pursuit' } })
  ```

  That's exactly the `{ ...model, ...patch }` from Session 4.

### 4.2 How does `useEffect` work?

```js
useEffect(() => {
  async function init() {
    const state = await props.state()   // e.g. load the CSV
    setState(state)
  }
  init()
}, [])
```

- The effect function runs **after** React has put the component's elements into the page. That's why D3 code goes in an effect: the `<g>` that D3 draws into exists by then.
- The **dependency array** decides *when* it runs:

| Second argument | Effect runs … | Use for |
|---|---|---|
| *(none)* | after **every** render | D3 drawing that should follow every state change (slide 12) |
| `[]` | **once**, after the first render | Loading data (slide 6) |
| `[a, b]` | after the first render, and whenever `a` or `b` changed | Redrawing only when certain values change |

- **Why the inner `async function init()`?** The effect function itself must not be `async`. It may only return nothing or a *cleanup* function, and an `async` function always returns a Promise.
- In development, `<StrictMode>` runs every effect **twice** on purpose, to expose effects that break when repeated. So the CSV is fetched twice in `npm run dev`. That's harmless and doesn't happen in the build.

### 4.3 Where does the state live? (slide 7)

1. List the components that **need** a piece of state.
2. Find their **first common ancestor**, and create the state there with `useState`.
3. Use `useEffect` to react to changes (e.g. redraw with D3).

Example from §10: `selectedCategory` is **written** by `<Filters>` and **read** by `<Legend>`, `<Streams>` and `<Overlay>`. Their first common ancestor is the chart container `<Viz>`, so that's where it lives.

React calls this *lifting state up*.

### 4.4 Sharing it: context (slide 8)

Passing state down as props through every level ("prop drilling") gets tedious. A **context** makes a value available to *every* component inside it, at any depth:

```jsx
// 1. Define the context (once, exported)
export const VizContext = createContext(emptyState)

// 2. Provide a value in the ancestor
function Viz(props) {
  // ... useState as above ...
  return <VizContext value={state}>
    {props.children}
  </VizContext>
}

// 3. Read it in any child, however deep
const state = useContext(VizContext)
```

- `<VizContext value={…}>` as a provider is **React 19** syntax. In older React (and older tutorials) it's `<VizContext.Provider value={…}>`.
- The slide closes the tag as `</VisContext>`. That's a typo, and JSX refuses to compile unless the closing tag matches the opening one.
- When the provided value changes, **every component that calls `useContext(VizContext)` re-renders**.

### 4.5 The component hierarchy (slide 9)

The slide's diagram isn't in the file, but slide 16 shows the tree it describes:

```
<Viz>                    owns the state, provides VizContext, draws the <svg>
 ├─ <Legend>             reads VizContext
 └─ <GraphArea>          margins → a translated <g>
     ├─ <Axes>           reads VizContext (scales)
     └─ <Tooltip>        owns the tooltip state, provides TooltipContext
         └─ <Bubbles>    reads VizContext (data, scales) + TooltipContext (show/hide)
```

Two contexts at two levels: chart-wide state at the top, tooltip state only around the components that trigger the tooltip.

---

## 5. Who creates the SVG elements: D3 or React? (slides 10–13)

SVG elements are DOM elements, and React can create them just as well as D3 can.

| | **D3 generates SVG** | **React generates SVG** |
|---|---|---|
| **Advantages** | Data-driven. Enter, update and exit callbacks. **Better transitions**. A large library of standard visualizations (axes, brushes, zoom) | Clean element syntax (looks like the SVG it produces). Component structure. React's rendering optimizations |
| **Disadvantages** | Clunky `.append().attr().attr()` syntax. No component structure. No rendering optimizations | No transitions built in. No axis generator |

### D3 inside a React component (slide 12)

```jsx
export function Bubbles() {
  const ref = useRef(null)

  useEffect(() => {
    const diagram = d3.select(ref.current)
    diagram.selectAll('circle')
      .data(...)
      .join('circle')
      // ...
  })                          // no array: redraw after every render

  return <g ref={ref}></g>    // React creates the empty <g>, D3 fills it
}
```

- The slide selects by id (`d3.select('#bubbles')`). A **`useRef`** is safer: an id must be unique on the page, so using the component twice would make both copies draw into the first `<g>`. `ref.current` is *this* component's own element.
- **Rule:** React creates the container; **D3 owns everything inside it**. React must never render children into a `<g>` that D3 also manages, or each will undo the other's changes.

### React generating SVG (slide 13)

```jsx
<g opacity={opacity} transform={`translate(${x}, ${y})`}>
  <rect width='160' height='20' fill='cornsilk' stroke='black' strokeWidth='1'></rect>
  <text x='5' y='15'>{tooltipText}</text>
</g>
```

JSX is *almost* SVG. The differences that bite:

| SVG / HTML | JSX |
|---|---|
| `class="grid"` | `className='grid'` |
| `stroke-width`, `text-anchor`, `font-weight` | `strokeWidth`, `textAnchor`, `fontWeight` (camelCase). The slide's `stroke-width` makes React print a warning |
| `style="fill: red"` | `style={{ fill: 'red' }}` (an object) |
| `role`, `aria-labelledby`, `aria-label` | **unchanged**: `role` and `aria-*` keep their hyphens |
| A list of elements | `data.map(d => <circle key={d.id} … />)`. **`key` is required** |

> React's **`key`** prop is the same idea as D3's **key function** ([Session 4](session04-interactivity.md), "The importance of the key function"). It tells React which element belongs to which datum, so filtering or reordering doesn't mix them up. Use a real identifier, not the array index.

---

## 6. Three ways to combine D3 and React (slide 14)

| Approach | React does | D3 does | Downside |
|---|---|---|---|
| **1. D3 generates all content** | State, and the non-viz part of the page | All of the SVG | No component structure in the chart |
| **2. React generates all content** | All of the SVG | Data transformation and formatting, scales, shapes (stacks, arc generators, …) | You give up D3's transitions and axes |
| **3. Hybrid** ✅ | State management **and** component structure | Each component is drawn by **either** D3 **or** React | — |

**Choosing per component in the hybrid approach:**
- **D3** when the component needs **transitions** or a D3 generator that creates DOM itself: `d3.axisBottom`, `d3.brush`, `d3.zoom`, enter/exit fades.
- **React** for things whose structure is simple or mostly static: legends, labels, tooltips, invisible overlay rects, and all **HTML controls** (`<select>`, sliders).
- **D3 does the data and maths everywhere.** `d3.rollup`, `d3.stack`, scales and `d3.format` work the same in both. Shape generators return a **path string**, so they work in JSX too:

  ```jsx
  <path d={arc(slice)} fill={colorScale(slice.data.key)} />
  ```

  (`d3.arc` / `d3.pie` from [Session 7](session07-radial-visualizations.md).)

---

## 7. The chart container (slides 15–17)

The slides' recommended building block is **one component that owns the state** and gives it to everything inside it:

```jsx
export const VizContext = createContext(emptyState)

export function Viz(props) {
  const [state, setState] = useState(emptyState)

  useEffect(() => {                       // load once
    async function init() {
      const state = await props.state()
      setState(state)
    }
    init()
  }, [])

  function update(patch) {                // Session 4's update(patch)
    const model = { ...state.model, ...patch }
    setState({ ...state, model })
  }

  return <VizContext value={{ state, update }}>
    <svg>{props.children}</svg>
  </VizContext>
}
```

Used like this (slide 16):

```jsx
<Viz viewBox={viewBox} state={loadState}>
  <Legend left='600' top={100} />
  <GraphArea viewBox={viewBox} margins={{ left: 10, top: 10, bottom: 100, right: 200 }}>
    <Axes />
    <Tooltip>
      <Bubbles />
    </Tooltip>
  </GraphArea>
</Viz>
```

- **`props.children`** is whatever is written between the opening and closing tags. That's what makes `<Viz>`, `<GraphArea>` and `<Tooltip>` **wrapper components**: they add something (state, a margin transform, a tooltip) around children they know nothing about.
- `state={loadState}` passes the **function**, not its result. The container calls it in its effect.
- The **state** holds the same two things as Session 4: `state.model` (data plus selections) and `state.viz` (scales).

### ⚠️ The stale-state trap, the same bug as in HandIn02

Slide 15's `update` reads `state` from the render in which it was created. That's fine for React event handlers, because they're re-created on every render.

But suppose D3 registers a handler **once**, inside an effect with `[]`:

```js
useEffect(() => {
  d3.select(ref.current).selectAll('circle').on('click', (e, d) => update({ selected: d.id }))
}, [])
```

That handler keeps the **first** render's `update`, which spreads the **first** render's `state`. Every click then rebuilds the state from the original and silently undoes all later changes.

This is exactly HandIn02's stale `model` in the tooltip handler. **The fix** is the function form of the setter, which always receives the newest state:

```js
function update(patch) {
  setState(state => ({ ...state, model: { ...state.model, ...patch } }))
}
```

### Custom hooks (slide 17)

```js
export function useViz() {
  const { state } = useContext(VizContext)
  return state.viz
}

// in any component:
const { whoRegionScale } = useViz()
```

- A **custom hook** is just a function whose name starts with `use` and which calls other hooks.
- It hides *where* things live. Components ask for "the viz", not "context → state → viz". If the state is reorganized later, only the hook changes.

> **Lint warnings you'll see** with Vite's default linter, and why you can ignore them here:
> - "*Fast refresh only works when a file only exports components*" appears because the context and hooks are exported from the same file as the component. It only affects hot-reload in development. To silence it, move the context and hooks to their own file.
> - "*React Hook useEffect has a missing dependency: 'props'*" appears on the `[]` effect. Loading once is intended.

---

## 8. A tooltip in React (slides 18–21)

```jsx
export const TooltipContext = createContext(null)

export function Tooltip(props) {
  const [tooltipText, setTooltipText] = useState('')
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [opacity, setOpacity] = useState(0)

  function showTooltip(x, y, text) {
    setX(x); setY(y); setTooltipText(text); setOpacity(1)
  }
  function hideTooltip() {
    setOpacity(0)
  }

  return <TooltipContext value={{ showTooltip, hideTooltip }}>
    {props.children}
    <g opacity={opacity} transform={`translate(${x}, ${y})`}>
      <rect width='160' height='20' fill='cornsilk' stroke='black' strokeWidth='1'></rect>
      <text x='5' y='15'>{tooltipText}</text>
    </g>
  </TooltipContext>
}
```

And in a (D3-drawn) child (slide 21):

```js
const { showTooltip, hideTooltip } = useContext(TooltipContext)
circles.on('mouseleave', hideTooltip)
```

Why it's built this way:
- **The tooltip's state is local.** Only `<Tooltip>` and its children re-render while the mouse moves. The rest of the chart doesn't.
- **It wraps its children for two reasons:**
  1. A context only reaches components *inside* its provider.
  2. `{props.children}` comes **before** the tooltip `<g>`, so the tooltip is drawn **on top**. That's SVG's painter's order, the same reason HandIn02 appends the tooltip last.
- **The children don't know how the tooltip looks.** They only call `showTooltip` and `hideTooltip`, so the tooltip can be redesigned without touching the chart. This is the reusable component that HandIn02's global-variable `tooltip.js` couldn't be.
- Add `pointerEvents='none'` on the tooltip `<g>`, so it never sits between the mouse and the marks.
- A hover-only tooltip is still unreachable without a mouse ([Session 8 §8.3](session08-explanatory-approach.md)). In React the fix is a few props: `tabIndex={0}`, `onFocus` and `onKeyDown`. See §10.3.

---

## 9. Conclusion (slide 22)

| Advice | Why |
|---|---|
| **Prefer the hybrid method** | React's structure *and* D3's transitions and axes |
| **Create a chart container** | One place owns the state, just like `createViz` did |
| **Use contexts to provide access to the state** | No prop drilling. Any component at any depth can read or update |
| **Use custom hooks** | Components don't depend on how the state is organized |
| **Use wrapper components with `props.children`** | Reusable pieces (`<GraphArea>`, `<Tooltip>`) that add behaviour around any content |

---

## 10. Worked example: the exercise, with HandIn02 ported

The exercise (slide 23):
1. Find a viz from earlier (not too complex).
2. Design a component structure for it.
3. Decide which components work best React-generated and which D3-generated.
4. Create a React project.
5. Port the code.

Here it is done with the **HandIn02 stream graph**. I built it with Vite 8, React 19 and D3 7.9, and tested it in headless Chrome.

### 10.1 Component structure and the D3/React decision (steps 2–3)

```
<App>
 └─ <Viz state={loadState}>          container: model + viz in useState, VizContext, update()
     ├─ <Filters>        React  — <select> + two range sliders → update({...})
     ├─ <Legend>         React  — HTML list, grey swatch when not shown
     └─ <Chart>          React  — <svg> with role="img", <title>, <desc>, margin <g>
         ├─ <Grid>       D3     — d3.axisLeft(...).tickSize(-innerWidth)
         ├─ <Streams>    D3     — stack + area, enter/exit fades
         ├─ <Axes>       D3     — d3.axisBottom with a transition; labels in JSX
         └─ <Tooltip>    React  — tooltip state, TooltipContext
             └─ <Overlay> React — transparent rect: mouse and keyboard
```

| Component | Drawn by | Reason |
|---|---|---|
| `Filters`, `Legend` | React | HTML, no animation. JSX is shorter than D3 here |
| `Chart` | React | Static wrapper. The ARIA attributes from Session 8 read naturally in JSX |
| `Streams` | **D3** | Needs enter/exit **fades** and a `d` transition — D3's strength |
| `Axes`, `Grid` | **D3** | `d3.axisBottom` / `d3.axisLeft` generate DOM, and React has no equivalent |
| `Tooltip`, `Overlay` | React | Exactly slides 18–21 |

The data work, `formatDataGroups` with `d3.rollup`, is copied **unchanged** into `loadState.js`, which returns `{ model, viz }`.

### 10.2 Project setup (step 4)

```sh
npm create vite@latest streamgraph-react -- --template react
cd streamgraph-react
npm install
npm install d3
# copy the CSV to public/data/
# add  import 'd3-transition'  to src/main.jsx (§3)
npm run dev
```

### 10.3 The code that matters (step 5)

**The container** follows slide 15, with two changes: it shows "Loading…" until the data is in (instead of an `emptyState`), and `update` uses the function form (§7):

```jsx
export function Viz(props) {
  const [state, setState] = useState(null)

  useEffect(() => {
    async function init() {
      const state = await props.state()
      setState(state)
    }
    init()
  }, [])

  function update(patch) {
    setState(state => ({ ...state, model: { ...state.model, ...patch } }))
  }

  if (state === null) return <p>Loading…</p>

  return <VizContext value={{ state, update }}>
    {props.children}
  </VizContext>
}

export function useModel()  { return useContext(VizContext).state.model }
export function useUpdate() { return useContext(VizContext).update }
export function useViz() {
  const { state } = useContext(VizContext)
  // The x-scale depends on the selected years, so it is made on every render
  const xScale = d3.scaleLinear().domain(state.model.selectedYears).range([0, innerWidth])
  return { ...state.viz, xScale }
}
```

The container doesn't draw the `<svg>` itself (unlike slide 15), because `<Filters>` and `<Legend>` are HTML and must sit *outside* the SVG. `<Chart>` draws it instead.

**A D3-generated component.** HandIn02's `view()` join moves into an effect, almost line for line:

```jsx
export function Streams() {
  const ref = useRef(null)
  const model = useModel()
  const viz = useViz()

  useEffect(() => {
    const [startYear, endYear] = model.selectedYears
    const visibleYears = model.yearlyData.filter(d => d.year >= startYear && d.year <= endYear)
    const stacks = d3.stack().keys([...visibleKeys(model)].reverse())(visibleYears)
    const area = d3.area()
      .x(d => viz.xScale(d.data.year))
      .y0(d => viz.yScale(d[0]))
      .y1(d => viz.yScale(d[1]))
      .curve(d3.curveMonotoneX)

    d3.select(ref.current).selectAll('path')
      .data(stacks, d => d.key)
      .join(
        enter => enter.append('path')
          .attr('fill', d => viz.colorScale(d.key))
          .attr('d', area)
          .style('opacity', 0),
        update => update,
        exit => exit.transition().duration(duration).style('opacity', 0).remove()
      )
      .transition()
      .duration(duration)
      .style('opacity', 1)
      .attr('d', area)
  })

  return <g ref={ref}></g>
}
```

**A React-generated component.** The legend that took `initLegend` plus four lines in `view()` is now one function:

```jsx
export function Legend() {
  const model = useModel()
  const viz = useViz()
  const keys = visibleKeys(model)

  return <ul className='legend'>
    {songCategories.map(category =>
      <li key={category} className={category === model.selectedCategory ? 'selected' : ''}>
        <span className='legend-color'
          style={{ backgroundColor: keys.includes(category) ? viz.colorScale(category) : '#eeeeee' }}></span>
        {category}
      </li>
    )}
  </ul>
}
```

**The overlay**, with keyboard access added (Session 8's review flagged HandIn02's hover-only tooltip):

```jsx
export function Overlay() {
  const { showTooltip, hideTooltip } = useContext(TooltipContext)
  const model = useModel()
  const viz = useViz()
  const [year, setYear] = useState(model.selectedYears[0])

  function showYear(year) { /* find the row, build [label, value] pairs, setYear(year), showTooltip(...) */ }

  function onMouseMove(event) {
    const [mouseX] = d3.pointer(event, event.currentTarget)
    showYear(Math.round(viz.xScale.invert(mouseX)))
  }

  function clamp(year) {
    const [startYear, endYear] = model.selectedYears
    return Math.max(startYear, Math.min(year, endYear))
  }

  function onKeyDown(event) {
    if (event.key === 'ArrowRight') showYear(clamp(year + 1))
    if (event.key === 'ArrowLeft') showYear(clamp(year - 1))
  }

  return <rect width={innerWidth} height={innerHeight} fill='transparent' tabIndex={0}
    onMouseMove={onMouseMove} onMouseLeave={hideTooltip}
    onKeyDown={onKeyDown} onFocus={() => showYear(clamp(year))} onBlur={hideTooltip}></rect>
}
```

`d3.pointer` works on React's event object too. Pass the target explicitly (`event.currentTarget`) so the coordinates are relative to the rect.

### 10.4 What changed compared with HandIn02

| HandIn02 | React port | Why |
|---|---|---|
| `<script>` tags for D3, rSlider and `tooltip.js` | `npm install d3`, `import` | §1, §3 |
| `let model` + `update()` + `view()` | `useState` in `<Viz>` + function-form `update` | §2, §7 |
| The tooltip handler read a stale `model` (worked around via the closure) | `setState(state => …)` can't go stale | §7 |
| rSlider (a non-React library) | Two `<input type="range">` (From / To) | Simpler than wrapping a third-party widget in an effect |
| `tooltip.js` with global `margin` / `innerHeight` | `<Tooltip>` + `TooltipContext` | Reusable, no globals |
| Tooltip box sized with `getBBox()` | Fixed width, height from the line count | Simpler in JSX |
| Hover-only tooltip | Also **Tab** to the chart and use the **← →** keys | Session 8 §8.3 |

**Tested** (production build, headless Chrome):
- 8 streams drawn in the same colours.
- Choosing *Heartache* leaves 1 stream and greys 7 legend swatches.
- The "From" slider set to 2000 moves the axis to start at 2000.
- Hovering shows *Year: 2012, Heartache: 7*, and two → presses show *2014, Heartache: 4*. Both match the CSV.
- Back to *All* brings 8 streams back.
- No console errors, once the `d3-transition` import was added.

---

## 11. Checklist

- [ ] The project is created with **Vite**, and D3 is installed with `npm install d3` and imported.
- [ ] `import 'd3-transition'` is in `main.jsx` if you use transitions, and you've tested `npm run build` + `npm run preview`.
- [ ] The state lives in the **first common ancestor** (the chart container) and is shared through a **context**.
- [ ] Custom hooks (`useModel`, `useViz`, …) are used instead of reaching into the context everywhere.
- [ ] State is never mutated. `update` uses `setState(state => …)` if anything calls it from a D3 handler.
- [ ] Each component is drawn by **either** React **or** D3. D3 components return an empty `<g ref={ref}>` and draw in `useEffect`.
- [ ] Lists in JSX have a meaningful **`key`**, and D3 joins have a **key function**.
- [ ] JSX attributes are camelCase (`strokeWidth`, `textAnchor`, `className`), except `role` and `aria-*`.
- [ ] The tooltip wraps its children (context + drawing order) and has `pointerEvents='none'`.
- [ ] The chart is reachable without a mouse (focus + keys, or a data table), and the `<svg>` has `role`, `<title>` and `<desc>` (Session 8).
