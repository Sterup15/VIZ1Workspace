// Chart size. Everything is drawn around the centre of the SVG.
const width = 760;
const height = 760;
const center = width / 2;

// The colour wheel in the middle
const ringInner = 125;
const ringOuter = 165;
// The area between the colour wheel and the big outer ring is the uniformity scale:
// 0% just outside the colour wheel, 100% at the outer ring.
const scoreInner = 175;
const scoreOuter = 345;

const duration = 600;
const degree = Math.PI / 180;
// The slider moves in steps of 5 degrees of the wheel
const sliderSteps = 72;

const ATTRIBUTE_LABELS = {
  overall: 'Overall outfit',
  shirt: 'Shirt',
  jacket: 'Jacket',
  bottom: 'Bottom',
  hair: 'Hair',
  eyes: 'Eyes',
  skin: 'Skin'
};

d3.csv('boys.csv').then(rows => {
  createViz(prepareData(rows));
});

function createViz(data) {
  let model = {
    attribute: 'overall',
    // Which wheels are shown. At least one is always on.
    wheels: { colour: true, grey: false },
    // The part of the wheel that is shown, as fractions (0-1) of the way round
    range: [0, 1],
    selectedBand: null
  };

  const uniformityScale = d3.scaleLinear().domain([0, 1]).range([scoreInner, scoreOuter]);

  // DOM
  function initDOM() {
    const svg = d3.select('#viz').append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-labelledby', 'viz-title viz-desc');

    svg.append('title').attr('id', 'viz-title').text('Boyband colour uniformity');
    svg.append('desc').attr('id', 'viz-desc')
      .text('A colour wheel with one dot per band, placed at its signature colour. ' +
            'The further a dot is from the wheel, the more alike the band members are.');

    const chart = svg.append('g').attr('transform', `translate(${center}, ${center})`);

    // Drawing order: guides at the back, then the wheel, stems, dots and labels on top
    const guides = chart.append('g').attr('class', 'guides');
    const ring = chart.append('g').attr('class', 'ring');
    const ticks = chart.append('g').attr('class', 'ticks');
    const ringLabels = chart.append('g').attr('class', 'ring-labels');
    const stems = chart.append('g').attr('class', 'stems');
    const dots = chart.append('g').attr('class', 'dots');
    const selectedLabel = chart.append('g').attr('class', 'selected-label');
    const centerText = chart.append('g').attr('class', 'center-text');

    const tooltip = d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);

    return { svg, chart, guides, ring, ticks, ringLabels, stems, dots, selectedLabel, centerText, tooltip };
  }

  const dom = initDOM();

  // Update
  function update(patch) {
    model = { ...model, ...patch };
    view();
  }

  // View
  function view() {
    const layout = computeLayout();
    drawRing(layout);
    drawBands(layout);
    drawCenter(layout);
    drawHiddenNote(layout);
    drawSlider();
    drawDetails();
  }

  // The parts of the circle, as fractions (0-1) of the way round. With both wheels on,
  // each gets half of the circle, with a small gap at the top and the bottom, so both
  // the colour cycle and the white-to-black scale stay in one piece.
  function segments() {
    if (model.wheels.colour && model.wheels.grey) {
      const gap = 0.01;
      return [
        { mode: 'colour', from: gap, to: 0.5 - gap },
        { mode: 'grey', from: 0.5 + gap, to: 1 - gap }
      ];
    }
    return [{ mode: model.wheels.colour ? 'colour' : 'grey', from: 0, to: 1 }];
  }

  // Where a named colour sits on the circle (0-1), or null when its wheel is off
  function trackPosition(colour) {
    for (const segment of segments()) {
      const t = wheelPosition(colour, segment.mode);
      if (t !== null) return segment.from + t * (segment.to - segment.from);
    }
    return null;
  }

  // The colour of the circle at a position (0-1), or null in a gap between the wheels
  function trackColour(t) {
    const segment = segments().find(s => t >= s.from && t <= s.to);
    return segment ? wheelColour((t - segment.from) / (segment.to - segment.from), segment.mode) : null;
  }

  // The names next to the slider, at their position on the circle
  function trackNames() {
    return segments().flatMap(segment => WHEEL_NAMES[segment.mode]
      .map(([name, t]) => [name, segment.from + t * (segment.to - segment.from)]));
  }

  // Is the band's signature colour on the wheel, inside the selected range?
  function isVisible(band) {
    const result = band[model.attribute];
    if (result === null) return false;
    const t = trackPosition(result.colour);
    return t !== null && t >= model.range[0] && t <= model.range[1];
  }

  // Fraction of the wheel -> angle in degrees on screen. The selected range fills the
  // whole circle, so narrowing the range spreads those colours out.
  function displayAngle(t) {
    return (t - model.range[0]) / (model.range[1] - model.range[0]) * 360;
  }

  function isFullRange() {
    return model.range[0] === 0 && model.range[1] === 1;
  }

  // Only the full colour wheel on its own is one continuous cycle, where red at the
  // end joins red at the start
  function isCycle() {
    return isFullRange() && model.wheels.colour && !model.wheels.grey;
  }

  // Works out where every band, label and tick goes
  function computeLayout() {
    const attribute = model.attribute;
    const positions = data.bands.filter(isVisible).map(band => ({
      band,
      colour: band[attribute].colour,
      target: displayAngle(trackPosition(band[attribute].colour)),
      radius: uniformityScale(band[attribute].uniformity)
    }));

    // Bands with the same signature colour sit side by side, sorted by uniformity, and
    // are pushed apart just enough that their dots don't sit on top of each other.
    positions.sort((a, b) => a.target - b.target || a.colour.localeCompare(b.colour) ||
      a.band[attribute].uniformity - b.band[attribute].uniformity);
    const minGap = Math.min(4, 340 / Math.max(positions.length, 1));
    const angles = spread(positions.map(d => d.target), minGap, isCycle());
    positions.forEach((d, i) => d.angle = angles[i]);

    // One label per signature colour, also pushed apart so they don't overlap
    const labels = d3.groups(positions, d => d.colour)
      .map(([colour, list]) => ({ colour, count: list.length, target: list[0].target }));
    const labelAngles = spread(labels.map(d => d.target), 7, isCycle());
    labels.forEach((d, i) => d.angle = labelAngles[i]);

    // A tick on the wheel for every value of this attribute in the data
    const values = new Set(data.bands.flatMap(band => attributeValues(band)));
    const ticks = Array.from(values)
      .map(colour => ({ colour, t: trackPosition(colour) }))
      .filter(d => d.t !== null && d.t >= model.range[0] && d.t <= model.range[1])
      .map(d => ({ colour: d.colour, angle: displayAngle(d.t) }));

    return { positions, labels, ticks };
  }

  // All values of the current attribute in one band, e.g. all its shirt colours
  function attributeValues(band) {
    const attributes = model.attribute === 'overall' ? GARMENTS : [model.attribute];
    return band.members.flatMap(m => attributes.map(a => m[a])).filter(v => v !== null);
  }

  // The wheel: 720 thin slices, each with the wheel's colour at that angle.
  // Slices in the gap between the colour and greyscale wheels are left out.
  function drawRing(layout) {
    const arcGenerator = d3.arc().innerRadius(ringInner).outerRadius(ringOuter);
    const [start, end] = model.range;
    const slices = d3.range(720)
      .map(i => ({
        startAngle: i / 2 * degree,
        // Slices overlap by a hair so no background shows through between them
        endAngle: (i + 1) / 2 * degree + 0.002,
        fill: trackColour(start + (i + 0.5) / 720 * (end - start))
      }))
      .filter(d => d.fill !== null);

    dom.ring.selectAll('path')
      .data(slices)
      .join('path')
      .attr('d', arcGenerator)
      .attr('fill', d => d.fill);

    // Thin outlines so white is visible against the background, and a line at the
    // top where the wheel starts and ends when it isn't one continuous cycle
    dom.ring.selectAll('circle')
      .data([ringInner, ringOuter])
      .join('circle')
      .attr('r', d => d)
      .attr('fill', 'none')
      .attr('stroke', '#45343D')
      .attr('stroke-width', 0.75);
    dom.ring.selectAll('line')
      .data(isCycle() ? [] : [0])
      .join('line')
      .attr('y1', -ringInner)
      .attr('y2', -ringOuter)
      .attr('stroke', '#45343D')
      .attr('stroke-width', 1.5);

    // Small notches on the inside of the wheel where each recorded colour sits
    dom.ticks.selectAll('line')
      .data(layout.ticks, d => d.colour)
      .join('line')
      .attr('x1', d => Math.sin(d.angle * degree) * ringInner)
      .attr('y1', d => -Math.cos(d.angle * degree) * ringInner)
      .attr('x2', d => Math.sin(d.angle * degree) * (ringInner + 8))
      .attr('y2', d => -Math.cos(d.angle * degree) * (ringInner + 8));

    // Labels inside the wheel, pointing to the centre. Labels on the left half are
    // flipped so they are never upside down.
    dom.ringLabels.selectAll('text')
      .data(layout.labels, d => d.colour)
      .join('text')
      .attr('transform', d => {
        const flip = d.angle > 180 ? ' rotate(180)' : '';
        return `rotate(${d.angle - 90}) translate(${ringInner - 6}, 0)${flip}`;
      })
      .attr('text-anchor', d => d.angle > 180 ? 'start' : 'end')
      .attr('dominant-baseline', 'middle')
      .text(d => `${d.colour} (${d.count})`);

    drawGuides();
  }

  // Dashed circles for 25%, 50% and 75%, the outer ring for 100%
  function drawGuides() {
    const ticks = [0, 0.25, 0.5, 0.75, 1];

    dom.guides.selectAll('circle')
      .data(ticks)
      .join('circle')
      .attr('r', d => uniformityScale(d))
      .attr('class', d => d === 1 ? 'outer-ring' : 'guide');

    dom.guides.selectAll('text')
      .data(ticks)
      .join('text')
      .attr('x', 4)
      .attr('y', d => -uniformityScale(d) - 3)
      .text(d => d3.format('.0%')(d));
  }

  function drawBands(layout) {
    const key = d => d.band.name;
    const x = d => Math.sin(d.angle * degree) * d.radius;
    const y = d => -Math.cos(d.angle * degree) * d.radius;
    // Where the band's signature colour is on the wheel
    const ringX = d => Math.sin(d.target * degree) * ringOuter;
    const ringY = d => -Math.cos(d.target * degree) * ringOuter;

    // A thin line from the signature colour on the wheel out to the dot
    dom.stems.selectAll('line')
      .data(layout.positions, key)
      .join(
        enter => enter.append('line')
          .attr('x1', ringX).attr('y1', ringY)
          .attr('x2', ringX).attr('y2', ringY),
        update => update,
        exit => exit.remove()
      )
      .classed('selected', d => d.band.name === model.selectedBand)
      .transition()
      .duration(duration)
      .attr('x1', ringX)
      .attr('y1', ringY)
      .attr('x2', x)
      .attr('y2', y);

    dom.dots.selectAll('circle')
      .data(layout.positions, key)
      .join(
        enter => enter.append('circle')
          .attr('cx', ringX)
          .attr('cy', ringY)
          .attr('r', 0)
          .attr('tabindex', 0)
          .attr('role', 'button'),
        update => update,
        exit => exit.transition().duration(duration / 2).attr('r', 0).remove()
      )
      .attr('fill', d => COLOUR_HEX[d.colour])
      .attr('aria-label', d => `${d.band.name}: ${describe(d.band, model.attribute)}`)
      .classed('selected', d => d.band.name === model.selectedBand)
      .on('mousemove', (event, d) => showTooltip(event, tooltipText(d.band)))
      .on('mouseleave', hideTooltip)
      .on('focus', (event, d) => showTooltip(event, tooltipText(d.band)))
      .on('blur', hideTooltip)
      .on('click', (event, d) => selectBand(d.band.name))
      .on('keydown', (event, d) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          selectBand(d.band.name);
        }
      })
      .transition()
      .duration(duration)
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', d => d.band.name === model.selectedBand ? 10 : 7);

    // The selected band also gets its name written next to its dot
    const selected = layout.positions.filter(d => d.band.name === model.selectedBand);
    dom.selectedLabel.selectAll('text')
      .data(selected)
      .join('text')
      .attr('x', d => x(d) + (x(d) >= 0 ? 14 : -14))
      .attr('y', d => y(d))
      .attr('text-anchor', d => x(d) >= 0 ? 'start' : 'end')
      .attr('dominant-baseline', 'middle')
      .text(d => d.band.name);
  }

  function drawCenter(layout) {
    const lines = [
      { text: ATTRIBUTE_LABELS[model.attribute], className: 'center-title' },
      { text: `${layout.positions.length} of ${data.bands.length} bands`, className: 'center-sub' }
    ];
    dom.centerText.selectAll('text')
      .data(lines)
      .join('text')
      .attr('class', d => d.className)
      .attr('y', (d, i) => i * 18 - 4)
      .attr('text-anchor', 'middle')
      .text(d => d.text);
  }

  // Tells the reader where the missing bands are
  function drawHiddenNote(layout) {
    const otherWheel = data.bands.filter(band =>
      band[model.attribute] !== null && trackPosition(band[model.attribute].colour) === null).length;
    const noJackets = data.bands.filter(band => band[model.attribute] === null).length;
    const outsideRange = data.bands.length - layout.positions.length - otherWheel - noJackets;

    // "1 band has" / "2 bands have"
    const bands = (n, one, many) => `${n} ${n === 1 ? `band ${one}` : `bands ${many}`}`;
    const notes = [];
    if (otherWheel > 0) {
      notes.push(model.wheels.colour
        ? `${bands(otherWheel, 'has', 'have')} a white, grey or black signature colour: tick Greyscale to see them.`
        : `${bands(otherWheel, 'has', 'have')} a coloured signature colour: tick Colours to see them.`);
    }
    if (noJackets > 0) notes.push(`${bands(noJackets, 'wears', 'wear')} no jackets.`);
    if (outsideRange > 0) notes.push(`${bands(outsideRange, 'is', 'are')} outside the selected colour range.`);
    d3.select('#hidden-note').text(notes.join(' '));
  }

  function selectBand(name) {
    update({ selectedBand: model.selectedBand === name ? null : name });
  }

  function tooltipText(band) {
    return `<strong>${band.name}</strong><br>${describe(band, model.attribute)}`;
  }

  // e.g. "black: 4 of 5 members (80%)" or "black: 73% alike (average of shirt, bottom)"
  function describe(band, attribute) {
    const result = band[attribute];
    if (result === null) return 'no jackets';
    const percent = d3.format('.0%')(result.uniformity);
    return `${result.colour}: ${basis(band, attribute)} (${percent})`;
  }

  // What the uniformity score is based on, in words
  function basis(band, attribute) {
    const result = band[attribute];
    if (attribute === 'overall') return `average of ${result.parts.join(', ')}`;
    const verb = GARMENTS.includes(attribute) ? 'wear' : 'have';
    return `${result.count} of ${result.total} members ${verb} it`;
  }

  function showTooltip(event, html) {
    // Keyboard focus has no mouse position, so the tooltip goes next to the element
    const box = event.type === 'focus' ? event.target.getBoundingClientRect() : null;
    const left = box ? box.right + window.scrollX : event.pageX;
    const top = box ? box.top + window.scrollY : event.pageY;
    dom.tooltip
      .html(html)
      .style('left', `${left + 12}px`)
      .style('top', `${top + 12}px`)
      .style('opacity', 1);
  }

  function hideTooltip() {
    dom.tooltip.style('opacity', 0);
  }

  // Colour range slider on the left: a strip showing the current wheel, cut open at the top
  const sliderHeight = 600;
  const slider = initSlider();

  function initSlider() {
    const svg = d3.select('#colour-slider').append('svg')
      .attr('viewBox', `0 0 150 ${sliderHeight + 20}`)
      .attr('aria-label', 'Colour range');
    const g = svg.append('g').attr('transform', 'translate(10, 10)');

    const gradient = svg.append('defs').append('linearGradient')
      .attr('id', 'slider-gradient')
      .attr('x1', 0).attr('x2', 0).attr('y1', 0).attr('y2', 1);

    g.append('rect')
      .attr('width', 24)
      .attr('height', sliderHeight)
      .attr('fill', 'url(#slider-gradient)')
      .attr('stroke', '#45343D')
      .attr('stroke-width', 0.75);

    // Background-coloured covers that dim the part outside the range
    const covers = g.append('g');
    covers.append('rect').attr('class', 'slider-cover top').attr('width', 24);
    covers.append('rect').attr('class', 'slider-cover bottom').attr('width', 24);

    const labels = g.append('g');

    // Two handles, for the start and the end of the range
    const handles = g.append('g')
      .selectAll('g')
      .data(['start', 'end'])
      .join('g')
      .attr('class', 'slider-handle')
      .attr('tabindex', 0)
      .attr('role', 'slider')
      .attr('aria-valuemin', 0)
      .attr('aria-valuemax', 360)
      .attr('aria-label', d => d === 'start' ? 'Start of colour range' : 'End of colour range');
    handles.append('rect').attr('x', -6).attr('y', -5).attr('width', 36).attr('height', 10).attr('rx', 3);

    handles.call(d3.drag().on('drag', (event, d) => {
      moveHandle(d, Math.round(event.y / sliderHeight * sliderSteps) / sliderSteps);
    }));
    handles.on('keydown', (event, d) => {
      const value = d === 'start' ? model.range[0] : model.range[1];
      if (event.key === 'ArrowUp') { event.preventDefault(); moveHandle(d, value - 1 / sliderSteps); }
      if (event.key === 'ArrowDown') { event.preventDefault(); moveHandle(d, value + 1 / sliderSteps); }
    });

    d3.select('#reset-colours').on('click', () => update({ range: [0, 1] }));

    return { gradient, covers, labels, handles };
  }

  function moveHandle(handle, value) {
    let [start, end] = model.range;
    // Keep at least 10 degrees of the wheel between the two handles
    const minimum = 2 / sliderSteps;
    if (handle === 'start') start = Math.max(0, Math.min(value, end - minimum));
    else end = Math.min(1, Math.max(value, start + minimum));
    // Rounding keeps 0 and 1 exact, so the full range is recognised again
    start = Math.round(start * sliderSteps) / sliderSteps;
    end = Math.round(end * sliderSteps) / sliderSteps;
    if (start !== model.range[0] || end !== model.range[1]) update({ range: [start, end] });
  }

  function drawSlider() {
    const [start, end] = model.range;

    // Many stops, so the gap between the two wheels stays a sharp gap
    slider.gradient.selectAll('stop')
      .data(d3.range(0, 1.001, 1 / 360))
      .join('stop')
      .attr('offset', d => d)
      .attr('stop-color', d => trackColour(d) ?? '#FDF9F5');

    slider.labels.selectAll('text')
      .data(trackNames())
      .join('text')
      .attr('x', 32)
      .attr('y', d => d[1] * sliderHeight)
      .attr('dominant-baseline', 'middle')
      .classed('outside', d => d[1] < start || d[1] > end)
      .text(d => d[0]);

    slider.covers.select('.top').attr('height', start * sliderHeight);
    slider.covers.select('.bottom').attr('y', end * sliderHeight).attr('height', (1 - end) * sliderHeight);
    slider.handles
      .attr('transform', d => `translate(0, ${(d === 'start' ? start : end) * sliderHeight})`)
      .attr('aria-valuenow', d => Math.round((d === 'start' ? start : end) * 360))
      .attr('aria-valuetext', d => nearestName(d === 'start' ? start : end));

    d3.select('#colour-range-text').text(isFullRange()
      ? 'The whole wheel'
      : `From ${nearestName(start)} to ${nearestName(end)}`);
  }

  // The name next to the slider that is closest to a position on the wheel
  function nearestName(t) {
    return d3.least(trackNames(), d => Math.abs(d[1] - t))[0];
  }

  // Details box below the chart
  function drawDetails() {
    const panel = d3.select('#details');
    const band = data.bands.find(b => b.name === model.selectedBand);
    panel.selectAll('*').remove();

    if (!band) {
      panel.append('p').attr('class', 'details-empty').text('Select a band (click a dot, or Tab to it and press Enter) to see its members.');
      return;
    }

    const header = panel.append('div').attr('class', 'details-header');
    header.append('h2').text(band.name);
    header.append('p').text(`${band.size} members`);
    if (!isVisible(band)) {
      header.append('p').attr('class', 'details-note').text('Not shown on the wheel with the current choices.');
    }

    // Signature colour and uniformity for every attribute
    const table = panel.append('table').attr('class', 'details-table');
    const head = table.append('thead').append('tr');
    ['', 'Signature colour', 'Uniformity', 'Based on'].forEach(h => head.append('th').text(h));
    const rows = table.append('tbody').selectAll('tr')
      .data(ATTRIBUTES)
      .join('tr')
      .classed('current', d => d === model.attribute)
      .classed('first-look', d => d === LOOKS[0]);
    rows.append('td').text(d => ATTRIBUTE_LABELS[d]);
    rows.append('td').each(function (d) {
      const result = band[d];
      const cell = d3.select(this);
      if (result === null) { cell.text('No jackets'); return; }
      cell.append('span').attr('class', 'swatch').style('background', COLOUR_HEX[result.colour]);
      cell.append('span').text(result.colour);
      if (result.tiedWith.length > 0) {
        cell.append('span').attr('class', 'tie').text(` (tied with ${result.tiedWith.join(', ')})`);
      }
    });
    rows.append('td').text(d => band[d] === null ? '–' : d3.format('.0%')(band[d].uniformity));
    rows.append('td').text(d => band[d] === null ? '–' : basis(band, d));

    // One small figure per member
    panel.append('h3').text('Members');
    const figures = panel.append('div').attr('class', 'figures')
      .selectAll('figure')
      .data(band.members)
      .join('figure');
    figures.append('svg')
      .attr('viewBox', '0 0 60 112')
      .attr('role', 'img')
      .attr('aria-label', m => `${m.name}: ${describeMember(m)}`)
      .each(function (m) { drawFigure(d3.select(this), m); });
    figures.append('figcaption').text(m => m.name);

    // Other bands with the same signature colour, from the sketch's "recommendations" box
    const current = band[model.attribute];
    if (current !== null) {
      const others = data.bands.filter(b => b !== band && b[model.attribute]?.colour === current.colour);
      panel.append('h3').text(`Other bands with ${current.colour} as signature colour (${ATTRIBUTE_LABELS[model.attribute].toLowerCase()})`);
      const list = panel.append('div').attr('class', 'other-bands');
      if (others.length === 0) list.append('p').text('None.');
      list.selectAll('button')
        .data(others.sort((a, b) => b[model.attribute].uniformity - a[model.attribute].uniformity))
        .join('button')
        .text(b => `${b.name} (${d3.format('.0%')(b[model.attribute].uniformity)})`)
        .on('click', (event, b) => update({ selectedBand: b.name }));
    }
  }

  // A member as boxes: hair, face (skin) with eyes, shirt, jacket (arms and lapels), and legs
  function drawFigure(svg, m) {
    const boxes = [
      { label: 'Hair', value: m.hair, x: 16, y: 2, w: 28, h: 9 },
      { label: 'Skin', value: m.skin, x: 18, y: 11, w: 24, h: 20 },
      { label: 'Eyes', value: m.eyes, x: 23, y: 17, w: 5, h: 5 },
      { label: 'Eyes', value: m.eyes, x: 32, y: 17, w: 5, h: 5 },
      // Without a jacket the arms are sleeves, so they show the shirt colour
      { label: m.jacket ? 'Jacket' : 'Shirt', value: m.jacket ?? m.shirt, x: 2, y: 34, w: 10, h: 34 },
      { label: m.jacket ? 'Jacket' : 'Shirt', value: m.jacket ?? m.shirt, x: 48, y: 34, w: 10, h: 34 },
      { label: 'Shirt', value: m.shirt, x: 12, y: 34, w: 36, h: 36 }
    ];
    if (m.jacket) {
      boxes.push({ label: 'Jacket', value: m.jacket, x: 12, y: 34, w: 9, h: 36 });
      boxes.push({ label: 'Jacket', value: m.jacket, x: 39, y: 34, w: 9, h: 36 });
    }
    boxes.push({ label: 'Bottom', value: m.bottom, x: 13, y: 70, w: 16, h: 40 });
    boxes.push({ label: 'Bottom', value: m.bottom, x: 31, y: 70, w: 16, h: 40 });

    svg.selectAll('rect')
      .data(boxes)
      .join('rect')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('width', d => d.w)
      .attr('height', d => d.h)
      .attr('fill', d => d.value === null ? '#ffffff' : COLOUR_HEX[d.value])
      .attr('class', d => d.value === null ? 'unknown' : null)
      .append('title')
      .text(d => `${d.label}: ${d.value ?? 'unknown'}`);
  }

  function describeMember(m) {
    return `hair ${m.hair ?? 'unknown'}, eyes ${m.eyes ?? 'unknown'}, skin ${m.skin ?? 'unknown'}, ` +
      `shirt ${m.shirt ?? 'unknown'}, jacket ${m.jacket ?? 'none'}, bottom ${m.bottom ?? 'unknown'}`;
  }

  // Events
  function initEvents() {
    d3.select('#attribute').on('change', event => {
      update({ attribute: event.target.value });
    });
    d3.selectAll('#show-colours, #show-greys').on('change', () => {
      const wheels = {
        colour: d3.select('#show-colours').property('checked'),
        grey: d3.select('#show-greys').property('checked')
      };
      // The wheel can't be empty, so the last ticked box can't be unticked
      if (!wheels.colour && !wheels.grey) {
        d3.select('#show-colours').property('checked', model.wheels.colour);
        d3.select('#show-greys').property('checked', model.wheels.grey);
        return;
      }
      // The circle is laid out differently now, so the range starts over
      update({ wheels, range: [0, 1] });
    });
  }

  initEvents();
  view();
}

