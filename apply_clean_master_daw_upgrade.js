const fs = require('fs');

// 1. CLEAN INDEX.HTML
let html = fs.readFileSync('index.html', 'utf8');

// Remove startSynthBeatBtn and divider-text cleanly
html = html.replace(/<button id="startSynthBeatBtn"[\s\S]*?<\/button>\s*<div class="divider-text">OR TEST AUDIO FILES<\/div>/, '');

fs.writeFileSync('index.html', html);
console.log('Cleaned index.html.');

// 2. CLEAN APP.JS
let app = fs.readFileSync('js/app.js', 'utf8');

// Remove startSynthBeatBtn variables and handlers
app = app.replace(/\s*const startSynthBeatBtn = document\.getElementById\('startSynthBeatBtn'\);/, '');
app = app.replace(/\s*if \(startSynthBeatBtn\) \{[\s\S]*?\}\s*if \(filePlayPauseBtn\)/, '\n    if (filePlayPauseBtn)');

// Synchronize audioPlayer events in app.js
const audioSyncCode = `
  // Synchronize audioPlayer events across all UI controls
  audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    if (window.audioEngine) window.audioEngine.isPlaying = true;
    if (playText) playText.textContent = "Pause Track";
    if (playIcon) playIcon.textContent = "⏸";
    const webBtn = document.getElementById('webPlayPauseBtn');
    if (webBtn) webBtn.innerHTML = "<span>⏸ Pause Track</span>";
  });

  audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    if (window.audioEngine) window.audioEngine.isPlaying = false;
    if (playText) playText.textContent = "Play Selected Track";
    if (playIcon) playIcon.textContent = "▶";
    const webBtn = document.getElementById('webPlayPauseBtn');
    if (webBtn) webBtn.innerHTML = "<span>▶ Play Track</span>";
  });
`;

if (!app.includes("audioPlayer.addEventListener('play'")) {
  app = app.replace("audioPlayer.addEventListener('timeupdate', () => {", audioSyncCode + "\n  audioPlayer.addEventListener('timeupdate', () => {");
}

fs.writeFileSync('js/app.js', app);
console.log('Cleaned app.js.');
