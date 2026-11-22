async function main() {
  d3.csv("./data/boys.csv", d3.autoType).then(rawData => {
    const signSummaries = buildSignSummaries(rawData);
    createViz(signSummaries);
  });
}

// Chart dimensions
const width = 800;
const height = 800;
const center = { x: width / 2, y: height / 2 };
const innerRadius = 92;
const ringThickness = 44;

// One ring per attribute, innermost to outermost
const ringKeys = ["hair_color", "eyes", "skin", "shirt_color", "bottom_color"];
const ringLabels = ["Hair", "Eyes", "Skin", "Shirt", "Pants"];

// Zodiac signs in calendar order, so the wheel reads like an actual zodiac chart
const zodiacRanges = [
  ["Capricorn", [12, 22], [1, 19]],
  ["Aquarius", [1, 20], [2, 18]],
  ["Pisces", [2, 19], [3, 20]],
  ["Aries", [3, 21], [4, 19]],
  ["Taurus", [4, 20], [5, 20]],
  ["Gemini", [5, 21], [6, 20]],
  ["Cancer", [6, 21], [7, 22]],
  ["Leo", [7, 23], [8, 22]],
  ["Virgo", [8, 23], [9, 22]],
  ["Libra", [9, 23], [10, 22]],
  ["Scorpio", [10, 23], [11, 21]],
  ["Sagittarius", [11, 22], [12, 21]]
];
const zodiacOrder = zodiacRanges.map(d => d[0]);

// Literal colors for every value that actually occurs in boys.csv, so a ring is always
// filled with the member's real color instead of a decoded/mapped one.
const colorByValue = {
  light: "#F2D3B3", "medium-light": "#E0B48C", medium: "#C9986A",
  "medium-dark": "#A6734A", dark: "#6B4226",
  black: "#1C1B19", brown: "#6B4423", blonde: "#E8C873",
  "strawberry blonde": "#D98E5B", red: "#B33A1E", silver: "#B9B9B9",
  green: "#4F8F5B", "dark green": "#355E3B",
  blue: "#3B5BA0", "light blue": "#8FB7E0", "navy blue": "#1F2A52",
  hazel: "#8A7A3E", gray: "#9A9A9A", "dark gray": "#5C5C5C", "light gray": "#D4D4D4",
  white: "#F5F3EE", yellow: "#E8C547", "light yellow": "#F0DE8E", tan: "#CBA26A",
  orange: "#E07B39", "rust orange": "#B5541E", purple: "#7A5C96",
  pink: "#D98FA3", salmon: "#E08A7A", "dark red": "#7A2E22", patterned: "#B7AE9A"
};
const fallbackColor = "#BDB8AC"; // used for "unknown/can't tell" etc.

function colorFor(value) {
  if (!value) {
    return fallbackColor;
  }
  return colorByValue[value.toLowerCase()] || fallbackColor;
}

// dob in boys.csv looks like "5/10/1982" (month/day/year), so this is plain
// calendar math, not a date library concern.
function signFor(month, day) {
  for (const [sign, [startMonth, startDay], [endMonth, endDay]] of zodiacRanges) {
    if (startMonth <= endMonth) {
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
      if (month > startMonth && month < endMonth) {
        return sign;
      }
    } else {
      // Capricorn wraps across new year (Dec 22 - Jan 19)
      if ((month === startMonth && day >= startDay) || (month === endMonth && day <= endDay)) {
        return sign;
      }
    }
  }
  return null;
}

// How often each value of one attribute occurs within a group of members,
// sorted with the most common value first (rings[0] is the ring's color).
function distribution(members, key) {
  if (members.length === 0) {
    return [];
  }

  const counts = d3.rollup(members, v => v.length, d => d[key]);
  const total = d3.sum(counts.values());

  return Array.from(counts, ([value, count]) => ({ value, count, pct: count / total }))
      .sort((a, b) => d3.descending(a.count, b.count));
}