// Pushes sorted angles (in degrees) apart until neighbours are at least minGap apart,
// while keeping each group as close as possible to where it belongs.
// With wrap, the angles go round the full circle, so 359 and 1 are neighbours.
function spread(targets, minGap, wrap) {
  const n = targets.length;
  if (n < 2) return targets.slice();

  // On a full circle, cut it open at the biggest empty gap and work on a straight line
  let cut = 0;
  if (wrap) {
    let biggest = -1;
    for (let i = 0; i < n; i++) {
      const gap = (i === n - 1 ? targets[0] + 360 : targets[i + 1]) - targets[i];
      if (gap > biggest) { biggest = gap; cut = (i + 1) % n; }
    }
  }
  const order = d3.range(n).map(i => (cut + i) % n);
  const angles = order.map(index => targets[index] + (index < cut ? 360 : 0));

  for (let iteration = 0; iteration < 500; iteration++) {
    let moved = false;
    for (let i = 1; i < n; i++) {
      const overlap = minGap - (angles[i] - angles[i - 1]);
      if (overlap > 0.001) {
        angles[i - 1] -= overlap / 2;
        angles[i] += overlap / 2;
        moved = true;
      }
    }
    // A part of the wheel has a start and an end, so nothing may be pushed past them
    if (!wrap) {
      angles[0] = Math.max(angles[0], 2);
      angles[n - 1] = Math.min(angles[n - 1], 358);
    }
    if (!moved) break;
  }

  const result = [];
  order.forEach((index, i) => result[index] = (angles[i] + 360) % 360);
  return result;
}
