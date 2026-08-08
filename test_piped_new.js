const fs = require('fs');

const PIPED_INSTANCES = [
  'https://pipedapi.kavin.rocks',
  'https://piped-api.lunar.icu',
  'https://api.piped.privacydev.net',
  'https://pipedapi.smnz.de'
];

async function testPiped() {
  for (const instance of PIPED_INSTANCES) {
    console.log(`Testing ${instance}...`);
    try {
      const res = await fetch(`${instance}/search?q=vasaikar+masala&filter=music_songs`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const first = json.items[0];
      if (first) {
        console.log(`Found: ${first.title} on ${instance}`);
        
        // Try getting streams
        const streamRes = await fetch(`${instance}/streams/${first.url.split('?v=')[1]}`, { signal: AbortSignal.timeout(5000) });
        const streamJson = await streamRes.json();
        const audioStreams = streamJson.audioStreams;
        if (audioStreams && audioStreams.length > 0) {
          console.log(` SUCCESS! Audio streams found. Format: ${audioStreams[0].mimeType}, URL: ${audioStreams[0].url.substring(0, 50)}...`);
          return; // Stop on first success
        }
      }
    } catch (e) {
      console.log(` Failed: ${e.message}`);
    }
  }
}

testPiped();
