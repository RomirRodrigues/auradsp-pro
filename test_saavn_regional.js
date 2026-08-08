const fs = require('fs');

async function checkSaavn() {
  console.log("Checking JioSaavn for 'vasaikar masala'...");
  try {
    const res = await fetch("https://saavn.sumit.co/api/search/songs?query=vasaikar%20masala");
    const json = await res.json();
    console.log(json.data.results.map(t => t.name).join(', '));
  } catch (e) {
    console.error("Saavn error", e);
  }
}

checkSaavn();
