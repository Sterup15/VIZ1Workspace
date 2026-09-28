// Load the data here

// Create your visualization 
function createViz(data, songCategories) {
  let model = {
    // Include values in the model if it is part of the state needed to render the view 
  }

  // DOM
  function initDOM() {
  }

  const dom = initDOM();
  const viz = initViz(model);

  function initSlider(model) {
    function onYearsSlider(values) {
      update({ selectedYears: values.split(",") });
    }

    const dataYearsArray = Array.from(model.data.map(d => parseInt(d.top_10_debut_date_as_decimal)))
    const yearsRange = d3.range(d3.min(dataYearsArray), d3.max(dataYearsArray));

    return new rSlider({
      target: '#yearsSlider',
      values: yearsRange,
      range: true,
      tooltip: true,
      scale: true,
      labels: false,
      set: yearsRange,
      onChange: onYearsSlider
    });
  }

  function initLegend(model) {

  }

  function initOptions(model) {

  }

  function formatDataGroups(data) {
    //Use D3 roll-up (group by + aggregate)
    //Parts:
    //data 
    //reduceFn --> how to do within each group
    //keyFn --> how to group by 

    return groupedArray;
  }

  // Viz
  function initViz(model) {
  }

  // Update
  function update(patch) {
  }

  // View
  function view(dom, model, viz) {
  }

  // Events
  function initEvents(dom, model, viz) {
  }


  // Init
  function init(model) {
    initSlider(model);
    initEvents(dom, model, viz);
    initLegend(model);
    initOptions(model);
    view(dom, model, viz);
  }

  init(model);
}
