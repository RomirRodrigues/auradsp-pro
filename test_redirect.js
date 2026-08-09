const https = require('https');

function checkUrl(url) {
  https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log(`Redirect ${res.statusCode} -> ${res.headers.location}`);
      checkUrl(res.headers.location);
    } else {
      console.log(`FINAL URL Status: ${res.statusCode}, Type: ${res.headers['content-type']}, CORS: ${res.headers['access-control-allow-origin']}`);
    }
  });
}

checkUrl('https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/Dhalius_-_01_-_Intro.mp3');
