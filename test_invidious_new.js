const fs = require('fs');

async function testInvidious() {
  console.log("Fetching instances...");
  try {
    const instRes = await fetch("https://api.invidious.io/instances.json?sort_by=health");
    const instances = await instRes.json();
    
    // Filter for https, api enabled, cors enabled
    const validInstances = instances
      .map(i => i[1])
      .filter(i => i.type === 'https' && i.api === true && i.cors === true)
      .slice(0, 5); // Take top 5 healthy

    for (const inst of validInstances) {
      console.log(`Testing ${inst.uri}...`);
      try {
        const searchRes = await fetch(`${inst.uri}/api/v1/search?q=vasaikar+masala&type=video`, { signal: AbortSignal.timeout(5000) });
        if (!searchRes.ok) throw new Error(`HTTP ${searchRes.status}`);
        const results = await searchRes.json();
        if (results.length > 0) {
          console.log(`Found: ${results[0].title} on ${inst.uri}`);
          
          // Try to get video details (audio stream)
          const vidId = results[0].videoId;
          const detailsRes = await fetch(`${inst.uri}/api/v1/videos/${vidId}`, { signal: AbortSignal.timeout(5000) });
          const details = await detailsRes.json();
          const audioFormats = details.adaptiveFormats?.filter(f => f.type.startsWith('audio/'));
          
          if (audioFormats && audioFormats.length > 0) {
             console.log(`SUCCESS! Audio stream found: ${audioFormats[0].url.substring(0, 50)}...`);
             return;
          } else {
             console.log("No audio formats found.");
          }
        }
      } catch (e) {
        console.log(` Failed: ${e.message}`);
      }
    }
  } catch (e) {
    console.error("Error", e);
  }
}

testInvidious();
