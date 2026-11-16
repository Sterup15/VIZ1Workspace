const frame = document.querySelector("#app");
const results = [];
const appURL = new URL("../", location.href);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const equal = (actual, expected) => assert(JSON.stringify(actual) === JSON.stringify(expected),
  `Expected ${JSON.stringify(expected)}; received ${JSON.stringify(actual)}`);
const doc = () => frame.contentDocument;
const text = selector => doc().querySelector(selector).textContent;
const count = selector => doc().querySelectorAll(selector).length;
const change = (selector, value) => {
  const element = doc().querySelector(selector);
  element.value = value;
  element.dispatchEvent(new frame.contentWindow.Event("change", { bubbles: true }));
};
const mark = name => [...doc().querySelectorAll(".band-mark")].find(element => element.dataset.band === name);
const focusGroup = size => doc().querySelector(`.group-key[data-size="${size}"]`).click();
const reset = () => {
  focusGroup("all");
  change("#band-select", "");
  change("#garment", "bottom_color");
};
const key = (element, value) => element.dispatchEvent(new frame.contentWindow.KeyboardEvent("keydown", {
  key: value, bubbles: true, cancelable: true
}));

async function test(name, action) {
  try {
    await action();
    results.push({ name, passed: true });
  } catch (error) {
    results.push({ name, passed: false, error: error.message });
  }
  const item = document.createElement("li");
  const result = results.at(-1);
  item.className = result.passed ? "pass" : "fail";
  item.textContent = `${result.passed ? "PASS" : "FAIL"}: ${name}${result.error ? ` - ${result.error}` : ""}`;
  document.querySelector("#results").append(item);
}

const response = await fetch(new URL("index.html", appURL));
if (!response.ok) throw new Error(`Cannot load application HTML: ${response.status}`);
const html = await response.text();

async function loadApp({ csv, status = 200, missingLibrary = false } = {}) {
  let head = `<base href="${appURL.href}">`;
  if (csv !== undefined) {
    head += `<script>window.fetch = async () => new Response(${JSON.stringify(csv)}, {status:${status}});</script>`;
  }
  let source = html.replace("<head>", `<head>${head}`);
  if (missingLibrary) source = source.replace('src="js/vendor/d3.v7.min.js"', 'src="js/vendor/intentionally-missing.js"');
  const loaded = new Promise(resolve => { frame.onload = resolve; });
  frame.srcdoc = source;
  await loaded;
  for (let attempt = 0; attempt < 160; attempt++) {
    if (["ready", "error"].includes(doc().body.dataset.appState)) return doc().body.dataset.appState;
    await sleep(50);
  }
  throw new Error("Application did not reach ready/error within 8 seconds.");
}

