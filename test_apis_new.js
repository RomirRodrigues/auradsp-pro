const fs = require('fs');

async function testApis() {
  console.log("Testing Audius...");
  try {
    const audiusRes = await fetch("https://discoveryprovider.audius.co/v1/tracks/search?query=hello&app_name=auradsp");
    const audiusJson = await audiusRes.json();
    console.log("Audius:", audiusJson.data.length, "results");
    console.log("Sample Audius track:", audiusJson.data[0]?.title);
  } catch (e) {
    console.error("Audius error", e);
  }

  console.log("Testing Jamendo...");
  try {
    const jamendoRes = await fetch("https://api.jamendo.com/v3.0/tracks/?client_id=56d30c95&format=json&limit=2&search=hello");
    const jamendoJson = await jamendoRes.json();
    console.log("Jamendo:", jamendoJson.results?.length, "results");
    console.log("Sample Jamendo track:", jamendoJson.results[0]?.name);
  } catch (e) {
    console.error("Jamendo error", e);
  }
}

testApis();
