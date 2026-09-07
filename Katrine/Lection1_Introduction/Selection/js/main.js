// Select the container
const svg = d3.select("#container");

// Select the first path
const select = d3.select("rect");

// Select all paths in the selection
const selectAll = d3.selectAll("rect");

console.log("svg", svg);
console.log("select", select);
console.log("selectAll", selectAll);

const addText = d3.selectAll("rect").append("p");
console.log("test", addText);

async function fetchJson() {
  const raw_data = await d3.json("./data/going_out_in_horsens_kw.json");
  // console.log(raw_data);
  return raw_data;
}

function formatRawData(raw_data) {
  return raw_data.flatMap(formatSingleLine);
}

function formatSingleLine(datum) {
  const date = new Date(datum.date);
  const entries = Object.entries(datum).filter(
    ([key, value]) => key !== "date" && key !== "isPartial",
  );

  return entries.map(([key, value]) => {
    return {
      date: date,
      type: key,
      value: value,
    };
  });
}

function groupData(dataToGroup) {
  return d3.group(dataToGroup, (datum) => datum.type);
}

async function init() {
  const raw_data = await fetchJson();
  const formattedData = formatRawData(raw_data);

  const groupedData = groupData(formattedData);
  const stats = [];

  groupedData.forEach((values, key) => {
    const min = d3.min(values, (d) => d.value);
    const max = d3.max(values, (d) => d.value);
    const count = values.length;

    console.log(key, { min, max, count });
    stats.push({ type: key, min, max, count });
  });

  const firstDate = d3.min(formattedData, (datum) => datum.date);
  const lastDate = d3.max(formattedData, (datum) => datum.date);

  console.log("Stats: ", stats);
  console.log("First date: " + firstDate);
  console.log("Last date: " + lastDate);
}

init();
