export  async function fetchJson() {
  const raw_data = await d3.json("./data/going_out_in_horsens_kw.json");
  // console.log(raw_data);
  return raw_data;
}