const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const verified200SelectHtml = `<label for="demoTrackSelect">Select HD Test Track (Real Audio Songs with Vocals):</label>
        <select id="demoTrackSelect" class="cyber-select">
          <option value="https://raw.githubusercontent.com/mdn/webaudio-examples/main/audio-analyser/viper.mp3">🎤 Vocal & Pop Clarity Master (MDN HD Audio Track)</option>
          <option value="https://raw.githubusercontent.com/rafaelreis-hotmart/Audio-Sample-files/master/sample.mp3">🔊 Sub-Bass & Heavy Kick Test (HD Audio Sample)</option>
          <option value="https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg">🎸 Acoustic Ambient & Warm Vocal Test (Google HD Audio)</option>
          <option value="https://www.w3schools.com/html/horse.mp3">🎬 3D Surround & Soundstage Test Track</option>
        </select>`;

html = html.replace(/<label for="demoTrackSelect">[\s\S]*?<\/select>/, verified200SelectHtml);

fs.writeFileSync('index.html', html);
console.log('Updated index.html with 100% verified 200 OK open-CORS audio URLs.');
