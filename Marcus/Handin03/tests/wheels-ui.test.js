import { runTests } from "./wheels.test.js";

const frame = document.querySelector("#app");
const results = [];
const appURL = new URL("../", location.href);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const equal = (a, b) => assert(JSON.stringify(a) === JSON.stringify(b), `Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
const doc = () => frame.contentDocument;
const count = selector => doc().querySelectorAll(selector).length;
const text = selector => doc().querySelector(selector).textContent;
const slot = name => [...doc().querySelectorAll(".band-slot")].find(node => node.dataset.band === name);
const choose = name => {
  const select = doc().querySelector("#band-select");
  select.value = name;
  select.dispatchEvent(new frame.contentWindow.Event("change", { bubbles: true }));
};
const key = (element, value) => element.dispatchEvent(new frame.contentWindow.KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true }));
function report(result) {
  results.push(result);
  const li = document.createElement("li");
  li.className = result.passed ? "pass" : "fail";
  li.textContent = `${result.passed ? "PASS" : "FAIL"}: ${result.name}${result.error ? ` - ${result.error}` : ""}`;
  document.querySelector("#results").append(li);
}
async function test(name, action) {
  try { await action(); report({ name, passed: true }); }
  catch (error) { report({ name, passed: false, error: error.message }); }
}
const csvResponse = await fetch(new URL("boys.csv", appURL));
if (!csvResponse.ok) throw new Error(`CSV load failed: ${csvResponse.status}`);
runTests(window.d3, await csvResponse.text()).forEach(report);
const response = await fetch(new URL("comparison.html", appURL));
if (!response.ok) throw new Error(`Page load failed: ${response.status}`);
const html = await response.text();

async function load({ csv, status = 200, missingLibrary = false } = {}) {
  let head = `<base href="${appURL.href}">`;
  if (csv !== undefined) head += `<script>window.fetch = async () => new Response(${JSON.stringify(csv)}, {status:${status}});</script>`;
  let source = html.replace("<head>", `<head>${head}`);
  if (missingLibrary) source = source.replace('src="js/vendor/d3.v7.min.js"', 'src="js/vendor/intentionally-missing.js"');
  const loaded = new Promise(resolve => { frame.onload = resolve; });
  frame.srcdoc = source;
  await loaded;
  for (let attempt = 0; attempt < 160; attempt++) {
    if (["ready", "error"].includes(doc().body.dataset.appState)) return doc().body.dataset.appState;
    await sleep(50);
  }
  throw new Error("App did not reach ready/error within 8 seconds.");
}

await test("Five wheels contain 55 aligned band slots and 110 garment tracks", async () => {
  equal(await load(), "ready");
  equal([count(".wheel-card"), count(".band-slot"), count(".track"), count(".wheel-average")], [5, 55, 110, 10]);
  assert(doc().querySelector("#detail-content").hidden, "Unexpected initial selection");
  equal(count("#band-select option"), 56);
  assert(text("#finding").includes("4-member"), "Missing data-grounded comparison");
  equal(count(".small-sample"), 2);
});
await test("Centre values show both group averages with garment labels", () => {
  const means = [...doc().querySelectorAll('.wheel-card[data-size="4"] .wheel-average')].map(node => node.textContent);
  equal(means, ["Bottoms 80.2%", "Shirts 58.7%"]);
  assert(text('.wheel-card[data-size="4"] .coverage').includes("1 band with missing"), "Missing coverage note");
});
await test("Every score arc uses the actual score fraction and correct track colour", () => {
  for (const element of doc().querySelectorAll(".score-fill")) {
    const data = element.__data__;
    const garment = element.classList.contains("bottom_color") ? "bottom_color" : "shirt_color";
    const score = data.band.summaries[garment].score;
    equal(element.getAttribute("fill"), garment === "bottom_color" ? "#0072b2" : "#c44b00");
    if (score === 0 || score === null) equal(element.getAttribute("d"), null);
    else assert(element.getAttribute("d") && !/NaN|undefined/.test(element.getAttribute("d")), "Invalid arc");
  }
});
await test("Shai exposes both scores, pair counts, ties and the same four members", () => {
  choose("Shai");
  equal(text("#detail-title"), "Shai");
  equal(text('.band-score[data-garment="bottom_color"] .value'), "33.3%");
  equal(text('.band-score[data-garment="shirt_color"] .value'), "0%");
  equal(text('.band-score[data-garment="bottom_color"] .pairs'), "2 matching pairs out of 6.");
  equal(count("#members tr"), 4);
  assert(text("#modes").includes("Tied: black, navy blue"), "Mode tie lost");
  equal(slot("Shai").getAttribute("aria-pressed"), "true");
});
await test("Incomplete shirts remain 100% of known pairs, not all four members", () => {
  choose("Son by Four");
  equal(text('.band-score[data-garment="bottom_color"] .pairs'), "1 matching pair out of 6.");
  equal(text('.band-score[data-garment="shirt_color"] .value'), "100%");
  assert(text('.band-score[data-garment="shirt_color"] .known').includes("3 of 4"), "Missing denominator");
  assert(text("#members").includes("Missing"), "Missing member evidence");
});
await test("Keyboard selection, focus tooltip, Escape and clear-focus recovery", () => {
  const band = slot("Shai");
  band.focus({ preventScroll: true });
  assert(!doc().querySelector("#tooltip").hidden, "No focus tooltip");
  equal(frame.contentWindow.getComputedStyle(band).outlineStyle, "none");
  key(band, "Escape");
  assert(doc().querySelector("#tooltip").hidden, "Escape did not dismiss");
  key(band, "Enter");
  equal(text("#detail-title"), "Shai");
  const clear = doc().querySelector("#clear-selection");
  clear.focus();
  clear.click();
  equal(doc().activeElement.id, "band-select");
  assert(doc().querySelector("#detail-content").hidden, "Clear left stale evidence");
  equal(count("#members tr"), 0);
});
await test("Twenty selections never duplicate arcs, tracks or member rows", () => {
  const paths = [...doc().querySelectorAll(".score-fill")].map(node => node.getAttribute("d"));
  for (let i = 0; i < 20; i++) {
    choose("Shai"); equal(count("#members tr"), 4);
    choose("Hanson"); equal(count("#members tr"), 3);
    choose(""); equal(count("#members tr"), 0);
  }
  equal([count(".band-slot"), count(".track")], [55, 110]);
  equal([...doc().querySelectorAll(".score-fill")].map(node => node.getAttribute("d")), paths);
});
await test("Responsive wheels and evidence stay readable without page overflow", async () => {
  try {
    for (const width of [1440, 1200, 1024, 960, 959, 768, 500, 390]) {
      frame.style.width = `${width}px`;
      choose("Son by Four");
      await sleep(50);
      assert(doc().documentElement.scrollWidth <= frame.contentWindow.innerWidth + 1, `Page overflow at ${width}`);
      const grid = doc().querySelector("#wheels").getBoundingClientRect();
      const evidence = doc().querySelector(".evidence").getBoundingClientRect();
      if (width >= 960) assert(evidence.left >= grid.right, `Evidence not beside wheels at ${width}`);
      else assert(evidence.top >= grid.bottom, `Evidence overlaps wheels at ${width}`);
      for (const svg of doc().querySelectorAll(".wheel-card svg")) {
        const bounds = svg.getBoundingClientRect();
        assert(bounds.width >= 185, `Wheel too narrow at ${width}`);
        for (const label of svg.querySelectorAll("text")) {
          const box = label.getBoundingClientRect();
          assert(box.left >= bounds.left && box.right <= bounds.right, `Label clipped at ${width}`);
        }
      }
    }
  } finally { frame.style.width = "100%"; choose(""); }
});
await test("200% CSS magnification keeps page and controls contained", async () => {
  frame.style.width = "1440px";
  doc().documentElement.style.zoom = "2";
  await sleep(50);
  try {
    assert(doc().documentElement.scrollWidth <= frame.contentWindow.innerWidth + 1, "Magnified page overflow");
    for (const svg of doc().querySelectorAll(".wheel-card svg")) {
      assert(svg.getBoundingClientRect().width >= 370, "Magnification made the wheels too small to read");
    }
    const select = doc().querySelector("#band-select").getBoundingClientRect();
    assert(select.right <= frame.contentWindow.innerWidth, "Magnified selector clipped");
  } finally { doc().documentElement.style.zoom = ""; frame.style.width = "100%"; }
});
await test("Track outlines, garment fills and text meet contrast thresholds", () => {
  const css = node => frame.contentWindow.getComputedStyle(node);
  const luminance = colour => {
    const channels = colour.match(/[0-9.]+/g).slice(0, 3).map(Number).map(value => value / 255)
      .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
  };
  const ratio = (a, b) => {
    const values = [luminance(a), luminance(b)].sort((x, y) => x - y);
    return (values[1] + .05) / (values[0] + .05);
  };
  const paper = css(doc().body).backgroundColor;
  const track = css(doc().querySelector(".track"));
  assert(ratio(track.stroke, paper) >= 3, "Unfilled track outline lacks contrast");
  for (const arc of doc().querySelectorAll(".score-fill")) assert(ratio(css(arc).fill, track.fill) >= 3, "Filled fraction lacks contrast");
  for (const label of doc().querySelectorAll(".wheel-average, .average-label")) assert(ratio(css(label).fill, paper) >= 4.5, "Centre text lacks contrast");
});
await test("Unavailable slots are hatched, selectable and excluded from group means", async () => {
  const csv = "band,name,bottom_color,shirt_color\nTest,A,,black\nTest,B,,white\nTest,C,,";
  equal(await load({ csv }), "ready");
  equal(count(".band-slot"), 1);
  assert(text('.wheel-average[data-garment="bottom_color"]').includes("Unavailable"), "Unavailable average changed to zero");
  const track = doc().querySelector(".track.bottom_color");
  assert(frame.contentWindow.getComputedStyle(track).fill.includes("unavailable"), "Missing hatch");
  choose("Test");
  equal(text('.band-score[data-garment="bottom_color"] .value'), "Unavailable");
  equal(text('.band-score[data-garment="shirt_color"] .value'), "0%");
  equal(count("#members tr"), 3);
});
await test("CSV text is displayed literally, never interpreted as HTML", async () => {
  equal(await load({ csv: "band,name,bottom_color,shirt_color\n<img src=x>,<b>Member</b>,black,white\n<img src=x>,Other,black,white" }), "ready");
  choose("<img src=x>");
  equal(text("#detail-title"), "<img src=x>");
  assert(text("#members").includes("<b>Member</b>"), "Record changed");
  equal(count(".evidence img, .evidence b"), 0);
});
for (const [name, options, diagnostic] of [
  ["HTTP failure", { csv: "missing", status: 404 }, "HTTP 404"],
  ["invalid data", { csv: "band,name,bottom_color,shirt_color\nA,N,unknown,white" }, "Unsupported"],
  ["missing D3", { missingLibrary: true }, "local D3"]
]) await test(`${name} fails visibly with controls disabled`, async () => {
  equal(await load(options), "error");
  assert(text("#load-status").includes(diagnostic), "Missing diagnostic");
  assert(doc().querySelector("#band-select").disabled, "Selector still enabled");
});
await test("Invalid selection is an explicit update error", async () => {
  equal(await load(), "ready");
  const option = doc().createElement("option");
  option.value = "Unknown"; option.textContent = "Unknown";
  doc().querySelector("#band-select").append(option);
  choose("Unknown");
  equal(doc().body.dataset.appState, "error");
  assert(text("#load-status").includes("Unknown selected band"), "Missing update diagnostic");
  assert(doc().querySelector("#band-select").disabled, "Selector still enabled");
});
await test("Final clean load and original-version link remain available", async () => {
  equal(await load(), "ready");
  equal(count(".band-slot"), 55);
  equal(doc().querySelector("nav a").getAttribute("href"), "index.html");
});
document.querySelector("#status").textContent = `${results.filter(result => result.passed).length}/${results.length} tests passed.`;
document.body.dataset.testResult = results.every(result => result.passed) ? "passed" : "failed";
