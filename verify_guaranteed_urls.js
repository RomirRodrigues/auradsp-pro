const https = require('https');

const testUrls = [
  'https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3',
  'https://www.w3schools.com/html/horse.mp3',
  'https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3',
  'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg'
];

testUrls.forEach((url, i) => {
  https.get(url, (res) => {
    console.log(`URL ${i+1}: ${url} -> Status: ${res.statusCode}, Type: ${res.headers['content-type']}, CORS: ${res.headers['access-control-allow-origin']}`);
  }).on('error', (e) => {
    console.error(`URL ${i+1} Error:`, e.message);
  });
});
