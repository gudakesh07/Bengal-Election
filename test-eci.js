fetch("https://results.eci.gov.in/ResultAcGenMay2026/election-json-S25-live.json")
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data).slice(0, 500)))
  .catch(console.error);
