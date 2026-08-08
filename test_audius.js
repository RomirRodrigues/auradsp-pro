const fs = require('fs');

async function testAudius() {
  const audiusRes = await fetch("https://discoveryprovider.audius.co/v1/tracks/search?query=hello&app_name=auradsp");
  const audiusJson = await audiusRes.json();
  console.log(JSON.stringify(audiusJson.data[0], null, 2));
}

testAudius();
