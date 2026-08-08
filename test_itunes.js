const fs = require('fs');

async function testItunes() {
  const res = await fetch("https://itunes.apple.com/search?term=vasaikar+masala&media=music&limit=1");
  const json = await res.json();
  console.log(JSON.stringify(json.results[0], null, 2));
}

testItunes();
