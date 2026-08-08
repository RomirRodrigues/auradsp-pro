const fs = require('fs');

async function testInvidious2() {
  console.log("Fetching instances...");
  try {
    const instRes = await fetch("https://api.invidious.io/instances.json?sort_by=health");
    const instances = await instRes.json();
    
    const validInstances = instances
      .map(i => i[1])
      .filter(i => i.type === 'https' && i.api === true && i.cors === true);

    for (const inst of validInstances.slice(0, 15)) {
      console.log(`Testing ${inst.uri}...`);
      try {
        const searchRes = await fetch(`${inst.uri}/api/v1/search?q=vasaikar+masala&type=video`, { signal: AbortSignal.timeout(5000) });
        if (!searchRes.ok) continue;
        
        const contentType = searchRes.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) continue;
        
        const results = await searchRes.json();
        if (results.length > 0) {
          console.log(`Found: ${results[0].title} on ${inst.uri}`);
          const vidId = results[0].videoId;
          
          const detailsRes = await fetch(`${inst.uri}/api/v1/videos/${vidId}`, { signal: AbortSignal.timeout(5000) });
          if (!detailsRes.ok) continue;
          
          const detailsContentType = detailsRes.headers.get("content-type");
          if (!detailsContentType || !detailsContentType.includes("application/json")) continue;

          const details = await detailsRes.json();
          const audioFormats = details.adaptiveFormats?.filter(f => f.type.startsWith('audio/'));
          
          if (audioFormats && audioFormats.length > 0) {
             console.log(`SUCCESS! Audio stream found: ${audioFormats[0].url.substring(0, 50)}...`);
             return; // Stop on first FULL success
          }
        }
      } catch (e) {
        // keep going
      }
    }
  } catch (e) {
    console.error("Error", e);
  }
}

testInvidious2();
