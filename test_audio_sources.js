const https = require('https');

const testUrls = [
  'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/Dhalius_-_01_-_Intro.mp3',
  'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/Dhalius_-_05_-_Cross.mp3',
  'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/Dhalius_-_03_-_Regrets.mp3',
  'https://ia800905.us.archive.org/19/items/FREE_background_music_dhalius/Dhalius_-_02_-_Earth.mp3'
];

testUrls.forEach((url, i) => {
  https.get(url, (res) => {
    console.log(`URL ${i+1} Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}, CORS: ${res.headers['access-control-allow-origin']}`);
  }).on('error', (e) => {
    console.error(`URL ${i+1} Error:`, e.message);
  });
});
