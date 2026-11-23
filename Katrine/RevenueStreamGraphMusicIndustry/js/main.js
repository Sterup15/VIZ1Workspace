const fileNameCSV = "music_data.csv"

function visualizeData(data) {
}

d3.csv(`../data/${fileNameCSV}`).then(visualizeData);