// One summary per zodiac sign, always in calendar order (even a sign with 0
// members still gets an entry, so the wheel never skips a slice).
function buildSignSummaries(rawData) {
  rawData.forEach(d => {
    const parts = (d.dob || "").split("/").map(Number);
    d.sign = parts.length === 3 ? signFor(parts[0], parts[1]) : null;
  });

  const bySign = d3.group(rawData.filter(d => d.sign), d => d.sign);

  return zodiacOrder.map(sign => {
    const members = bySign.get(sign) || [];
    return {
      sign: sign,
      count: members.length,
      rings: ringKeys.map(key => distribution(members, key)),
      members: members
    };
  });
}

// Create your visualization
function createViz(signSummaries) {
  let model = {
    signSummaries: signSummaries,
    selectedSign: null
  };

  // DOM
  function initDOM() {
    return {
      memberPanelTitle: d3.select("#memberPanelTitle"),
      memberList: d3.select("#memberList"),
      tooltip: d3.select("#tooltip")
    };
  }

  const dom = initDOM();
  const viz = initViz();

  // One ring-segment datum per sign per ring, flattened into a single array so
  // every segment can be hovered/clicked on its own with one data join.
  function buildRingData(pieData) {
    return pieData.flatMap(arc => {
      const summary = arc.data;

      return summary.rings.map((dist, ringIndex) => {
        // Hair sits outermost and pants innermost - reverse of ringKeys'
        // order, which stays "hair, eyes, skin, shirt, pants" for labels.
        const radiusIndex = ringKeys.length - 1 - ringIndex;

        return {
          sign: summary.sign,
          count: summary.count,
          ringIndex: ringIndex,
          startAngle: arc.startAngle,
          endAngle: arc.endAngle,
          innerR: innerRadius + radiusIndex * ringThickness,
          outerR: innerRadius + (radiusIndex + 1) * ringThickness - 2,
          color: dist.length ? colorFor(dist[0].value) : fallbackColor,
          dist: dist
        };
      });
    });
  }

  // Viz
  function initViz() {
    const svg = d3.select("#viz")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`);

    const chartGroup = svg.append("g")
        .attr("class", "chart-content")
        .attr("transform", `translate(${center.x}, ${center.y})`);

    chartGroup.append("circle")
        .attr("class", "center-hole")
        .attr("r", innerRadius - 6);

    const centerLabel = chartGroup.append("text")
        .attr("class", "center-label")
        .attr("text-anchor", "middle");

    const totalMembersTspan = centerLabel.append("tspan")
        .attr("class", "total-members")
        .attr("x", 0)
        .attr("dy", "-0.2em");

    centerLabel.append("tspan")
        .attr("class", "total-signs")
        .attr("x", 0)
        .attr("dy", "1.3em")
        .text("12 zodiac signs");

    const ringsGroup = chartGroup.append("g").attr("class", "rings");
    const labelsGroup = chartGroup.append("g").attr("class", "sign-labels");

    const arcGenerator = d3.arc()
        .innerRadius(d => d.innerR)
        .outerRadius(d => d.outerR)
        .startAngle(d => d.startAngle)
        .endAngle(d => d.endAngle)
        .padAngle(0.012)
        .padRadius(innerRadius);

    const pieLayout = d3.pie()
        .value(d => d.count)
        .sort(null); // keep calendar order, not sorted by size

    return {
      svg: svg,
      chartGroup: chartGroup,
      totalMembersTspan: totalMembersTspan,
      ringsGroup: ringsGroup,
      labelsGroup: labelsGroup,
      arcGenerator: arcGenerator,
      pieLayout: pieLayout
    };
  }

  // Update
  function update(patch) {
    Object.assign(model, patch);
    view(dom, model, viz);
  }

  // View
  function view(dom, model, viz) {
    const pieData = viz.pieLayout(model.signSummaries);
    const ringData = buildRingData(pieData);

    viz.totalMembersTspan.text(`${d3.sum(model.signSummaries, d => d.count)} members`);

    viz.ringsGroup.selectAll("path.ring")
        .data(ringData, d => `${d.sign}-${d.ringIndex}`)
        .join("path")
        .attr("class", "ring")
        .attr("fill", d => d.color)
        .classed("dimmed", d => model.selectedSign && d.sign !== model.selectedSign)
        .attr("d", viz.arcGenerator)
        .on("mouseover", onRingHover)
        .on("mousemove", onRingMove)
        .on("mouseout", onRingOut)
        .on("click", onRingClick);

    const labelRadius = innerRadius + 5 * ringThickness + 26;

    const labelGroups = viz.labelsGroup.selectAll("g.sign-label")
        .data(pieData, d => d.data.sign)
        .join(enter => {
          const g = enter.append("g").attr("class", "sign-label");
          g.append("text").attr("class", "sign-name");
          g.append("text").attr("class", "sign-count").attr("dy", "1.3em");
          return g;
        });

    labelGroups
        .attr("transform", d => {
          const mid = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
          return `translate(${labelRadius * Math.cos(mid)}, ${labelRadius * Math.sin(mid)})`;
        })
        .attr("text-anchor", d => {
          const midDeg = (d.startAngle + d.endAngle) / 2 * 180 / Math.PI;
          if (midDeg < 170) return "start";
          if (midDeg > 190) return "end";
          return "middle";
        });

    labelGroups.select("text.sign-name").text(d => d.data.sign);
    labelGroups.select("text.sign-count").text(d => `${d.data.count} members`);

    renderMemberPanel(model);
  }

  function renderMemberPanel(model) {
    if (!model.selectedSign) {
      dom.memberPanelTitle.text("Click a wedge to see its members");
      dom.memberList.selectAll("li").remove();
      return;
    }

    const summary = model.signSummaries.find(d => d.sign === model.selectedSign);
    dom.memberPanelTitle.text(`${summary.sign} — ${summary.count} members`);

    dom.memberList.selectAll("li")
        .data(summary.members, d => d.name)
        .join("li")
        .html(memberCardHtml);
  }

  // Same five rings as the wheel, stacked for one real person, so clicking a
  // wedge shows the actual "little people" behind its averaged colors. The
  // eyes bar gets a small eye icon drawn on top of its literal color, the
  // same treatment as the wheel's eye ring.
  function memberCardHtml(member) {
    const swatches = ringKeys
        .map(key => {
          const color = colorFor(member[key]);
          return key === "eyes" ? eyeSwatchHtml(color) : `<span style="background:${color}"></span>`;
        })
        .join("");

    return `<div class="swatches">${swatches}</div><b>${member.name}</b><div class="band">${member.band}</div>`;
  }

  function eyeSwatchHtml(color) {
    return `<span class="eyes" style="background:${color}">` +
        `<svg viewBox="0 0 78 16">` +
        `<ellipse cx="23" cy="8" rx="7" ry="5" fill="#FFFFFF"/><ellipse cx="55" cy="8" rx="7" ry="5" fill="#FFFFFF"/>` +
        `<circle cx="23" cy="8" r="3" fill="${color}"/><circle cx="55" cy="8" r="3" fill="${color}"/>` +
        `<circle cx="23" cy="8" r="1.1" fill="#1C1B19"/><circle cx="55" cy="8" r="1.1" fill="#1C1B19"/>` +
        `</svg></span>`;
  }

  // Events
  function onRingHover(event, d) {
    dom.tooltip.classed("visible", true).html(tooltipHtml(d));
    positionTooltip(event);
  }

  function onRingMove(event) {
    positionTooltip(event);
  }

  // #tooltip is position:fixed, so it must follow clientX/clientY (viewport-
  // relative) rather than pageX/pageY (document-relative) - otherwise it
  // drifts away from the cursor as soon as the page is scrolled.
  function positionTooltip(event) {
    dom.tooltip
        .style("left", `${event.clientX + 14}px`)
        .style("top", `${event.clientY - 12}px`);
  }

  function onRingOut() {
    dom.tooltip.classed("visible", false);
  }

  function onRingClick(event, d) {
    const nextSign = model.selectedSign === d.sign ? null : d.sign;
    update({ selectedSign: nextSign });
  }

  // Shows the exact split behind a ring's color, e.g. "black: 71% (5)",
  // instead of just the single mode color the ring is painted with.
  function tooltipHtml(d) {
    const header = `<b>${d.sign} · ${ringLabels[d.ringIndex]}</b> (${d.count} members)`;
    const lines = d.dist.map(entry => `${entry.value}: ${Math.round(entry.pct * 100)}% (${entry.count})`);
    return [header, ...lines].join("<br>");
  }

  // Init
  function init() {
    view(dom, model, viz);
  }

  init();
}