await test("Fresh app has 55 bands, five arcs and no initial selection", async () => {
  equal(await loadApp(), "ready");
  equal([count(".band-mark"), count(".group-arc"), count(".group-key"), count(".score-guide")], [55, 5, 6, 3]);
  equal(doc().querySelector("#band-select").value, "");
  assert(doc().querySelector("#detail-panel").hidden, "Empty detail panel should be hidden");
  assert(!doc().querySelector("#method").open, "Method should start collapsed");
  equal(count("#legend, #size-filter, #reset"), 0);
  assert([...doc().querySelectorAll(".band-stem")].every(element => frame.contentWindow.getComputedStyle(element).visibility === "hidden"),
    "Default stems should not compete with dots");
  assert(text("#chart-status").includes("234 known colours"), "Wrong initial coverage");
});
await test("Actual SVG sectors fill 360 degrees without padding and preserve equal band slots", () => {
  const groups = [...doc().querySelectorAll(".group-arc")].map(element => element.__data__);
  const close = (a, b) => assert(Math.abs(a - b) < 1e-12, `${a} does not equal ${b}`);
  close(groups[0].startAngle, 0);
  close(groups.at(-1).endAngle, Math.PI * 2);
  groups.forEach((group, index) => {
    if (index) close(group.startAngle, groups[index - 1].endAngle);
    close((group.endAngle - group.startAngle) / group.count, 2 * Math.PI / 55);
  });
  equal([...doc().querySelectorAll(".scale-label")].map(label => label.textContent), ["0%", "50%", "100%"]);
});
await test("Overview dots, arcs and group keys share five stable colours across garments", () => {
  const colours = new Map([...doc().querySelectorAll(".group-arc")].map(arc => [arc.__data__.size, arc.getAttribute("fill")]));
  equal(new Set(colours.values()).size, 5);
  for (const garment of ["shirt_color", "bottom_color"]) {
    change("#garment", garment);
    for (const point of doc().querySelectorAll(".band-point")) {
      equal(point.getAttribute("fill"), colours.get(point.parentElement.__data__.totalMembers));
    }
    for (const key of doc().querySelectorAll('.group-key:not([data-size="all"])')) {
      const arc = [...doc().querySelectorAll(".group-arc")].find(element => element.__data__.size === Number(key.dataset.size));
      equal(frame.contentWindow.getComputedStyle(key.querySelector(".group-swatch")).backgroundColor,
        frame.contentWindow.getComputedStyle(arc).fill);
    }
  }
});
await test("Selecting and clearing details does not resize or move the chart", () => {
  const bounds = () => {
    const box = doc().querySelector("#viz svg").getBoundingClientRect();
    return [box.x, box.y, box.width, box.height];
  };
  const before = bounds();
  change("#band-select", "Shai");
  equal(bounds(), before);
  change("#band-select", "");
  equal(bounds(), before);
});
await test("Shai selection exposes exact bottom-colour evidence", () => {
  change("#band-select", "Shai");
  equal(text("#detail-score"), "33.3%");
  assert(!doc().querySelector("#detail-panel").hidden, "Member evidence did not open");
  assert(text("#detail-pairs").includes("2 matching pairs out of 6"), "Wrong pair counts");
  equal(text("#detail-mode"), "Tied: black, navy blue");
  equal(count("#member-list li"), 4);
  equal(mark("Shai").getAttribute("aria-pressed"), "true");
});
await test("Garment change preserves selected band and all angles", () => {
  const before = [...doc().querySelectorAll(".band-mark")].map(element => [element.dataset.band, element.__data__.angle]);
  change("#garment", "shirt_color");
  equal(text("#detail-title"), "Shai");
  equal(text("#detail-score"), "0%");
  assert(text("#detail-mode").includes("blue, green, patterned, purple"), "Missing tie categories");
  equal(new Set([...doc().querySelectorAll(".band-point")].map(point => point.getAttribute("fill"))).size, 5);
  equal([...doc().querySelectorAll(".band-mark")].map(element => [element.dataset.band, element.__data__.angle]), before);
  assert(text("#chart-status").includes("233 known"), "Coverage did not change");
});
await test("Incomplete shirts are visible without changing band size", () => {
  change("#band-select", "Son by Four");
  equal(text("#detail-score"), "100%");
  assert(text("#detail-coverage").includes("3 known colours out of 4"), "Missing valid denominator");
  equal(count("#member-list li"), 4);
  assert(text("#member-list").includes("Missing colour"), "Missing member was dropped");
  assert(text("#detail-subtitle").includes("4 member records"), "Band size was changed");
});
await test("Group focus emphasises 21 bands but retains all dots and structural arcs", () => {
  const arcs = [...doc().querySelectorAll(".group-arc")].map(element => element.getAttribute("d"));
  focusGroup(4);
  equal([count(".band-mark"), count(".band-mark:not(.is-muted)"), count(".group-arc")], [55, 21, 5]);
  equal(text("#detail-title"), "Son by Four");
  equal([...doc().querySelectorAll(".group-arc")].map(element => element.getAttribute("d")), arcs);
  assert(text("#chart-status").startsWith("21 of 55"), "Status confuses full and visible bands");
});
await test("Focusing another group clears incompatible selection and announces it", () => {
  focusGroup(3);
  equal(count(".band-mark:not(.is-muted)"), 12);
  equal(count("#member-list li"), 0);
  assert(doc().querySelector("#detail-panel").hidden, "Stale detail panel remains");
  equal(doc().querySelector("#band-select").value, "");
  assert(text("#announcement").includes("selection cleared"), "Selection clearing not announced");
});
await test("Arc keyboard activation emphasises and toggles back to all sizes", () => {
  const arc = [...doc().querySelectorAll(".group-arc")].find(element => element.__data__.size === 5);
  key(arc, "Enter");
  equal(count(".band-mark:not(.is-muted)"), 19);
  equal(arc.getAttribute("aria-pressed"), "true");
  key(arc, " ");
  equal(count(".band-mark"), 55);
});
await test("Band keyboard activation, focus tooltip and Escape work", async () => {
  const shai = mark("Shai");
  shai.focus({ preventScroll: true });
  assert(!doc().querySelector("#tooltip").hidden, "Focus did not show tooltip");
  equal(text("#tooltip-title"), "Shai");
  key(shai, "Escape");
  assert(doc().querySelector("#tooltip").hidden, "Escape did not dismiss tooltip");
  key(shai, " ");
  equal(text("#detail-title"), "Shai");
  shai.blur();
  await sleep(220);
  equal(text("#detail-title"), "Shai");
});
await test("Group emphasis keeps focused marks available; selecting a muted mark changes group", () => {
  mark("Shai").focus({ preventScroll: true });
  focusGroup(3);
  equal(doc().activeElement.dataset.band, "Shai");
  assert(mark("Shai").classList.contains("is-muted"), "Shai should be contextual");
  key(mark("Shai"), "Enter");
  assert(!mark("Shai").classList.contains("is-muted"), "Selected band should be emphasised");
  equal(doc().querySelector('.group-key[data-size="4"]').getAttribute("aria-pressed"), "true");
  assert(text("#announcement").includes("4-member group"), "Changed group not announced");
});
await test("All and clear-selection have separate, predictable effects", () => {
  focusGroup("all");
  equal(text("#detail-title"), "Shai");
  equal(doc().querySelector("#garment").value, "shirt_color");
  focusGroup(4);
  const clear = doc().querySelector("#clear-selection");
  clear.focus({ preventScroll: true });
  clear.click();
  equal(doc().activeElement.id, "band-select");
  assert(doc().querySelector("#detail-panel").hidden, "Clear did not hide details");
  equal(doc().querySelector('.group-key[data-size="4"]').getAttribute("aria-pressed"), "true");
  equal(doc().querySelector("#garment").value, "shirt_color");
});
await test("Twenty garment/group/selection cycles never duplicate DOM or leave stale members", () => {
  for (let i = 0; i < 20; i++) {
    reset();
    change("#band-select", "Shai");
    change("#garment", "shirt_color");
    focusGroup(4);
    equal([count(".band-mark"), count(".band-mark:not(.is-muted)"), count("#member-list li")], [55, 21, 4]);
    reset();
    equal([count(".band-mark"), count(".group-arc"), count("#member-list li"), count(".group-key"), count("#viz svg")],
      [55, 5, 0, 6, 1]);
    equal([doc().querySelector("#garment").value, doc().querySelector("#band-select").value],
      ["bottom_color", ""]);
    equal(doc().querySelector('.group-key[data-size="all"]').getAttribute("aria-pressed"), "true");
  }
});
await test("Equal scores stay separate; zero-score points and paths are finite", () => {
  const full = [...doc().querySelectorAll(".band-mark")].filter(element => element.__data__.summaries.bottom_color.score === 1);
  equal(full.length, 35);
  equal(new Set(full.map(element => element.querySelector(".band-point").getAttribute("cx") + "," +
    element.querySelector(".band-point").getAttribute("cy"))).size, 35);
  for (const element of doc().querySelectorAll(".band-point")) {
    for (const attr of ["cx", "cy"]) assert(Number.isFinite(Number(element.getAttribute(attr))), `Invalid ${attr}`);
  }
  assert([...doc().querySelectorAll("path")].every(element => !/NaN|undefined/.test(element.getAttribute("d"))), "Invalid path");
});
await test("1440/1024/768/390 widths contain the page and allow chart-only scrolling", async () => {
  for (const width of [1440, 1024, 768, 390]) {
    frame.style.width = `${width}px`;
    await sleep(50);
    const win = frame.contentWindow;
    assert(doc().documentElement.scrollWidth <= win.innerWidth + 1, `Page overflow at ${width}`);
    const region = doc().querySelector("#chart-scroll");
    if (width === 390) assert(region.scrollWidth > region.clientWidth, "Small chart should be scrollable");
    for (const control of doc().querySelectorAll("select, .group-key")) {
      assert(control.getBoundingClientRect().height >= 44, "Control target is too short");
    }
    const svg = doc().querySelector("#viz svg").getBoundingClientRect();
    for (const label of doc().querySelectorAll(".group-label, .group-count, .scale-label")) {
      const box = label.getBoundingClientRect();
      assert(box.left >= svg.left && box.right <= svg.right && box.top >= svg.top && box.bottom <= svg.bottom,
        `Clipped label at ${width}: ${label.textContent}`);
    }
  }
  frame.style.width = "100%";
});
await test("Details sit right of the chart on desktop and below it on narrow screens", async () => {
  try {
    for (const width of [1440, 1280, 1160, 1159, 1024, 768, 390]) {
      frame.style.width = `${width}px`;
      await sleep(50);
      change("#band-select", "");
      const chart = doc().querySelector(".chart-section");
      const before = chart.getBoundingClientRect();
      change("#band-select", "Son by Four");
      const after = chart.getBoundingClientRect();
      const details = doc().querySelector("#detail-panel").getBoundingClientRect();
      equal([after.x, after.y, after.width, after.height], [before.x, before.y, before.width, before.height]);
      if (width >= 1160) {
        assert(details.left >= after.right + 20, `Details are not to the right at ${width}`);
        assert(Math.abs(details.top - after.top) < 1, `Columns are not top-aligned at ${width}`);
        const region = doc().querySelector("#chart-scroll");
        assert(region.scrollWidth <= region.clientWidth + 1, `Desktop chart is clipped at ${width}`);
      } else {
        assert(details.top >= after.bottom, `Narrow layout overlaps the chart at ${width}`);
      }
      assert(details.right <= frame.contentWindow.innerWidth, `Details overflow at ${width}`);
      const clear = doc().querySelector("#clear-selection").getBoundingClientRect();
      assert(clear.right <= details.right && clear.left >= details.left, `Clear button overflows at ${width}`);
      assert(doc().documentElement.scrollWidth <= frame.contentWindow.innerWidth + 1, `Selected page overflows at ${width}`);
    }
  } finally {
    change("#band-select", "");
    frame.style.width = "100%";
  }
});
await test("200% CSS magnification at desktop width does not overflow the page", async () => {
  frame.style.width = "1440px";
  doc().documentElement.style.zoom = "2";
  await sleep(50);
  assert(doc().documentElement.scrollWidth <= frame.contentWindow.innerWidth + 1, "Magnified page overflows");
  for (const element of doc().querySelectorAll("select, .group-key")) {
    const box = element.getBoundingClientRect();
    assert(box.left >= 0 && box.right <= frame.contentWindow.innerWidth, "Magnified control is clipped");
  }
  doc().documentElement.style.zoom = "";
  frame.style.width = "100%";
});
await test("Group and score labels do not overlap each other or band hit targets", () => {
  const overlaps = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  for (const garment of ["shirt_color", "bottom_color"]) {
    change("#garment", garment);
    const labels = [...doc().querySelectorAll(".group-label, .group-count, .scale-label")];
    labels.forEach((label, index) => {
      const box = label.getBoundingClientRect();
      for (const other of labels.slice(index + 1)) assert(!overlaps(box, other.getBoundingClientRect()),
        `${label.textContent} overlaps ${other.textContent}`);
      for (const point of doc().querySelectorAll(".band-hit")) assert(!overlaps(box, point.getBoundingClientRect()),
        `${label.textContent} overlaps ${point.parentElement.dataset.band} / ${garment}`);
    });
  }
  const zero = doc().querySelector(".scale-label").getBBox();
  assert(zero.y + zero.height < -185, "Zero label overlaps the group arc");
});
await test("Actual group colours, muted dots and text meet contrast thresholds", () => {
  const luminance = colour => {
    const values = colour.match(/[0-9.]+/g).slice(0, 3).map(Number).map(value => value / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * values[0] + .7152 * values[1] + .0722 * values[2];
  };
  const css = element => frame.contentWindow.getComputedStyle(element);
  const background = luminance(css(doc().body).backgroundColor);
  const contrast = colour => {
    const value = luminance(colour);
    return (Math.max(background, value) + .05) / (Math.min(background, value) + .05);
  };
  for (const arc of doc().querySelectorAll(".group-arc")) assert(contrast(css(arc).fill) >= 3, "Group colour lacks contrast");
  focusGroup(3);
  assert(contrast(css(doc().querySelector(".is-muted .band-point")).fill) >= 3, "Muted dot lacks contrast");
  for (const element of doc().querySelectorAll(".question, .small-note, .group-label, .scale-label")) {
    const colour = element instanceof frame.contentWindow.SVGElement ? css(element).fill : css(element).color;
    assert(contrast(colour) >= 4.5, "Text lacks contrast");
  }
  focusGroup("all");
});
await test("A CSV with no score keeps the band selectable and never draws a zero point", async () => {
  equal(await loadApp({ csv: "band,name,bottom_color,shirt_color\nTest,A,,black\nTest,B,,white\nTest,C,," }), "ready");
  equal(count(".band-mark"), 0);
  assert(!doc().querySelector("#unavailable").hidden, "No unavailable-score notice");
  change("#band-select", "Test");
  equal(text("#detail-score"), "Unavailable");
  equal(count("#member-list li"), 3);
  assert(text("#detail-pairs").includes("Not enough"), "No pair explanation");
  change("#garment", "shirt_color");
  equal(count(".band-mark"), 1);
  equal(text("#detail-score"), "0%");
});
await test("A focused mark losing its score restores focus to the band selector", () => {
  const point = mark("Test");
  point.focus({ preventScroll: true });
  change("#garment", "bottom_color");
  equal(count(".band-mark"), 0);
  equal(doc().activeElement.id, "band-select");
  equal(text("#detail-score"), "Unavailable");
});
await test("HTTP dataset failure shows an error and disabled controls", async () => {
  equal(await loadApp({ csv: "Missing file", status: 404 }), "error");
  assert(text("#chart-status").includes("HTTP 404"), "HTTP error was hidden");
  assert(doc().querySelector("#control-fields").disabled, "Controls remain enabled");
  equal(count(".band-mark"), 0);
});
await test("Invalid interaction states show a visible error and disable controls", async () => {
  equal(await loadApp(), "ready");
  change("#garment", "not-a-garment");
  equal(doc().body.dataset.appState, "error");
  assert(text("#chart-status").includes("Invalid garment"), "Invalid state was hidden");
  assert(!doc().querySelector("#chart-status").classList.contains("visually-hidden"), "Error is visually hidden");
  assert(doc().querySelector("#control-fields").disabled, "Controls remain enabled");
  assert(doc().querySelector("#clear-selection").disabled, "Selection action remains enabled");
});
await test("Invalid data fails explicitly rather than drawing an empty success", async () => {
  equal(await loadApp({ csv: "band,name,bottom_color,shirt_color\nA,N,unknown,white" }), "error");
  assert(text("#chart-status").includes("Unsupported bottom_color"), "Unknown colour silently accepted");
  equal(count("#viz svg"), 0);
});
await test("Missing D3 library is a visible startup error", async () => {
  equal(await loadApp({ missingLibrary: true }), "error");
  assert(text("#chart-status").includes("local D3 library"), "Missing-library diagnostic not visible");
});
await test("Final clean load succeeds after all failure cases", async () => {
  equal(await loadApp(), "ready");
  equal(count(".band-mark"), 55);
});
document.querySelector("#status").textContent = `${results.filter(result => result.passed).length}/${results.length} browser tests passed.`;
document.body.dataset.testResult = results.every(result => result.passed) ? "passed" : "failed";
