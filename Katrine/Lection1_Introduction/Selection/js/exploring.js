
export function formatRawData(raw_data) {
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

export function groupData(dataToGroup) {
  return d3.group(dataToGroup, (datum) => datum.type);
}

export function getStats(groupedData) {
  const stats = [];

  groupedData.forEach((values, key) => {
    const min = d3.min(values, (d) => d.value);
    const max = d3.max(values, (d) => d.value);
    const count = values.length;

    console.log(key, { min, max, count });
    stats.push({ type: key, min, max, count });
  });

  console.log("Stats: ", stats);
  return stats; 
}

export function getFirstAndLastDate(data) {
  const firstDate = d3.min(data, (datum) => datum.date);
  const lastDate = d3.max(data, (datum) => datum.date);
  console.log("First date: " + firstDate);
  console.log("Last date: " + lastDate);

  return firstDate, lastDate; 
}
