const fs = require('fs');

// --- 1. UPDATE DEMOTRACKSELECT IN INDEX.HTML WITH REAL VOCAL & INSTRUMENTAL TRACKS ---
let html = fs.readFileSync('index.html', 'utf8');

const realVocalSelectHtml = `<label for="demoTrackSelect">Select HD Test Track (Real Audio Songs with Vocals):</label>
        <select id="demoTrackSelect" class="cyber-select">
          <option value="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3">🎤 Vocal & Pop Clarity Master (Real Song with Vocals)</option>
          <option value="https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=energetic-hip-hop-sub-bass-14250.mp3">🔊 Sub-Bass & Heavy Kick Test (Electronic Basshead)</option>
          <option value="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=acoustic-guitar-vocal-ambient-10657.mp3">🎸 Acoustic Guitar & Warm Vocal Test</option>
          <option value="https://cdn.pixabay.com/download/audio/2022/02/07/audio_d1469e38d7.mp3?filename=cinematic-surround-action-trailer-14022.mp3">🎬 3D Surround & Cinematic Theater Test</option>
        </select>`;

html = html.replace(/<label for="demoTrackSelect">[\s\S]*?<\/select>/, realVocalSelectHtml);
fs.writeFileSync('index.html', html);
console.log('Updated demoTrackSelect in index.html with Real Vocal Songs.');

// --- 2. UPDATE PLAY SELECTED TRACK HANDLER IN APP.JS ---
let app = fs.readFileSync('js/app.js', 'utf8');

const realTrackPlayHandler = `  // Play / Pause Selected HD Audio Track (Real Vocals & Songs)
  playPauseBtn.addEventListener('click', async () => {
    if (window.audioEngine) window.audioEngine.resumeCtx();

    if (isPlaying && audioEngine.activeSource === 'file' && audioPlayer.src === demoTrackSelect.value && !audioPlayer.paused) {
      audioPlayer.pause();
      isPlaying = false;
      playText.textContent = "Play Selected Track";
      playIcon.textContent = "▶";
      return;
    }

    const selectedUrl = demoTrackSelect ? demoTrackSelect.value : 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=pop-summer-vocal-112776.mp3';

    if (window.audioEngine) {
      window.audioEngine.stopAllSources();
      resetAllPlaybackUI();
      window.audioEngine.activeSource = 'file';
      window.audioEngine.connectMediaElement(audioPlayer);
    }

    audioPlayer.src = selectedUrl;
    audioPlayer.play()
      .then(() => {
        isPlaying = true;
        playText.textContent = "Pause Track";
        playIcon.textContent = "⏸";
        if (window.showToast) window.showToast("Playing Real HD Vocal Track", "success");
      })
      .catch(err => {
        console.error("Audio track play error:", err);
        // Fallback to synth groove if network blocks external audio load
        if (window.audioEngine) {
          window.audioEngine.activeSource = 'synth';
          window.audioEngine.startSynthGroove('bass');
          isPlaying = true;
          playText.textContent = "Pause Track";
          playIcon.textContent = "⏸";
        }
      });
  });

  // Track change listener
  demoTrackSelect.addEventListener('change', (e) => {
    if (isPlaying && audioEngine.activeSource === 'file') {
      playPauseBtn.click(); // Stop & restart with new URL
    }
  });`;

app = app.replace(/\/\/ Play \/ Pause Selected Track[\s\S]*?demoTrackSelect\.addEventListener\('change'[\s\S]*?\}\);/, realTrackPlayHandler);

fs.writeFileSync('js/app.js', app);
console.log('Updated playPauseBtn handler in app.js for Real Vocal Audio Songs.');
