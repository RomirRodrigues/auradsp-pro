const fs = require('fs');
async function checkSaavnFull() {
  const res = await fetch("https://saavn.sumit.co/api/search/songs?query=vasaikar%20masala");
  const json = await res.json();
  console.log(JSON.stringify(json.data.results[0], null, 2));
}
checkSaavnFull();
