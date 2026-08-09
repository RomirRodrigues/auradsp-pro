const fs = require('fs');

// --- 1. REMOVE #startSynthBeatBtn FROM INDEX.HTML AND POLISH UI ---
let html = fs.readFileSync('index.html', 'utf8');

// Remove startSynthBeatBtn and divider-text completely
html = html.replace(/<button id="startSynthBeatBtn"[\s\S]*?<\/button>\s*<div class="divider-text">OR TEST AUDIO FILES<\/div>/, '');

fs.writeFileSync('index.html', html);
console.log('Removed startSynthBeatBtn from index.html.');

// --- 2. UPDATE AUDIO-ENGINE.JS WITH MASTER UNIFIED PLAYBACK CONTROLLER ---
let engine = fs.readFileSync('js/audio/audio-engine.js', 'utf8');

const unifiedPlaybackEngineMethods = `
  // --- MASTER UNIFIED PLAYBACK CONTROLLER ---
  playMediaStream(url) {
    this.resumeCtx();
    this.stopAllSources();
    
    const player = document.getElementById('audioPlayer');
    if (!player) return Promise.reject("Audio player element not found");

    player.src = url;
    player.volume = 1.0;
    player.muted = false;
    player.crossOrigin = "anonymous";
    player.load();

    this.connectMediaElement(player);
    this.activeSource = 'file';
    this.isPlaying = true;

    return player.play();
  }

  toggleMediaPlayback() {
    this.resumeCtx();
    const player = document.getElementById('audioPlayer');
    if (!player) return false;

    if (this.bufferSourceNode) {
      if (this.isBufferPlaying) {
        try { this.bufferSourceNode.stop(); } catch(e) {}
        this.isBufferPlaying = false;
        this.isPlaying = false;
        return false;
      }
    }

    if (player.paused) {
      player.play().catch(e => console.warn("Player play error:", e));
      this.isPlaying = true;
      return true;
    } else {
      player.pause();
      this.isPlaying = false;
      return false;
    }
  }
`;

if (!engine.includes('playMediaStream(url)')) {
  engine = engine.replace('window.audioEngine = new AudioEngine();', unifiedPlaybackEngineMethods + '\nwindow.audioEngine = new AudioEngine();');
  fs.writeFileSync('js/audio/audio-engine.js', engine);
  console.log('Added playMediaStream and toggleMediaPlayback to js/audio/audio-engine.js.');
}

// --- 3. REWRITE PLAY/PAUSE BUTTON HANDLERS IN APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

// Remove any references to startSynthBeatBtn in app.js
app = app.replace(/\s*const startSynthBeatBtn = document\.getElementById\('startSynthBeatBtn'\);[\s\S]*?startSynthBeatBtn\.addEventListener\('click'[\s\S]*?\}\);/, '');

// Replace playPauseBtn handler in Demo panel
const proDemoPlayHandler = `  // --- 100% PRO DAW DEMO TRACK PLAY/PAUSE CONTROLLER ---
  playPauseBtn.addEventListener('click', async () => {
    if (window.audioEngine) window.audioEngine.resumeCtx();

    const selectedUrl = demoTrackSelect ? demoTrackSelect.value : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3';

    // If currently playing this demo track, toggle pause/play
    if (isPlaying && audioPlayer.src === selectedUrl) {
      if (audioPlayer.paused) {
        audioPlayer.play();
        isPlaying = true;
        if (window.audioEngine) window.audioEngine.isPlaying = true;
        playText.textContent = "Pause Track";
        playIcon.textContent = "⏸";
      } else {
        audioPlayer.pause();
        isPlaying = false;
        if (window.audioEngine) window.audioEngine.isPlaying = false;
        playText.textContent = "Play Selected Track";
        playIcon.textContent = "▶";
      }
      return;
    }

    // New Track Playback
    if (window.audioEngine) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
    }

    playText.textContent = "Loading Track...";
    playIcon.textContent = "⏳";

    if (window.audioEngine) {
      window.audioEngine.playMediaStream(selectedUrl)
        .then(() => {
          isPlaying = true;
          if (window.audioEngine) window.audioEngine.isPlaying = true;
          playText.textContent = "Pause Track";
          playIcon.textContent = "⏸";
          if (window.showToast) window.showToast("Playing Pro HD Audio Track", "success");
        })
        .catch(err => {
          console.warn("MediaStream error, attempting fallback:", err);
          audioPlayer.play().then(() => {
            isPlaying = true;
            if (window.audioEngine) window.audioEngine.isPlaying = true;
            playText.textContent = "Pause Track";
            playIcon.textContent = "⏸";
          });
        });
    }
  });

  // Track select change listener
  demoTrackSelect.addEventListener('change', () => {
    if (isPlaying) {
      isPlaying = false;
      playPauseBtn.click();
    }
  });`;

app = app.replace(/\/\/ Play \/ Pause Selected HD Audio Track[\s\S]*?demoTrackSelect\.addEventListener\("change"[\s\S]*?\}\);/, proDemoPlayHandler);

// Replace webPlayPauseBtn handler in Web Music Streamer panel
const proWebPlayPauseHandler = `  if (webPlayPauseBtn) {
    webPlayPauseBtn.addEventListener('click', () => {
      if (!currentWebTrack) return;
      if (window.audioEngine) window.audioEngine.resumeCtx();

      if (audioPlayer.paused) {
        audioPlayer.play()
          .then(() => {
            isPlaying = true;
            if (window.audioEngine) window.audioEngine.isPlaying = true;
            if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
          })
          .catch(err => console.error("Web play error:", err));
      } else {
        audioPlayer.pause();
        isPlaying = false;
        if (window.audioEngine) window.audioEngine.isPlaying = false;
        if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
      }
    });
  }`;

app = app.replace(/if \(webPlayPauseBtn\)\s*\{\s*webPlayPauseBtn\.addEventListener\('click'[\s\S]*?\}\s*\}\s*\}/, proWebPlayPauseHandler);

// Synchronize audioPlayer event listeners
const playerSyncEvents = `
  audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    if (window.audioEngine) window.audioEngine.isPlaying = true;
    if (playText) playText.textContent = "Pause Track";
    if (playIcon) playIcon.textContent = "⏸";
    if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>⏸ Pause Track</span>";
  });

  audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    if (window.audioEngine) window.audioEngine.isPlaying = false;
    if (playText) playText.textContent = "Play Selected Track";
    if (playIcon) playIcon.textContent = "▶";
    if (webPlayPauseBtn) webPlayPauseBtn.innerHTML = "<span>▶ Play Track</span>";
  });
`;

if (!app.includes("audioPlayer.addEventListener('play'")) {
  app = app.replace("audioPlayer.addEventListener('timeupdate', () => {", playerSyncEvents + "\n  audioPlayer.addEventListener('timeupdate', () => {");
}

fs.writeFileSync('js/app.js', app);
console.log('Rewrote play/pause handlers and event sync in js/app.js.');
