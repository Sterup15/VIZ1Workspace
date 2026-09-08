import {fetchJson} from "./api.js"; 
import {formatRawData, groupData, getStats, getFirstAndLastDate} from "./exploring.js"; 
import {visualizeBarChartExercise2} from "./visualize_exercise2.js"


async function init() {
  // Exercise 1
  const raw_data = await fetchJson();
  const formattedData = formatRawData(raw_data);

  const groupedData = groupData(formattedData);
  const stats = getStats(groupedData); 
  const firstAndLastDate = getFirstAndLastDate(formattedData)
 
  const svg = d3.select("#container_ex1");
  const rectangles = svg.selectAll("rect")
  .data(groupedData)
  .join("rect")

  console.log(rectangles)

  // Exercise 2
  visualizeBarChartExercise2(formattedData); 

}

init();


